import express from "express";
import cors from "cors";

import patientRoutes from "./routes/patientRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/patient", patientRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "API running",
    service: "AI Healthcare Triage System"
  });
});

export default app;