import Patient from "../models/Patient.js";

export const rebuildQueue = async () => {
  const patients = await Patient.find({
    status: "WAITING"
  }).sort({ severityScore: -1, createdAt: 1 });

  const updates = patients.map((patient, index) => {
    return Patient.findByIdAndUpdate(
      patient._id,
      { queueRank: index + 1 },
      { new: true }
    );
  });

  await Promise.all(updates);

  return patients.length;
};