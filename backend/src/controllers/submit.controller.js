import problemModel from "../models/problem.model.js";
import submissionModel from "../models/submit.model.js";
import userModel from "../models/user.model.js";
import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../utils/problemUtility.js";

const getJudgeStatusId = (test) =>
  test?.status_id ?? test?.status?.id ?? test?.status?._id ?? 0;

const getJudgeErrorMessage = (test) =>
  test?.stderr || test?.compile_output || test?.message || null;

function validateJavaMainClass(code) {
  if (typeof code !== "string") {
    return {
      ok: false,
      message: "Java code must be a string",
    };
  }

  if (!/\bpublic\s+static\s+void\s+main\s*\(/.test(code)) {
    return {
      ok: false,
      message: "Java submission must include main method",
      hint: "Add public static void main(String[] args)",
    };
  }

  const classMatch = code.match(/(?:public\s+)?class\s+([A-Za-z_$][\w$]*)/);
  if (!classMatch) {
    return {
      ok: false,
      message: "Java submission must define at least one class",
      hint: "Add a class containing public static void main(String[] args)",
    };
  }

  return { ok: true };
}

function prepareJavaSourceForJudge(code) {
  const validation = validateJavaMainClass(code);
  if (!validation.ok) {
    return validation;
  }

  if (/(?:public\s+)?class\s+Main\b/.test(code)) {
    return { ok: true, sourceCode: code };
  }

  const classMatch = code.match(/(?:public\s+)?class\s+([A-Za-z_$][\w$]*)/);
  if (!classMatch) {
    return {
      ok: false,
      message: "Java submission must define at least one class",
      hint: "Provide a class with a public static void main(String[] args)",
    };
  }

  const primaryClassName = classMatch[1];
  const dePublicizedSource = code.replace(
    new RegExp(`public\\s+class\\s+${primaryClassName}\\b`),
    `class ${primaryClassName}`
  );

  const wrappedSource = `${dePublicizedSource}\n\nclass Main {\n  public static void main(String[] args) {\n    ${primaryClassName}.main(args);\n  }\n}`;

  return { ok: true, sourceCode: wrappedSource };
}

export const submitCode = async (req, res) => {
  //
  try {
    const userId = req.user.id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    language = language.toLowerCase().trim();

    let sourceCodeForJudge = code;

    if (language === "java") {
      const prepared = prepareJavaSourceForJudge(code);
      if (!prepared.ok) {
        return res.status(400).json({
          message: prepared.message,
          hint: prepared.hint,
        });
      }
      sourceCodeForJudge = prepared.sourceCode;
    }

    //    Fetch the problem from database
    const problem = await problemModel.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    //    testcases(Hidden)

    //   Kya apne submission store kar du pehle....
    const submittedResult = await submissionModel.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    //    Judge0 code ko submit karna hai

    const languageId = getLanguageById(language);

    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: sourceCodeForJudge,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const batchAlreadyFinal = submitResult.every(
      (item) => getJudgeStatusId(item) > 2
    );

    const testResult = batchAlreadyFinal
      ? submitResult
      : await submitToken(
          submitResult.map((value) => value.token).filter(Boolean)
        );

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      const statusId = getJudgeStatusId(test);
      if (statusId === 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (statusId === 4) {
          status = "error";
          errorMessage = getJudgeErrorMessage(test);
        } else {
          status = "wrong";
          errorMessage = getJudgeErrorMessage(test);
        }
      }
    }

    // Store the result in Database in Submission
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not persent there.

    // req.result == user Information

    const alreadySolved = req.user.problemSolved.some(
      (id) => id.toString() === problemId.toString()
    );

    if (status === "accepted" && !alreadySolved) {
      req.user.problemSolved.push(problemId);
      await req.user.save();
    }

    const accepted = status == "accepted";
    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

export const runCode = async (req, res) => {
  //
  try {
    const userId = req.user.id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    let sourceCodeForJudge = code;

    //    Fetch the problem from database
    const problem = await problemModel.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    //    testcases(Hidden)
    language = language.toLowerCase().trim();
    if (language === "java") {
      const prepared = prepareJavaSourceForJudge(code);
      if (!prepared.ok) {
        return res.status(400).json({
          message: prepared.message,
          hint: prepared.hint,
        });
      }
      sourceCodeForJudge = prepared.sourceCode;
    }

    //    Judge0 code ko submit karna hai

    const languageId = getLanguageById(language);

    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: sourceCodeForJudge,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const batchAlreadyFinal = submitResult.every(
      (item) => getJudgeStatusId(item) > 2
    );

    const testResult = batchAlreadyFinal
      ? submitResult
      : await submitToken(
          submitResult.map((value) => value.token).filter(Boolean)
        );

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      const statusId = getJudgeStatusId(test);
      if (statusId === 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (statusId === 4) {
          status = false;
          errorMessage = getJudgeErrorMessage(test);
        } else {
          status = false;
          errorMessage = getJudgeErrorMessage(test);
        }
      }
    }

    const normalizedTestCases = testResult.map((test) => ({
      ...test,
      status_id: getJudgeStatusId(test),
    }));

    res.status(201).json({
      success: status,
      testCases: normalizedTestCases,
      runtime,
      memory,
      errorMessage,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};
