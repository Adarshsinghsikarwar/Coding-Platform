import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../utils/problemUtility.js";

function normalizeJavaForJudge(code) {
  const hasMainMethod = /public\s+static\s+void\s+main\s*\(/.test(code);
  if (!hasMainMethod) {
    return {
      ok: false,
      message: "Java reference solution must include main method",
      hint: "Add public static void main(String[] args) and print output",
    };
  }

  if (!/(?:public\s+)?class\s+Main\b/.test(code)) {
    return {
      ok: false,
      message: "Java reference solution must define class Main",
      hint: "Use class Main as the runnable class",
    };
  }

  return { ok: true, sourceCode: code };
}

function prepareSourceCodeForJudge(language, completeCode) {
  if (language.toLowerCase() !== "java") {
    return { ok: true, sourceCode: completeCode };
  }

  return normalizeJavaForJudge(completeCode);
}

function createHttpError(status, payload) {
  const error = new Error(payload?.message || "Request validation failed");
  error.status = status;
  error.payload = payload;
  return error;
}

export async function validateReferenceSolutions(
  visibleTestCases,
  referenceSolution
) {
  for (const { language, completeCode } of referenceSolution) {
    const languageId = getLanguageById(language);
    if (!languageId) {
      throw createHttpError(400, {
        message: `Unsupported language for judge: ${language}`,
      });
    }

    const prepared = prepareSourceCodeForJudge(language, completeCode);
    if (!prepared.ok) {
      throw createHttpError(400, {
        message: prepared.message,
        hint: prepared.hint,
      });
    }

    const submissions = visibleTestCases.map((testCase) => ({
      source_code: prepared.sourceCode,
      language_id: languageId,
      stdin: testCase.input,
      expected_output: testCase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((item) => item.token);
    const finalResults = await submitToken(resultToken);

    for (let i = 0; i < finalResults.length; i++) {
      const statusId =
        finalResults[i].status?.id ?? finalResults[i].status?._id;
      if (statusId !== 3) {
        throw createHttpError(400, {
          message: `Reference solution failed for language ${language} on test case ${
            i + 1
          }`,
          judge0Status: finalResults[i].status,
          stderr: finalResults[i].stderr,
          compile_output: finalResults[i].compile_output,
        });
      }
    }
  }
}

export function normalizeTags(tags) {
  if (typeof tags === "string") {
    return [tags];
  }

  return tags;
}
