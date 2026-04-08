import problemModel from "../models/problem.model.js";
import submissionModel from "../models/submit.model.js";
import userModel from "../models/user.model.js";
import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../utils/problemUtility.js";

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
      message: "Java submission must define class Main",
      hint: "Use class Main as the runnable class",
    };
  }

  const className = classMatch[1];
  if (className !== "Main") {
    return {
      ok: false,
      message: "Java submission must define class Main",
      hint: "Rename your top-level class to Main",
    };
  }

  return { ok: true };
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

    if (language === "java") {
      const validation = validateJavaMainClass(code);
      if (!validation.ok) {
        return res.status(400).json({
          message: validation.message,
          hint: validation.hint,
        });
      }
    }

    console.log(language);

    //    Fetch the problem from database
    const problem = await problemModel.findById(problemId);
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
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = "error";
          errorMessage = test.stderr;
        } else {
          status = "wrong";
          errorMessage = test.stderr;
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
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    //    Fetch the problem from database
    const problem = await Problem.findById(problemId);
    //    testcases(Hidden)
    language = language.toLowerCase().trim();
    if (language === "java") {
      const validation = validateJavaMainClass(code);
      if (!validation.ok) {
        return res.status(400).json({
          message: validation.message,
          hint: validation.hint,
        });
      }
    }

    //    Judge0 code ko submit karna hai

    const languageId = getLanguageById(language);

    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = false;
          errorMessage = test.stderr;
        } else {
          status = false;
          errorMessage = test.stderr;
        }
      }
    }

    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime,
      memory,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};
