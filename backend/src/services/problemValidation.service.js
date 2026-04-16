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

  if (/(?:public\s+)?class\s+Main\b/.test(code)) {
    return { ok: true, sourceCode: code };
  }

  const classMatch = code.match(
    /(?:public\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)\b/
  );
  if (!classMatch) {
    return {
      ok: false,
      message: "Java reference solution must define at least one class",
      hint: "Provide a class with a public static void main(String[] args) method",
    };
  }

  const primaryClassName = classMatch[1];

  // If a non-Main class is used, add a thin Main wrapper for judge execution.
  const dePublicizedSource = code.replace(
    new RegExp(`public\\s+class\\s+${primaryClassName}\\b`),
    `class ${primaryClassName}`
  );

  const wrappedSource = `${dePublicizedSource}\n\nclass Main {\n  public static void main(String[] args) {\n    ${primaryClassName}.main(args);\n  }\n}`;

  return { ok: true, sourceCode: wrappedSource };
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
    const batchAlreadyFinal = submitResult.every(
      (item) => (item.status?.id ?? item.status?._id ?? 0) > 2
    );

    const finalResults = batchAlreadyFinal
      ? submitResult
      : await submitToken(
          submitResult.map((item) => item.token).filter(Boolean)
        );

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
