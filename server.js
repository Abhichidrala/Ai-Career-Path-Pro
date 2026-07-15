import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";
import fs from "fs";

dotenv.config();
const app = express();
app.use(express.json({ limit: '10mb' }));

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// ---- Gemini Setup ----
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ---- Email Transporter Setup ----
let emailTransporter = null;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

function createTransporter(port, secure) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port,
    secure,                     // true for 465, false for 587
    requireTLS: !secure,        // force STARTTLS on port 587
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    tls: { rejectUnauthorized: false }, // allow self-signed / corporate proxies
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 25000
  });
}

// Send mail with automatic port fallback: 587 → 465
async function sendMailWithRetry(mailOptions) {
  const configs = [
    { port: 587, secure: false, label: '587/STARTTLS' },
    { port: 465, secure: true,  label: '465/SSL' }
  ];
  let lastErr;
  for (const cfg of configs) {
    const t = createTransporter(cfg.port, cfg.secure);
    try {
      const info = await t.sendMail(mailOptions);
      console.log(`📧 Email sent via port ${cfg.label}:`, info.messageId);
      return info;
    } catch (err) {
      console.warn(`⚠️  Port ${cfg.label} failed: ${err.message}`);
      lastErr = err;
    }
  }
  throw lastErr;
}

if (EMAIL_USER && EMAIL_PASS) {
  // Quick verify on startup (port 587)
  const testTransport = createTransporter(587, false);
  testTransport.verify((err) => {
    if (err) {
      console.warn('⚠️  SMTP verify (587) failed:', err.message, '— will try 465 on first send.');
    } else {
      console.log('📧 Email transport ready — SMTP verified on port 587 ✅');
    }
  });
  emailTransporter = true; // flag: configured
} else {
  console.log('📧 Email not configured (set EMAIL_USER, EMAIL_PASS in .env)');
}

