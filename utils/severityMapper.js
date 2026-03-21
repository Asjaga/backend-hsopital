const severityMap = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
};

export const mapSeverityToScore = (severity) => {
  return severityMap[severity?.toUpperCase()] || 1;
};

export const scoreToSeverity = (score) => {
  const entry = Object.entries(severityMap).find(
    ([, value]) => value === score
  );

  return entry ? entry[0] : "LOW";
};