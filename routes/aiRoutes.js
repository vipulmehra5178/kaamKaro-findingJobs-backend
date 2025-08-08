const express = require("express");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const upload = require("../middlewares/upload"); // your existing multer setup
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/resume-eval", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

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
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an advanced Applicant Tracking System (ATS) evaluator, industry recruiter, and career coach with deep expertise in resume parsing, job market trends, and skills gap analysis.

Analyze the following resume thoroughly and return ONLY valid JSON in the exact format below:
{
  "atsScore": number (0-100), // ATS compatibility score based on keyword match, formatting, and clarity
  "suggestions": [ 
    "Actionable suggestion 1 for improving ATS ranking and recruiter appeal",
    "Actionable suggestion 2 for enhancing skills and achievements visibility",
    "Actionable suggestion 3 for strengthening alignment with desired career path",
    "Actionable suggestion 4 for improving clarity, structure, or formatting",
    "Actionable suggestion 5 for adding in-demand skills, certifications, or experience"
  ],
  "recommendedRole": "Most suitable next career move based on skills, experience, and market demand"
}

When evaluating, consider:
- ATS keyword optimization based on relevant job descriptions
- Skill gaps that could hinder job matches
- Industry-specific formatting and section ordering
- Clarity and conciseness of achievements
- Career growth trajectory and high-demand opportunities

Resume:
${resumeText}
`;

    const result = await model.generateContent(prompt);
    let output = result.response.text();

    try {
      output = output.replace(/```json|```/g, "").trim();
      const jsonData = JSON.parse(output);
      res.json(jsonData);
    } catch (err) {
      console.error("JSON Parse Error:", err);
      res.status(500).json({ error: "AI did not return valid JSON" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Resume evaluation failed" });
  }
});

module.exports = router;