// ---- Helper to call Gemini with retry ----
async function callGemini(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const isRateLimit = err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("RESOURCE_EXHAUSTED");
      if (isRateLimit && attempt < retries) {
        const delay = attempt * 5000; // 5s, 10s, 15s
        console.log(`⏳ Rate limited. Retrying in ${delay / 1000}s (attempt ${attempt}/${retries})...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error(`❌ Gemini error (attempt ${attempt}):`, err.message);
        return "";
      }
    }
  }
  return "";
}

// ---- API: Generate Questions WITH Explanations ----
app.post("/api/questions", async (req, res) => {
  const { role, difficulty, count } = req.body;
  const prompt = `
Generate exactly ${count || 10} multiple-choice questions for an AI career assessment.
Role: "${role || "Data Scientist"}"
Difficulty: "${difficulty || "intermediate"}"

IMPORTANT: Ensure the questions are completely new, unique, and distinct. Do NOT repeat questions from previous assessments, common templates, or standard examples. Focus on deep concepts, edge cases, and practical problems for this specific role and difficulty level.
Each question MUST include an "explanation" field that explains why the correct answer is right (2-3 sentences, educational).

Each question must have exactly 4 options.
Return ONLY a valid JSON array, no markdown, no code fences, no extra text:
[
  {
    "title": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why Option A is correct..."
  }
]

The "correct" field is the zero-based index of the correct option.
Make questions relevant, challenging, and educational for the role and difficulty level.
`;

  const text = await callGemini(prompt);
  let questions = [];
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    questions = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse questions JSON. Raw:", text?.substring(0, 200));
    questions = [];
  }
  res.json({ questions });
});

// ---- API: Single Explanation (fallback) ----
app.post("/api/explanation", async (req, res) => {
  const { question, answer, correctAnswer } = req.body;
  const prompt = `Quiz question: "${question}"
User selected: "${answer}"
Correct answer: "${correctAnswer || 'unknown'}"

In 2-3 concise sentences, explain why the correct answer is right. Be educational and clear.`;
  const explanation = await callGemini(prompt);
  res.json({ explanation: explanation || "Explanation could not be generated at this time." });
});

// ---- API: Career Recommendation ----
app.post("/api/recommendation", async (req, res) => {
  const { score, role, difficulty } = req.body;
  const prompt = `
The user scored ${score} in an AI/DS career assessment.
Role assessed: ${role}
Difficulty: ${difficulty}

Give a personalized 2-3 sentence career recommendation based on their performance. Mention specific technologies, courses, or skills they should focus on. Be encouraging and specific.`;
  const recommendation = await callGemini(prompt);
  res.json({ recommendation: recommendation || "" });
});

// ---- API: Deep Analysis (NEW) ----
app.post("/api/deep-analysis", async (req, res) => {
  const { name, role, difficulty, score, totalQuestions, percentage, grade, timeTaken, mode } = req.body;
  const prompt = `
You are an AI career assessment expert. Generate a comprehensive deep analysis report for this assessment result.

Candidate: ${name}
Role assessed: ${role}
Difficulty level: ${difficulty}
Mode: ${mode || 'Practice'}
Score: ${score}/${totalQuestions} (${percentage}%)
Grade: ${grade}
Time taken: ${timeTaken}

Generate a detailed JSON analysis with the following structure. Return ONLY valid JSON, no markdown, no code fences:
{
  "overallVerdict": "A 2-3 sentence overall assessment of the candidate's performance",
  "strengths": [
    "Specific strength point 1 based on their score and role",
    "Specific strength point 2",
    "Specific strength point 3"
  ],
  "areasToImprove": [
    "Specific area to improve 1 with actionable advice",
    "Specific area to improve 2 with actionable advice",
    "Specific area to improve 3 with actionable advice"
  ],
  "recommendedResources": [
    {"title": "Course or resource name", "type": "Course/Book/Tutorial", "reason": "Why this is relevant"},
    {"title": "Course or resource name", "type": "Course/Book/Tutorial", "reason": "Why this is relevant"},
    {"title": "Course or resource name", "type": "Course/Book/Tutorial", "reason": "Why this is relevant"}
  ],
  "careerReadiness": {
    "level": "Beginner/Intermediate/Advanced/Expert",
    "description": "2-3 sentence assessment of career readiness for this role"
  },
  "nextSteps": [
    "Actionable next step 1",
    "Actionable next step 2",
    "Actionable next step 3"
  ],
  "estimatedSalaryRange": "Estimated salary range for someone at this proficiency level in this role (USD)",
  "timeToJobReady": "Estimated time to become job-ready based on current performance"
}

Be specific to the ${role} role. Make all advice actionable and practical. Consider that ${percentage}% accuracy at ${difficulty} difficulty indicates a specific skill level.
`;

  const text = await callGemini(prompt);
  let analysis = null;
  try {
    if (text) {
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      analysis = JSON.parse(cleaned);
    }
  } catch {
    console.error("Failed to parse deep analysis JSON. Raw:", text?.substring(0, 200));
    analysis = null;
  }

  if (!analysis) {
    console.log("⚠️ Gemini API failed or rate-limited. Serving fallback mock analysis.");
    const mockPercentage = percentage || Math.round((score / totalQuestions) * 100);
    const mockGrade = grade || (mockPercentage >= 90 ? 'A+' : mockPercentage >= 80 ? 'A' : mockPercentage >= 70 ? 'B+' : mockPercentage >= 60 ? 'B' : 'C');
    analysis = getFallbackAnalysis(name, role, difficulty, score, totalQuestions, mockPercentage, mockGrade, timeTaken);
  }

  res.json({ analysis });
});

// ---- Fallback Deep Analysis Generator ----
function getFallbackAnalysis(name, role, difficulty, score, totalQuestions, percentage, grade, timeTaken) {
  const level = percentage >= 85 ? "Advanced" : percentage >= 60 ? "Intermediate" : "Beginner";
  return {
    overallVerdict: `Based on the assessment, ${name} has demonstrated a ${level} level of proficiency in ${role} concepts. Completed with a grade of ${grade} in ${timeTaken || 'a standard assessment window'}.`,
    strengths: [
      `Solid grasp of foundational ${role} workflows and methodology.`,
      `Demonstrated capability in handling ${difficulty} difficulty questions.`,
      `Consistent performance across key subject-matter areas.`
    ],
    areasToImprove: [
      `Deepen practical exposure to production deployment constraints.`,
      `Focus on performance optimization and scaling strategies for ${role} models.`,
      `Review edge-cases and hardware-acceleration details.`
    ],
    recommendedResources: [
      { "title": `Advanced ${role} Systems & Design`, "type": "Course", "reason": "Recommended for strengthening complex concepts." },
      { "title": `AI System Architecture in Production`, "type": "Book", "reason": "To study real-world case studies." },
      { "title": `Deep Learning and Fine-tuning Masterclass`, "type": "Tutorial", "reason": "To stay updated on cutting-edge model adjustments." }
    ],
    careerReadiness: {
      "level": level,
      "description": `${name} is showing excellent potential. Consistent practice will prepare them for professional roles.`
    },
    nextSteps: [
      `Go through the detailed assessment review to identify specific mistakes.`,
      `Apply these methodologies in hands-on portfolio projects.`,
      `Target roles matching a ${level} profile for optimal career transition.`
    ],
    estimatedSalaryRange: percentage >= 85 ? "$120,000 - $150,000" : percentage >= 60 ? "$85,000 - $110,000" : "$65,000 - $80,000",
    timeToJobReady: percentage >= 85 ? "Immediate (Job-Ready)" : percentage >= 60 ? "2-3 months" : "5-6 months"
  };
}

// ---- API: Send Certificate Email (NEW) ----
app.post("/api/send-certificate", async (req, res) => {
  const { email, name, role, score, totalQuestions, percentage, certId, pdfBase64 } = req.body;

  if (!emailTransporter) {
    return res.json({ success: false, message: "Email service not configured on server. Please download your certificate manually." });
  }

  if (!email || !pdfBase64) {
    return res.json({ success: false, message: "Missing email or certificate data." });
  }

  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    await sendMailWithRetry({
      from: `"AI Career Path Pro" <${EMAIL_USER}>`,
      to: email,
      subject: `🏆 Your AI Career Path Certificate — ${role}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #08080c; color: #f0f0f4;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #a855f7; font-size: 24px; margin: 0;">AI Career Path Pro</h1>
            <p style="color: #888; font-size: 14px; margin-top: 8px;">Professional Certification</p>
          </div>
          <div style="background: #13131b; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #f0f0f4; font-size: 20px; margin: 0 0 16px;">Congratulations, ${name}! 🎉</h2>
            <p style="color: #999; font-size: 15px; line-height: 1.6;">
              You have successfully passed the <strong style="color: #a855f7;">${role}</strong> Certification Assessment with a score of <strong style="color: #34d399;">${score}/${totalQuestions} (${percentage}%)</strong>.
            </p>
            <p style="color: #999; font-size: 15px; line-height: 1.6; margin-top: 12px;">
              Your verified PDF certificate is attached to this email. Certificate ID: <code style="color: #fbbf24;">${certId}</code>
            </p>
          </div>
          <div style="text-align: center; color: #555; font-size: 12px; margin-top: 30px;">
            <p>This is an automated email from AI Career Path Pro.</p>
            <p>Powered by Google Gemini AI</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: `${name.replace(/\s+/g, '_')}_AI_Career_Certificate.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });

    console.log(`📧 Certificate sent to ${email}`);
    res.json({ success: true, message: `Certificate sent to ${email}` });
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    res.json({ success: false, message: `Failed to send email: ${err.message}` });
  }
});

// ---- API: Admin Login ----
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "abhi" && password === "qwertyuiop") {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials." });
  }
});

// ---- API: Admin Test Email ----
app.post("/api/admin/test-email", async (req, res) => {
  const { email } = req.body;
  if (!emailTransporter) {
    return res.json({ success: false, message: "Email service not configured. Please check your SMTP settings in .env." });
  }
  try {
    await sendMailWithRetry({
      from: `"AI Career Path Pro (Admin Test)" <${EMAIL_USER}>`,
      to: email,
      subject: "🧪 AI Career Path Pro — SMTP Connection Test",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #08080c; color: #f0f0f4;">
          <h2 style="color: #a855f7;">Connection Test Successful! 🎉</h2>
          <p>Your SMTP mail configuration is working perfectly.</p>
          <p>Sent at: <strong>${new Date().toLocaleString()}</strong></p>
        </div>
      `
    });
    res.json({ success: true, message: `Test email successfully sent to ${email}` });
  } catch (err) {
    res.json({ success: false, message: `SMTP test failed: ${err.message}` });
  }
});

// ---- API: Admin Upload Asset ----
app.post("/api/admin/upload-asset", (req, res) => {
  const { username, password, filename, base64Data } = req.body;
  if (username !== "abhi" || password !== "qwertyuiop") {
    return res.status(401).json({ success: false, message: "Unauthorized. Invalid credentials." });
  }

  if (!filename || !base64Data) {
    return res.status(400).json({ success: false, message: "Missing filename or base64Data payload." });
  }

  const safeFilename = path.basename(filename);
  if (safeFilename !== "logo.png" && safeFilename !== "favicon.png") {
    return res.status(400).json({ success: false, message: "Invalid asset destination filename." });
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join(__dirname, safeFilename);
    fs.writeFileSync(filePath, buffer);
    console.log(`💼 Branding asset updated: ${safeFilename}`);
    res.json({ success: true, message: `${safeFilename} successfully updated on server.` });
  } catch (err) {
    console.error(`❌ Failed to update asset ${safeFilename}:`, err.message);
    res.status(500).json({ success: false, message: `Error writing asset: ${err.message}` });
  }
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ AI Career Path running at http://localhost:${PORT}`)
);