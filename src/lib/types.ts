/**
 * Type definitions for Philippine election calculator
 */

export type ElectionPosition = 'barangay_captain' | 'barangay_councilor' | 'sk_chairperson' | 'sk_councilor';

/**
 * Position details and seat information
 */
export interface PositionInfo {
  id: ElectionPosition;
  label: string;
  seats: number; // 1 for single seat, multiple for multi-seat
  category: 'barangay' | 'sk';
  description: string;
}

/**
 * Candidate entry with vote data
 */
export interface Candidate {
  name: string;
  votes: number;
}

/**
 * Previous election results
 */
export interface PreviousElectionData {
  position: ElectionPosition;
  year: number;
  candidates: Candidate[];
  totalVotes: number;
  registeredVoters: number;
  actualVoters: number;
  turnoutRate: number; // calculated
}

/**
 * Calculation parameters
 */
export interface CalculationParams {
  voterGrowthRate: number; // as decimal: 0.03 for 3%
  expectedTurnoutRate: number; // as decimal: 0.65 for 65%
  baseYear: number;
  projectionYear: number;
}

/**
 * Vote projection for a candidate
 */
export interface VoteProjection {
  candidateName: string;
  previousVotes: number;
  previousPercentage: number;
  projectedVotes: number;
  projectedPercentage: number;
  rank: number;
}

/**
 * Final calculation result
 */
export interface CalculationResult {
  position: PositionInfo;
  baseYear: number;
  projectionYear: number;
  previousTotalVotes: number;
  projectedTotalVotes: number;
  previousTurnout: number;
  projectedTurnout: number;
  numberOfSeats: number;
  projections: VoteProjection[];
  votesNeededByRank: { [rank: number]: number };
  analysis: {
    winningVotes: number; // votes needed for 1st place
    secondPlaceVotes?: number; // votes needed for 2nd place (if applicable)
    marginToWin: { [candidateIndex: number]: number }; // votes needed to match/beat top candidate
  };
}
