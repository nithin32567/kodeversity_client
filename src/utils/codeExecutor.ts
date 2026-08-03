import axios from "axios";

export const executeCode = async (language: string, code: string) => {
  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language,
      version: "*", // Using "*" gets the latest version of the language
      files: [
        {
          content: code,
        },
      ],
    });
    return response.data;
  } catch (error) {
    console.error("Failed to execute code", error);
    throw error;
  }
};
