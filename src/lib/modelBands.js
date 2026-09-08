// Risk band labels for the CreditDecide risk model UI.
// Kept in sync with base44/shared/modelRegistry.ts getRiskBand / RISK_BAND_LABELS.
export const RISK_BAND_LABELS = {
  A: "Very Low",
  B: "Low",
  C: "Medium",
  D: "High",
  E: "Very High",
};

export function getRiskBandLabel(band) {
  return RISK_BAND_LABELS[band] || "—";
}