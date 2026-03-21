export const evaluateEmergencyLevel = (vitals) => {
  if (!vitals) return null;

  const { heartRate, oxygenLevel, temperature } = vitals;

  if (
    oxygenLevel < 90 ||
    heartRate > 120 ||
    temperature > 101
  ) {
    return "CRITICAL";
  }

  if (
    oxygenLevel < 94 ||
    heartRate > 105 ||
    temperature > 100
  ) {
    return "HIGH";
  }

  return null;
};