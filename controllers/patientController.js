import Patient from "../models/Patient.js";
import { analyzeSymptoms } from "../services/aiService.js";
import { mapSeverityToScore } from "../utils/severityMapper.js";
import { io } from "../server.js";
import { generateVitals } from "../services/vitalsService.js";
import { evaluateEmergencyLevel } from "../utils/emergencyEvaluator.js";
import { rebuildQueue } from "../utils/queueManager.js";
import { detectDeteriorationTrend } from "../utils/deteriorationDetector.js";
import { generateTriageExplanation } from "../services/aiService.js";


export const registerAndAnalyzePatient = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      symptoms,
      duration,
      existingConditions,
      vitals
    } = req.body;

    if (!name || !age || !gender || !symptoms) {
      return res.status(400).json({
        message: "Missing required patient information"
      });
    }

    const aiResponse = await analyzeSymptoms({
      age,
      gender,
      symptoms,
      duration,
      existingConditions,
      vitals
    });

    const severityScore = mapSeverityToScore(aiResponse.severity);

    const patient = await Patient.create({
      name,
      age,
      gender,
      symptoms,
      duration,
      existingConditions,
      severityLevel: aiResponse.severity,
      severityScore,
      predictedDisease: aiResponse.predictedDisease,
      doctorSuggestion: aiResponse.doctorSuggestion,
      vitals
    });

    if (io && patient.severityLevel === "CRITICAL") {
      io.emit("criticalAlert", {
        patientId: patient._id,
        message: "Critical patient added to queue"
      });
    }

    await rebuildQueue();

    if (io) {
      io.emit("queueUpdated");
    }

    return res.status(201).json({
      message: "Patient registered successfully",
      patientId: patient._id,
      severityLevel: patient.severityLevel,
      severityScore: patient.severityScore,
      predictedDisease: patient.predictedDisease,
      doctorSuggestion: patient.doctorSuggestion
    });
  } catch (error) {
    console.error("Patient registration failed:", error.message);

    return res.status(500).json({
      message: "Patient analysis failed"
    });
  }
};

export const getPatientQueue = async (req, res) => {
  try {
    const patients = await Patient.find({
      status: "WAITING"
    }).sort({ severityScore: -1, createdAt: 1 });

    const rankedQueue = patients.map((patient, index) => ({
      queueRank: index + 1,
      _id: patient._id,
      name: patient.name,
      age: patient.age,
      severityLevel: patient.severityLevel,
      severityScore: patient.severityScore,
      symptoms: patient.symptoms,
      predictedDisease: patient.predictedDisease,
      doctorSuggestion: patient.doctorSuggestion,
      vitals: patient.vitals,
      createdAt: patient.createdAt
    }));

    return res.status(200).json({
      totalPatients: rankedQueue.length,
      queue: rankedQueue
    });
  } catch (error) {
    console.error("Queue fetch failed:", error.message);

    return res.status(500).json({
      message: "Failed to fetch patient queue"
    });
  }
};

export const simulateVitalsUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const newVitals = generateVitals();

    const emergencyLevel = evaluateEmergencyLevel(newVitals);

    const updatePayload = {
      vitals: newVitals
    };

    if (emergencyLevel) {
      updatePayload.severityLevel = emergencyLevel;
      updatePayload.severityScore =
        emergencyLevel === "CRITICAL" ? 4 : 3;
    }

    const patient = await Patient.findByIdAndUpdate(
      id,
      {
        ...updatePayload,
        $push: {
          vitalsHistory: {
            ...newVitals,
            recordedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    const deteriorationDetected = detectDeteriorationTrend(
      patient.vitalsHistory
    );

    if (deteriorationDetected && io) {
      io.emit("deteriorationAlert", {
        patientId: patient._id,
        message: "Patient vitals worsening rapidly"
      });
    }

    if (emergencyLevel) {
      await rebuildQueue();
    }

    if (emergencyLevel && io) {
      io.emit("queueUpdated");

      if (emergencyLevel === "CRITICAL") {
        io.emit("criticalAlert", {
          patientId: patient._id,
          message: "Vitals escalation: patient now critical"
        });
      }
    }

    return res.status(200).json({
      message: "Vitals updated",
      vitals: patient.vitals,
      severityLevel: patient.severityLevel,
      deteriorationDetected
    });

  } catch (error) {
    return res.status(500).json({
      message: "Vitals simulation failed"
    });
  }
};

export const markPatientInProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndUpdate(
      id,
      { status: "IN_PROGRESS" },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    await rebuildQueue();

    if (io) {
      io.emit("queueUpdated");
    }

    return res.status(200).json({
      message: "Patient treatment started",
      patient
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update patient status"
    });
  }
};

export const markPatientCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndUpdate(
      id,
      { status: "COMPLETED" },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    await rebuildQueue();

    if (io) {
      io.emit("queueUpdated");
    }

    return res.status(200).json({
      message: "Patient treatment completed",
      patient
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update patient status"
    });
  }
};

export const getPatientStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();

    const criticalCases = await Patient.countDocuments({
      severityLevel: "CRITICAL"
    });

    const waitingPatients = await Patient.countDocuments({
      status: "WAITING"
    });

    const inProgressPatients = await Patient.countDocuments({
      status: "IN_PROGRESS"
    });

    const completedPatients = await Patient.countDocuments({
      status: "COMPLETED"
    });

    const waitingList = await Patient.find({
      status: "WAITING"
    }).select("createdAt");

    let avgWaitTimeMinutes = 0;

    if (waitingList.length > 0) {
      const totalWaitTime = waitingList.reduce((acc, patient) => {
        const waitTime =
          (Date.now() - new Date(patient.createdAt)) / 60000;
        return acc + waitTime;
      }, 0);

      avgWaitTimeMinutes = Math.round(
        totalWaitTime / waitingList.length
      );
    }

    return res.status(200).json({
      totalPatients,
      criticalCases,
      waitingPatients,
      inProgressPatients,
      completedPatients,
      avgWaitTimeMinutes
    });
  } catch (error) {
    console.error("Stats fetch failed:", error.message);

    return res.status(500).json({
      message: "Failed to fetch analytics stats"
    });
  }
};


export const getVitalsHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).select("vitalsHistory");

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      vitalsHistory: patient.vitalsHistory
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch vitals history"
    });
  }
};


export const getPatientTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      patientId: patient._id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      symptoms: patient.symptoms,
      duration: patient.duration,
      existingConditions: patient.existingConditions,
      severityLevel: patient.severityLevel,
      severityScore: patient.severityScore,
      predictedDisease: patient.predictedDisease,
      doctorSuggestion: patient.doctorSuggestion,
      status: patient.status,
      queueRank: patient.queueRank,
      vitals: patient.vitals,
      vitalsHistory: patient.vitalsHistory,
      createdAt: patient.createdAt
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch patient timeline"
    });
  }
};


export const getTriageExplanation = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    const explanation = await generateTriageExplanation(patient);

    return res.status(200).json({
      severityLevel: patient.severityLevel,
      explanation
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate explanation"
    });
  }
};