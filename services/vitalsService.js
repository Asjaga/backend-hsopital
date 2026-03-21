export const generateVitals = () => {
  const heartRate = Math.floor(Math.random() * (130 - 60) + 60);

  const systolic = Math.floor(Math.random() * (150 - 100) + 100);
  const diastolic = Math.floor(Math.random() * (100 - 70) + 70);

  const oxygenLevel = Math.floor(Math.random() * (100 - 88) + 88);

  const temperature = (
    Math.random() * (101 - 97) + 97
  ).toFixed(1);

  return {
    heartRate,
    bloodPressure: `${systolic}/${diastolic}`,
    oxygenLevel,
    temperature
  };
};