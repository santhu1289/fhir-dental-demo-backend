const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const FHIR_SERVER = "https://hapi.fhir.org/baseR4/Condition";

app.post("/save-condition", async (req, res) => {

  console.log("Request received from frontend:");
  console.log(req.body);

  const { patientId, tooth, code, display } = req.body;

  const condition = {
    resourceType: "Condition",
    subject: {
      reference: "Patient/" + patientId
    },
    code: {
      coding: [{
        system: "http://snomed.info/sct",
        code: code,
        display: display
      }]
    },
    bodySite: [{
      text: `Tooth ${tooth}`
    }]
  };

  console.log("FHIR Condition Resource Created:");
  console.log(JSON.stringify(condition, null, 2));

  try {

    const response = await fetch(FHIR_SERVER, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json"
      },
      body: JSON.stringify(condition)
    });

    const data = await response.json();

    // 🔴 THIS IS WHAT YOU WANT
    console.log("Response received from FHIR server:");
    console.log(JSON.stringify(data, null, 2));

    console.log("FHIR Resource ID:", data.id);

    res.json(data);

  } catch (error) {

    console.error("Error sending to FHIR server:", error);

    res.status(500).json({
      error: error.message
    });

  }

});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});