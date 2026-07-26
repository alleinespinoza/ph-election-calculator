/**
 * Vote projection and calculation logic
 */

import {
  ElectionResult,
  ProjectionParams,
  WinningThreshold,
  VoteProjection,
  CandidateResult,
} from './types';

/**
 * Calculates projected total votes for an election
 */
export function calculateProjectedTotalVotes(
  baseResult: ElectionResult,
  params: ProjectionParams
): number {
  // Estimated base voters from the previous election
  const baseVoters = baseResult.actualVoters || baseResult.registeredVoters || baseResult.totalVotes;

  if (!baseVoters) {
    throw new Error('Cannot project votes: no base voter data available');
  }

  // Years between base and projection
  const yearsDifference = params.projectionYear - params.baseElectionYear;

  // Apply compound growth: baseVoters * (1 + growthRate)^years
  const projectedVoters = baseVoters * Math.pow(1 + params.voterGrowthRate, yearsDifference);

  // Apply turnout rate
  const projectedTotalVotes = projectedVoters * params.turnoutRate;

  return Math.round(projectedTotalVotes);
}

/**
 * Projects votes for each candidate in an election
 */
export function projectCandidateVotes(
  candidates: CandidateResult[],
  projectedTotalVotes: number,
  baselineTotalVotes: number
): VoteProjection[] {
  const scaleFactor = projectedTotalVotes / baselineTotalVotes;

  return candidates.map((candidate, index) => ({
    candidateName: candidate.name,
    originalVotes: candidate.votes,
    originalPercentage: candidate.percentage || 0,
    projectedVotes: Math.round(candidate.votes * scaleFactor),
    projectedPercentage: (candidate.percentage || 0), // Percentage stays the same
    rank: index + 1,
  }));
}

/**
 * Calculates votes needed for each rank (1st place, 2nd place, etc.)
 * For a single seat (mayor), only rank 1 is relevant.
 * For multiple seats (councilors, senators), ranks 1-N are relevant.
 */
export function calculateVotesNeededForRanks(
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
 * Main calculation function: takes election result and projection params
 * Returns winning thresholds and vote projections
 */
export function calculateWinningThreshold(
  baseResult: ElectionResult,
  params: ProjectionParams,
  numberOfSeats: number = 1
): WinningThreshold {
  // Calculate projected total votes
  const projectedTotalVotes = calculateProjectedTotalVotes(baseResult, params);

  // Project candidate votes
  const projections = projectCandidateVotes(
    baseResult.candidates,
    projectedTotalVotes,
    baseResult.totalVotes
  );

  // Calculate votes needed for each rank
  const votesNeededForRank = calculateVotesNeededForRanks(projections, numberOfSeats);

  return {
    position: baseResult.position,
    numberOfSeats,
    projectedTotalVotes,
    votesNeededForRank,
    projections,
  };
}

/**
 * Utility: Calculate the vote margin needed from a specific rank
 * Useful for determining how many more votes are needed compared to current ranking
 */
export function calculateVoteMargin(
  projections: VoteProjection[],
  candidateIndex: number,
  targetRank: number
): number {
  if (candidateIndex >= projections.length || targetRank > projections.length) {
    throw new Error('Invalid candidate index or target rank');
  }

  const currentVotes = projections[candidateIndex].projectedVotes;
  const targetVotes = projections[targetRank - 1].projectedVotes;

  return targetVotes - currentVotes + 1; // +1 to surpass
}
