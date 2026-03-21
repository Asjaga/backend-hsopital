import mongoose from "mongoose";
import dotenv from "dotenv";

import Patient from "../models/Patient.js";
import connectDB from "../config/db.js";
import { rebuildQueue } from "../utils/queueManager.js";

dotenv.config();

const seedPatients = async () => {
  try {
    await connectDB();

    console.log("Deleting old patient data...");
    await Patient.deleteMany();

    const patients = [
      {
        name: "Rahul Sharma",
        age: 58,
        gender: "Male",
        symptoms: "chest pain, sweating, dizziness",
        duration: "25 minutes",
        existingConditions: "hypertension",
        severityLevel: "CRITICAL",
        severityScore: 4,
        predictedDisease: "Possible cardiac emergency",
        doctorSuggestion: "Immediate ECG required",
        vitals: {
          heartRate: 128,
          bloodPressure: "150/95",
          oxygenLevel: 88,
          temperature: 101.2
        }
      },
      {
        name: "Priya Verma",
        age: 34,
        gender: "Female",
        symptoms: "high fever, fatigue, headache",
        duration: "2 days",
        existingConditions: "none",
        severityLevel: "HIGH",
        severityScore: 3,
        predictedDisease: "Possible viral infection",
        doctorSuggestion: "Blood test recommended",
        vitals: {
          heartRate: 108,
          bloodPressure: "130/85",
          oxygenLevel: 94,
          temperature: 100.4
        }
      },
      {
        name: "Amit Singh",
        age: 46,
        gender: "Male",
        symptoms: "shortness of breath",
        duration: "3 hours",
        existingConditions: "asthma",
        severityLevel: "HIGH",
        severityScore: 3,
        predictedDisease: "Respiratory distress",
        doctorSuggestion: "Nebulization required",
        vitals: {
          heartRate: 112,
          bloodPressure: "138/90",
          oxygenLevel: 92,
          temperature: 99.6
        }
      },
      {
        name: "Neha Gupta",
        age: 27,
        gender: "Female",
        symptoms: "mild stomach pain",
        duration: "5 hours",
        existingConditions: "none",
        severityLevel: "MEDIUM",
        severityScore: 2,
        predictedDisease: "Gastric irritation",
        doctorSuggestion: "Antacid recommended",
        vitals: {
          heartRate: 86,
          bloodPressure: "118/76",
          oxygenLevel: 98,
          temperature: 98.9
        }
      },
      {
        name: "Rohan Mehta",
        age: 22,
        gender: "Male",
        symptoms: "common cold, sneezing",
        duration: "1 day",
        existingConditions: "none",
        severityLevel: "LOW",
        severityScore: 1,
        predictedDisease: "Seasonal cold",
        doctorSuggestion: "Rest and hydration advised",
        vitals: {
          heartRate: 72,
          bloodPressure: "116/74",
          oxygenLevel: 99,
          temperature: 98.2
        }
      }
    ];

    console.log("Inserting demo patients...");
    await Patient.insertMany(patients);

    await rebuildQueue();

    console.log("Demo patients inserted successfully");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedPatients();