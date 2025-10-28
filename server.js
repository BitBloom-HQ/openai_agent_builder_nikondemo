import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));


dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WORKFLOW_ID = process.env.WORKFLOW_ID || "wf_xxx_from_agent_builder_publish"; // Extract to .env

/** Mapping OpenAI errors to normalized form */
function normalizeOpenAIError(err) {
  const status = err?.response?.status || 500;
  const oe = err?.response?.data?.error || {};
  const code = oe.code || oe.type || "unknown";
  const msg  = oe.message || "Unexpected error";

  // Common cases
  if (status === 402 || code === "insufficient_quota") {
    return { http: 402, code: "quota_exceeded", message: "OpenAI quota exceeded" };
  }
  if (status === 429 || code === "rate_limit_exceeded" || code === "requests_exceeded") {
    const retryAfter = Number(err?.response?.headers?.["retry-after"]) || undefined;
    return { http: 429, code: "rate_limited", message: "Rate limit exceeded", retry_after: retryAfter };
  }
  if (status === 401 || code === "invalid_api_key") {
    return { http: 401, code: "unauthorized", message: "Invalid/unauthorized API key" };
  }
  if (status === 403) {
    return { http: 403, code: "forbidden", message: "Forbidden" };
  }
  if (status >= 500) {
    return { http: 502, code: "upstream_error", message: "Upstream error from OpenAI" };
  }
  // Default
  return { http: status, code, message: msg };
}

// Creating session and delivering client_secret to client
app.post("/api/chatkit/session", async (req, res) => {
  console.log("Creating ChatKit session for client...");
  try {
    const deviceId = (req.ip || "local-demo").toString();

    const response = await axios.post(
      "https://api.openai.com/v1/chatkit/sessions",
      {
        user: deviceId,          
        workflow: { id: WORKFLOW_ID }, 
      },
      {
        headers: {
          "Content-Type": "application/json",
          "OpenAI-Beta": "chatkit_beta=v1",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        timeout: 15000,
      }
    );
    const { data } = response;
    res.json({ client_secret: data.client_secret, expires_at: data.expires_at });
  } catch (error) {
    if (error.response) {
      const n = normalizeOpenAIError(error);
      console.error(`[OpenAI ERROR] ${n.http} ${n.code} - ${n.message}`);
      // Respond with normalized error
      return res.status(n.http).json({
        error: { code: n.code, message: n.message, retry_after: n.retry_after },
      });
    }
    if (error.request) {
      console.error("[OpenAI ERROR] No response from OpenAI");
      return res.status(504).json({ error: { code: "upstream_timeout", message: "No response from OpenAI" } });
    }
    console.error("[Internal ERROR]", error.message);
    return res.status(500).json({ error: { code: "internal_error", message: error.message } });
  }
});


// “Camera Support”
app.get("/", (req, res) => res.render("index"));
app.get("/camera-support", (req, res) => res.render("camera-support"));

app.use(express.static("public", {
  maxAge: "1d",
  etag: true
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Demo site on http://localhost:${PORT}`);
});
