import { fallbackMessages } from './fallbackMessages'

const API_KEY = "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"

export async function getAiMessage(prompt, isOnline = true) {
  // 1. If Offline mode is active, return fallback instantly
  if (!isOnline) {
    console.log("Offline mode active: Picking fallback message.");
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are a supportive mental health companion." },
            { role: "user", content: prompt }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      throw new Error(`API Status: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;

  } catch (error) {
    console.error("AI Integration failed:", error);
    // 2. If API fails while online, also use fallback
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }
}