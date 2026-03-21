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
You are a clinical triage assistant.

Return ONLY JSON:

{
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "predictedDisease": "short disease category",
  "doctorSuggestion": "one-line clinical next step"
}

Patient:

Age: ${age}
Gender: ${gender}
Symptoms: ${symptoms}
Duration: ${duration}
Existing conditions: ${existingConditions}

Vitals:
Heart Rate: ${vitals?.heartRate}
Blood Pressure: ${vitals?.bloodPressure}
Oxygen Level: ${vitals?.oxygenLevel}
Temperature: ${vitals?.temperature}
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
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${"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"}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "AI Healthcare Triage System"
        }
      }
    );

    const text = response.data.choices[0].message.content;

const cleaned = text.replace(/```json|```/g, "").trim();

const jsonStart = cleaned.indexOf("{");
const jsonEnd = cleaned.lastIndexOf("}") + 1;

const safeJSON = cleaned.slice(jsonStart, jsonEnd);

return JSON.parse(safeJSON);
    
  } catch (error) {
    console.error("AI analysis failed:", error.message);

    return {
      severity: "LOW",
      predictedDisease: "General checkup recommended",
      doctorSuggestion: "Further evaluation required"
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

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}") + 1;

    return JSON.parse(cleaned.slice(jsonStart, jsonEnd));
  } catch (error) {
    console.error("Explanation generation failed:", error.message);

    return {
      reasoning: "Severity determined from abnormal vitals and symptoms",
      riskFactors: "Elevated heart rate or reduced oxygen saturation detected",
      recommendedAction: "Immediate medical evaluation recommended"
    };
  }
};