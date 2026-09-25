import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize GoogleGenAI client on the server
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // API route for generating descriptions/content
  app.post("/api/gemini/generate-description", async (req, res) => {
    try {
      const { title, contentType, contextText, model } = req.body;
      const selectedModel = model || 'gemini-3.7-flash';

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured in the environment." });
      }

      let prompt = `Generate a compelling, detailed, and comprehensive description/article for a ${contentType || 'content piece'}`;
      if (title) {
        prompt += ` with the title "${title}"`;
      }
      prompt += `.\n\nStrict Requirements:\n- It MUST be a detailed, rich, and longer text (at least 2-3 well-developed paragraphs).\n- Do NOT include any lists, bullet points, or numbered lists.\n- Do NOT include any hyperlinks or links.\n- Do NOT use markdown asterisks or special formatting symbols for list-like groupings. Make it a cohesive narrative description.`;

      if (contextText && contextText.trim()) {
        prompt += `\n\nUse this existing draft or context to build upon: "${contextText}"`;
      }

      const interaction = await ai.interactions.create({
        model: selectedModel,
        input: [
          { type: "text", text: prompt }
        ]
      });

      let outputText = "";
      if (interaction && interaction.steps) {
        for (const step of interaction.steps) {
          if (step.type === "model_output") {
            const textPart = step.content?.find((c) => c.type === "text");
            if (textPart && textPart.text) {
              outputText += textPart.text;
            }
          }
        }
      }

      if (!outputText && interaction.output_text) {
        outputText = interaction.output_text;
      }

      if (!outputText) {
        throw new Error("No output text was received from the Gemini API.");
      }

      res.json({ text: outputText.trim() });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Rate limit exceeded')) {
        return res.status(429).json({ error: "AI daily quota reached. Please try again tomorrow or upgrade your plan." });
      }
      res.status(500).json({ error: error?.message || "Failed to generate description" });
    }
  });

  // API route for generating SHORT descriptions/content (e.g. for photos)
  app.post("/api/gemini/generate-short-description", async (req, res) => {
    try {
      const { title, model } = req.body;
      const selectedModel = model || 'gemini-3.7-flash';

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured in the environment." });
      }

      const prompt = `Generate a short, concise description for an image with title "${title}".\n\nStrict Requirements:\n- It MUST be very short (max 2 sentences).\n- Do NOT include any lists or bullet points.\n- Do NOT include any hyperlinks or links.\n- Do NOT use markdown formatting symbols.`;

      const interaction = await ai.interactions.create({
        model: selectedModel,
        input: [
          { type: "text", text: prompt }
        ]
      });

      let outputText = "";
      if (interaction && interaction.steps) {
        for (const step of interaction.steps) {
          if (step.type === "model_output") {
            const textPart = step.content?.find((c) => c.type === "text");
            if (textPart && textPart.text) {
              outputText += textPart.text;
            }
          }
        }
      }

      if (!outputText && interaction.output_text) {
        outputText = interaction.output_text;
      }

      if (!outputText) {
        throw new Error("No output text was received from the Gemini API.");
      }

      res.json({ text: outputText.trim() });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Rate limit exceeded')) {
        return res.status(429).json({ error: "AI daily quota reached. Please try again tomorrow or upgrade your plan." });
      }
      res.status(500).json({ error: error?.message || "Failed to generate short description" });
    }
  });

  // Serve health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
