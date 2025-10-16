// src/api.js
export async function sendMessageToModel(model, message) {
  try {
    let url = "";
    let headers = { "Content-Type": "application/json" };
    let body = {};

    switch (model) {
      case "gpt-4":
        url = "https://api.openai.com/v1/chat/completions";
        headers["Authorization"] = `Bearer ${import.meta.env.VITE_OPENAI_KEY}`;
        body = {
          model: "gpt-4",
          messages: [{ role: "user", content: message }],
        };
        break;

      case "claude":
        url = "https://api.anthropic.com/v1/messages";
        headers["x-api-key"] = import.meta.env.VITE_CLAUDE_KEY;
        body = {
          model: "claude-3-opus-20240229",
          max_tokens: 512,
          messages: [{ role: "user", content: message }],
        };
        break;

      case "gemini":
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`;
        body = {
          contents: [{ parts: [{ text: message }] }],
        };
        break;

      default:
        throw new Error("Unsupported model");
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (model === "gpt-4") {
      return data.choices[0].message.content;
    } else if (model === "claude") {
      return data.content[0].text;
    } else if (model === "gemini") {
      return data.candidates[0].content.parts[0].text;
    }
  } catch (err) {
    console.error(err);
    return "⚠️ Error fetching response!";
  }
}
