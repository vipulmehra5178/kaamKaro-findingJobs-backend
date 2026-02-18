const express = require("express");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/resume-eval", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let resumeText = "";

    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docxData = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });
      resumeText = docxData.value;
    }

    else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const prompt = `
You are an advanced Applicant Tracking System (ATS) evaluator.

Return ONLY valid JSON in this exact format:

{
  "atsScore": number,
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3",
    "Suggestion 4",
    "Suggestion 5"
  ],
  "recommendedRole": "Role name"
}

Resume:
${resumeText}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://kaam-karo-peach.vercel.app/" || "http://localhost:5173/", 
        "X-Title": "Resume Analyzer"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an ATS resume evaluator. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(500).json({
        error: "AI request failed",
        details: data
      });
    }

    let output = data.choices?.[0]?.message?.content || "";

    if (!output) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    output = output.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(output);
      return res.json(parsed);
    } catch (err) {
      console.error("JSON Parse Error:", err);
      console.log("Raw Output:", output);
      return res.status(500).json({
        error: "AI did not return valid JSON",
        raw: output
      });
    }

  } catch (error) {
    console.error("Resume Eval Error:", error);
    return res.status(500).json({
      error: "Resume evaluation failed",
      details: error.message
    });
  }
});

module.exports = router;