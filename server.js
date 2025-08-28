import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

// Environment variables load करें
dotenv.config();

const app = express();

// CORS configuration - Frontend URLs allow करें
app.use(cors({
  origin: [
    "https://gemini-ie4vnpwki-sunnyss-projects.vercel.app",
    "https://gemini-1zopv3du1-sunnyss-projects.vercel.app", // Your Vercel app
    "http://localhost:5173", // Local development
   ,
    "https://gemini-woad-ten.vercel.app" // New public URL (when you make it public)
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// API Key environment variable से लें
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Streaming response के लिए
    const result = await model.generateContentStream(prompt);

    // Response को stream करें
    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text += chunkText;
    }

    res.json({ text: text });

  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Gemini API Server is running!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));







