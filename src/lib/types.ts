/**
 * Type definitions for Philippine election data
 */

export type ElectionLevel = 'barangay' | 'municipal' | 'provincial' | 'national';
export type Position = 'President' | 'Vice President' | 'Senator' | 'Mayor' | 'Vice Mayor' | 'Councilor' | 'Barangay Captain' | 'Barangay Councilor' | string;

/**
 * Represents a geographic location in the Philippines
 */
export interface Location {
  province: string;
  municipality?: string;
  barangay?: string;
  level: ElectionLevel;
}

/**
 * Raw row from COMELEC CSV import
 */
export interface ComelecRawRow {
  province: string;
  municipality?: string;
  barangay?: string;
  candidate_name: string;
  candidate_party?: string;
  votes: string | number;
  position: string;
  precinct_no?: string;
  registered_voters?: string | number;
  actual_voters?: string | number;
  [key: string]: any;
}

/**
 * Parsed candidate result from election
 */
export interface CandidateResult {
  name: string;
  party?: string;
  votes: number;
  percentage?: number;
}

/**
 * Election result set for a specific location and position
 */
export interface ElectionResult {
  location: Location;
  position: Position;
  electionYear: number;
  candidates: CandidateResult[];
  totalVotes: number;
  registeredVoters?: number;
  actualVoters?: number;
  turnoutRate?: number;
}

/**
 * Projection parameters for vote calculation
 */
export interface ProjectionParams {
  voterGrowthRate: number; // as decimal: 0.05 for 5%
  turnoutRate: number; // as decimal: 0.60 for 60%
  baseElectionYear: number; // year of base data
  projectionYear: number; // year to project to
}

/**
 * Projected votes for a candidate
 */
export interface VoteProjection {
  candidateName: string;
  originalVotes: number;
  originalPercentage: number;
  projectedVotes: number;
  projectedPercentage: number;
  rank: number;
}

/**
 * Calculation result showing votes needed to win
 */
export interface WinningThreshold {
  position: Position;
  numberOfSeats: number; // 1 for mayor, multiple for councilors/senators
  projectedTotalVotes: number;
  votesNeededForRank: { [rank: number]: number }; // votes needed for 1st, 2nd, 3rd place etc
  projections: VoteProjection[];
}

/**
 * Represents a complete election dataset
 */
export interface ElectionDataset {
  electionYear: number;
  electionType: 'national' | 'local' | 'barangay';
  results: ElectionResult[];
  lastUpdated: Date;
}
