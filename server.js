//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

// For Node < 18 (safe fallback)
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// 🌐 CORS (allow local + deployed frontend)
const allowedOrigins = [
  "https://fhir-dental-demo-front-end.vercel.app"
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));


app.use(express.json());

// ✅ Root route (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🔗 FHIR server
const FHIR_SERVER = "https://hapi.fhir.org/baseR4/Condition";

// 🦷 Save condition API
app.post("/save-condition", async (req, res) => {
  console.log("Request received from frontend:");
  console.log(req.body);

  const { patientId, tooth, code, display } = req.body;

  const condition = {
    resourceType: "Condition",
    subject: {
      reference: "Patient/" + patientId,
    },
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: code,
          display: display,
        },
      ],
    },
    bodySite: [
      {
        text: `Tooth ${tooth}`,
      },
    ],
  };

  console.log("FHIR Condition Created:");
  console.log(JSON.stringify(condition, null, 2));

  try {
    const response = await fetch(FHIR_SERVER, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
      },
      body: JSON.stringify(condition),
    });

    const data = await response.json();

    console.log("FHIR Response:");
    console.log(JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error("Error sending to FHIR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// 🧠 Dual mode: Local vs Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

// ✅ Required for Vercel
module.exports = app;