import axios from "axios";

export const analyzeSymptoms = async ({
  age,
  gender,
  symptoms,
  duration,
  existingConditions,
  vitals
}) => {
  try {
    const prompt = `
You are a hospital emergency triage classifier.

Return ONLY JSON:

{
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "predictedDisease": "",
  "doctorSuggestion": ""
}

Rules:

CRITICAL if:
- chest pain
- oxygen ≤ 90
- heart rate ≥ 120

HIGH if:
- oxygen ≤ 94
- fever ≥ 100
- breathing difficulty

Otherwise MEDIUM or LOW depending on symptoms severity.

Patient:

Age: ${age}
Gender: ${gender}
Symptoms: ${symptoms}
Duration: ${duration}
Conditions: ${existingConditions}

Vitals:
HR ${vitals?.heartRate}
BP ${vitals?.bloodPressure}
O2 ${vitals?.oxygenLevel}
Temp ${vitals?.temperature}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 120
      },
      {
        headers: {
          Authorization: `Bearer ${"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"}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "AI Healthcare Triage System"
        },
        timeout: 7000
      }
    );

    const text = response.data.choices[0].message.content;

    const cleaned = text.replace(/```json|```/g, "").trim();

    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("No JSON returned from AI");
    }

    const parsed = JSON.parse(match[0]);

    parsed.severity = parsed.severity?.toUpperCase();

    return parsed;
  } catch (error) {
    console.error("AI analysis failed:", error.message);

    return {
      severity: "CRITICAL",
      predictedDisease: "Possible cardiac emergency",
      doctorSuggestion: "Immediate ECG recommended"
    };
  }
};


export const generateTriageExplanation = async (patient) => {
  try {
    const prompt = `
Explain briefly why severity is ${patient.severityLevel}.

Return JSON only:

{
  "reasoning": "",
  "riskFactors": "",
  "recommendedAction": ""
}

Symptoms: ${patient.symptoms}
HR ${patient.vitals?.heartRate}
O2 ${patient.vitals?.oxygenLevel}
Temp ${patient.vitals?.temperature}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 120
      },
      {
        headers: {
          Authorization: `Bearer ${"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"}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "AI Healthcare Triage System"
        },
        timeout: 7000
      }
    );

    const text = response.data.choices[0].message.content;

    const cleaned = text.replace(/```json|```/g, "").trim();

    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("No JSON returned from explanation model");
    }

    return JSON.parse(match[0]);
  } catch (error) {
    console.error("Explanation generation failed:", error.message);

    return {
      reasoning: "Severity determined from abnormal vitals and symptoms",
      riskFactors: "Elevated heart rate or reduced oxygen saturation detected",
      recommendedAction: "Immediate medical evaluation recommended"
    };
  }
};