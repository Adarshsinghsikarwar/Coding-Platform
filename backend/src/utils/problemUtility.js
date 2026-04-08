import axios from "axios";
import { config } from "../config/config.js";

const buildJudge0Headers = (needsJson = false) => {
  const headers = {};

  if (needsJson) {
    headers["Content-Type"] = "application/json";
  }

  // Attach RapidAPI headers only when configured.
  if (config.RAPIDAPI_KEY && config.RAPIDAPI_HOST) {
    headers["x-rapidapi-key"] = config.RAPIDAPI_KEY;
    headers["x-rapidapi-host"] = config.RAPIDAPI_HOST;
  }

  return headers;
};

export const getLanguageById = (language) => {
  const languageMap = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };

  return languageMap[language.toLowerCase()] || null;
};

export const submitBatch = async (submissions) => {
  try {
    const options = {
      method: "POST",
      url: `${config.JUDGE0_URL}/submissions/batch`,
      params: {
        base64_encoded: "false",
        wait: "true",
      },
      headers: buildJudge0Headers(true),
      data: {
        submissions: submissions,
      },
    };

    const response = await axios.request(options);
    // Judge0 batch API shape can vary by mode/provider.
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data?.submissions)) {
      return response.data.submissions;
    }
    throw new Error("Unexpected Judge0 batch response format");
  } catch (err) {
    const apiMessage = err?.response?.data || err.message;
    console.error("Error submitting batch:", apiMessage);
    throw err;
  }
};

const waiting = async (timer) => {
  return new Promise((resolve) => setTimeout(resolve, timer));
};

export const submitToken = async (resultToken) => {
  try {
    const options = {
      method: "GET",
      url: `${config.JUDGE0_URL}/submissions/batch`,
      params: {
        tokens: resultToken.join(","),
        base64_encoded: "false",
        fields: "*",
      },
      headers: buildJudge0Headers(),
    };

    async function fetchData() {
      try {
        const response = await axios.request(options);
        return response.data;
      } catch (err) {
        const apiMessage = err?.response?.data || err.message;
        console.error("Error fetching batch results:", apiMessage);
        throw err;
      }
    }

    while (true) {
      const result = await fetchData();
      const IsresultObtained = result.submissions.every(
        (submission) =>
          (submission.status?.id ?? submission.status?._id ?? 0) > 2
      );
      if (IsresultObtained) {
        return result.submissions;
      }

      await waiting(1000);
    }
  } catch (err) {
    const apiMessage = err?.response?.data || err.message;
    console.error("Error in submitToken:", apiMessage);
    throw err;
  }
};
