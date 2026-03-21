import express from "express";
import { registerAndAnalyzePatient ,getPatientTimeline, getPatientQueue,getTriageExplanation, simulateVitalsUpdate,  markPatientInProgress,markPatientCompleted, getPatientStats, getVitalsHistory} from "../controllers/patientController.js";
const router = express.Router();

router.post("/register", registerAndAnalyzePatient);
router.get("/queue", getPatientQueue);
router.get("/vitals/:id", simulateVitalsUpdate);
router.get("/stats", getPatientStats);
router.get("/:id/vitals-history", getVitalsHistory);
router.get("/:id/timeline", getPatientTimeline);
router.patch("/:id/start", markPatientInProgress);
router.patch("/:id/complete", markPatientCompleted);
router.get("/:id/explanation", getTriageExplanation);

export default router;