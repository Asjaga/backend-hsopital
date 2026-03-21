import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    age: {
      type: Number,
      required: true,
      min: 0
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    },

    symptoms: {
      type: String,
      required: true
    },

    duration: {
      type: String,
      default: ""
    },

    existingConditions: {
      type: String,
      default: ""
    },

    severityLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW"
    },

    severityScore: {
      type: Number,
      default: 1
    },

    predictedDisease: {
      type: String,
      default: ""
    },

    doctorSuggestion: {
      type: String,
      default: ""
    },

    vitals: {
      heartRate: {
        type: Number,
        default: 75
      },
      vitalsHistory: [
          {
            heartRate: Number,
            bloodPressure: String,
            oxygenLevel: Number,
            temperature: Number,
            recordedAt: {
              type: Date,
              default: Date.now
            }
          }
      ],
      bloodPressure: {
        type: String,
        default: "120/80"
      },

      oxygenLevel: {
        type: Number,
        default: 98
      },

      temperature: {
        type: Number,
        default: 98.6
      }
    },

    queueRank: {
      type: Number,
      default: null
    },

    status: {
      type: String,
      enum: ["WAITING", "IN_PROGRESS", "COMPLETED"],
      default: "WAITING"
    }
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;