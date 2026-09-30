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
        badge: 'bg-red-50 text-red-700 border-red-300 font-bold',
        bg: 'bg-red-50/80',
        border: 'border-red-300',
        text: 'text-red-700',
        dot: 'bg-red-600',
        hex: '#dc2626',
      };
    case 'HIGH':
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
        bg: 'bg-amber-50/80',
        border: 'border-amber-300',
        text: 'text-amber-800',
        dot: 'bg-amber-600',
        hex: '#d97706',
      };
    case 'MEDIUM':
      return {
        badge: 'bg-yellow-50 text-yellow-800 border-yellow-300 font-bold',
        bg: 'bg-yellow-50/80',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        dot: 'bg-yellow-600',
        hex: '#ca8a04',
      };
    case 'LOW':
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
        bg: 'bg-emerald-50/80',
        border: 'border-emerald-300',
        text: 'text-emerald-800',
        dot: 'bg-emerald-600',
        hex: '#16a34a',
      };
  }
}
