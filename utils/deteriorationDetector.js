export const detectDeteriorationTrend = (history) => {
  if (!history || history.length < 3) return false;

  const lastThree = history.slice(-3);

  const hrTrend =
    lastThree[0].heartRate <
    lastThree[1].heartRate &&
    lastThree[1].heartRate <
    lastThree[2].heartRate;

  const oxygenTrend =
    lastThree[0].oxygenLevel >
    lastThree[1].oxygenLevel &&
    lastThree[1].oxygenLevel >
    lastThree[2].oxygenLevel;

  const tempTrend =
    lastThree[0].temperature <
    lastThree[1].temperature &&
    lastThree[1].temperature <
    lastThree[2].temperature;

  return hrTrend || oxygenTrend || tempTrend;
};