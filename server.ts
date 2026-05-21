import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { LOCAL_KNOWLEDGE_INSTRUCTION } from "./src/lib/tutorConfig";

dotenv.config();

// Ensure Gemini client is lazily initialized or checked gracefully
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add your key in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json());

  // API Route for AI tutor chat endpoint
  app.post("/api/ai-tutor", async (req, res) => {
    try {
      const { messages, userContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing messages array in request body." });
      }

      // Initialize Gemini
      const genAI = getAiClient();

      // We form content history to send to Gemini
      // messages is of form [{ role: 'user' | 'model', content: string }]
      // Map it to GenAI SDK contents format
      const genAiContents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Enrich instructions with userContext if available
      let personalizedInstruction = LOCAL_KNOWLEDGE_INSTRUCTION;
      if (userContext) {
        personalizedInstruction += `\n\nCURRENT USER SESSION CONTEXT:\n- Selected Department: ${userContext.department || 'Not selected yet'}\n- Current Course Catalog: ${JSON.stringify(userContext.courses || [])}\n`;
      }

      // Generate response using gemini-3.5-flash
      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: genAiContents,
        config: {
          systemInstruction: personalizedInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I apologize, but I could not formulate a reply. Please try again.";
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("AI Tutor Error:", error);
      res.status(500).json({ 
        error: error.message || "An unexpected error occurred in the tutor server." 
      });
    }
  });

  // API route for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
