// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// 🌐 Allowed origins (FIXED)
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL // ✅ correct usage
].filter(Boolean);

// ✅ Proper CORS setup (handles Vercel + browser preflight)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / curl

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

// ✅ Handle preflight requests (VERY IMPORTANT for Vercel)
app.options("*", cors());

app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🔗 FHIR server
const FHIR_SERVER = "https://hapi.fhir.org/baseR4/Condition";

// 🦷 Save condition API
app.post("/save-condition", async (req, res) => {
  try {
    console.log("Request received:", req.body);

    const { patientId, tooth, code, display } = req.body;

    const condition = {
      resourceType: "Condition",
      subject: {
        reference: "Patient/" + patientId
      },
      code: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code,
            display
          }
        ]
      },
      bodySite: [
        {
          text: `Tooth ${tooth}`
        }
      ]
    };

    const response = await fetch(FHIR_SERVER, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json"
      },
      body: JSON.stringify(condition)
    });

    const data = await response.json();

    console.log("FHIR Response:", data);

    res.json(data);
  } catch (error) {
    console.error("FHIR Error:", error);

    res.status(500).json({
      error: error.message
    });
  }
});

// 🧠 Local vs Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

// ✅ Required for Vercel
module.exports = app;