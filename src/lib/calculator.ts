/**
 * Standalone vote projection calculator
 * No external data sources - users input all historical data manually
 */

import {
  Candidate,
  PreviousElectionData,
  CalculationParams,
  CalculationResult,
  PositionInfo,
  VoteProjection,
} from './types';

/**
 * Position definitions
 */
export const POSITIONS: { [key: string]: PositionInfo } = {
  barangay_captain: {
    id: 'barangay_captain',
    label: 'Barangay Captain',
    seats: 1,
    category: 'barangay',
    description: 'Head executive of the barangay',
  },
  barangay_councilor: {
    id: 'barangay_councilor',
    label: 'Barangay Councilor',
    seats: 8,
    category: 'barangay',
    description: 'Legislative members of the barangay (8 seats)',
  },
  sk_chairperson: {
    id: 'sk_chairperson',
    label: 'SK Chairperson',
    seats: 1,
    category: 'sk',
    description: 'Head of the Sangguniang Kabataan (youth council)',
  },
  sk_councilor: {
    id: 'sk_councilor',
    label: 'SK Councilor',
    seats: 15,
    category: 'sk',
    description: 'Members of the Sangguniang Kabataan (15 seats)',
  },
};

/**
 * Calculates turnout rate from actual and registered voters
 */
export function calculateTurnoutRate(actualVoters: number, registeredVoters: number): number {
  if (registeredVoters === 0) return 0;
  return actualVoters / registeredVoters;
}

/**
 * Calculates projected total votes for an election
 * Formula: baseVoters × (1 + growthRate)^years × turnoutRate
 */
export function calculateProjectedTotalVotes(
  previousData: PreviousElectionData,
  params: CalculationParams
): number {
  const baseVoters = previousData.actualVoters;

  if (baseVoters <= 0) {
    throw new Error('Actual voters must be greater than 0');
  }

  const yearsDifference = params.projectionYear - params.baseYear;

  if (yearsDifference < 0) {
    throw new Error('Projection year must be after base year');
  }

  // Apply compound growth: baseVoters * (1 + growthRate)^years
  const projectedVoters = baseVoters * Math.pow(1 + params.voterGrowthRate, yearsDifference);

  // Apply turnout rate
  const projectedTotalVotes = projectedVoters * params.expectedTurnoutRate;

  return Math.round(projectedTotalVotes);
}

/**
 * Projects votes for each candidate
 */
export function projectCandidateVotes(
  candidates: Candidate[],
  projectedTotalVotes: number,
  previousTotalVotes: number
): VoteProjection[] {
  if (previousTotalVotes === 0) {
    throw new Error('Previous total votes must be greater than 0');
  }

  const scaleFactor = projectedTotalVotes / previousTotalVotes;

  return candidates
    .map((candidate, index) => {
      const previousPercentage = (candidate.votes / previousTotalVotes) * 100;
      const projectedVotes = Math.round(candidate.votes * scaleFactor);
      const projectedPercentage = (projectedVotes / projectedTotalVotes) * 100;

      return {
        candidateName: candidate.name,
        previousVotes: candidate.votes,
        previousPercentage,
        projectedVotes,
        projectedPercentage,
        rank: index + 1, // Will be recalculated after sorting
      };
    })
    .sort((a, b) => b.projectedVotes - a.projectedVotes)
    .map((proj, index) => ({
      ...proj,
      rank: index + 1,
    }));
}

/**
 * Calculates votes needed for each rank
 */
export function calculateVotesNeededByRank(
  projections: VoteProjection[],
  numberOfSeats: number
): { [rank: number]: number } {
  const votesNeeded: { [rank: number]: number } = {};

  for (let i = 0; i < Math.min(numberOfSeats, projections.length); i++) {
    const rank = i + 1;
    votesNeeded[rank] = projections[i].projectedVotes;
  }

  return votesNeeded;
}

/**
 * Main calculation function
 */
export function calculateResults(
  previousData: PreviousElectionData,
  params: CalculationParams
): CalculationResult {
  // Validate inputs
  if (!previousData.candidates || previousData.candidates.length === 0) {
    throw new Error('No candidates provided');
  }

  if (previousData.totalVotes <= 0) {
    throw new Error('Total votes must be greater than 0');
  }

  if (params.expectedTurnoutRate <= 0 || params.expectedTurnoutRate > 1) {
    throw new Error('Expected turnout rate must be between 0 and 1');
  }

  const positionInfo = POSITIONS[previousData.position];
  if (!positionInfo) {
    throw new Error(`Unknown position: ${previousData.position}`);
  }

  // Calculate projections
  const projectedTotalVotes = calculateProjectedTotalVotes(previousData, params);
  const projections = projectCandidateVotes(
    previousData.candidates,
    projectedTotalVotes,
    previousData.totalVotes
  );
  const votesNeededByRank = calculateVotesNeededByRank(projections, positionInfo.seats);

  // Analysis
  const winningVotes = projections[0]?.projectedVotes || 0;
  const secondPlaceVotes = projections[1]?.projectedVotes;

  const marginToWin: { [candidateIndex: number]: number } = {};
  projections.forEach((proj, index) => {
    marginToWin[index] = Math.max(0, winningVotes - proj.projectedVotes + 1);
  });

  return {
    position: positionInfo,
    baseYear: params.baseYear,
    projectionYear: params.projectionYear,
    previousTotalVotes: previousData.totalVotes,
    projectedTotalVotes,
    previousTurnout: previousData.turnoutRate,
    projectedTurnout: params.expectedTurnoutRate,
    numberOfSeats: positionInfo.seats,
    projections,
    votesNeededByRank,
    analysis: {
      winningVotes,
      secondPlaceVotes,
      marginToWin,
    },
  };
}
