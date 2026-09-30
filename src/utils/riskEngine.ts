import { RiskFactors, RiskWeights, SeverityLevel } from '../types';

export const DEFAULT_WEIGHTS: RiskWeights = {
  severity: 0.25,
  traffic_exposure: 0.20,
  population_exposure: 0.15,
  safety_risk: 0.25,
  deterioration: 0.15,
};

/**
 * Calculates composite risk score (0 to 100) based on weighted multi-factor analysis
 */
export function calculateRiskScore(
  factors: RiskFactors,
  weights: RiskWeights = DEFAULT_WEIGHTS
): number {
  const rawScore = 
    factors.severity * weights.severity +
    factors.traffic_exposure * weights.traffic_exposure +
    factors.population_exposure * weights.population_exposure +
    factors.safety_risk * weights.safety_risk +
    factors.deterioration * weights.deterioration;

  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

/**
 * Classifies score into municipal action tier
 */
export function getSeverityTier(score: number): SeverityLevel {
  if (score >= 81) return 'CRITICAL';
  if (score >= 61) return 'HIGH';
  if (score >= 31) return 'MEDIUM';
  return 'LOW';
}

export function getRecommendedAction(score: number, type: string): string {
  if (score >= 81) {
    return 'Immediate maintenance required. Deploy rapid patch crew & barrier cordon within 4 hours.';
  }
  if (score >= 61) {
    return 'High priority repair. Schedule asphalt patching crew within 24–48 hours.';
  }
  if (score >= 31) {
    return 'Medium priority. Queue for scheduled bi-weekly road rehabilitation program.';
  }
  return 'Low priority. Log in municipal defect inventory; re-inspect in 30 days.';
}

export function getSeverityColor(severity: SeverityLevel): {
  badge: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
  hex: string;
} {
  switch (severity) {
    case 'CRITICAL':
      return {
        badge: 'bg-red-500/20 text-red-400 border-red-500/40',
        bg: 'bg-red-950/40',
        border: 'border-red-500/50',
        text: 'text-red-400',
        dot: 'bg-red-500',
        hex: '#ef4444',
      };
    case 'HIGH':
      return {
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        hex: '#f59e0b',
      };
    case 'MEDIUM':
      return {
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        bg: 'bg-yellow-950/40',
        border: 'border-yellow-500/50',
        text: 'text-yellow-300',
        dot: 'bg-yellow-400',
        hex: '#eab308',
      };
    case 'LOW':
      return {
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/50',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        hex: '#10b981',
      };
  }
}
