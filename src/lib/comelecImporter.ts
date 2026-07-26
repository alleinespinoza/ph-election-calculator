/**
 * COMELEC CSV data importer
 * Handles parsing and validation of Philippine election data
 */

import Papa from 'papaparse';
import {
  ComelecRawRow,
  ElectionResult,
  CandidateResult,
  Location,
  ElectionLevel,
  ElectionDataset,
} from './types';

/**
 * Parses a COMELEC CSV string into election data
 */
export function parseComelecCsv(csvContent: string): ComelecRawRow[] {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.toLowerCase().trim(),
      complete: (results: Papa.ParseResult<ComelecRawRow>) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error: Papa.ParseError) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  }) as Promise<ComelecRawRow[]>;
}

/**
 * Validates that required COMELEC fields are present
 */
function validateRequiredFields(row: ComelecRawRow): boolean {
  return (
    row.province &&
    row.candidate_name &&
    row.votes !== undefined &&
    row.position
  );
}

/**
 * Converts votes string to number, handling comma separators
 */
function parseVotes(votes: string | number): number {
  if (typeof votes === 'number') return votes;
  return parseInt(votes.toString().replace(/,/g, ''), 10);
}

/**
 * Determines election level from data
 */
function determineElectionLevel(row: ComelecRawRow): ElectionLevel {
  if (row.barangay) return 'barangay';
  if (row.municipality) return 'municipal';
  if (row.province) return 'provincial';
  return 'national';
}

/**
 * Creates a Location object from a COMELEC row
 */
function createLocation(row: ComelecRawRow): Location {
  return {
    province: row.province || 'National',
    municipality: row.municipality,
    barangay: row.barangay,
    level: determineElectionLevel(row),
  };
}

/**
 * Groups raw COMELEC data by location and position
 */
function groupByLocationAndPosition(rows: ComelecRawRow[]): Map<string, ComelecRawRow[]> {
  const groups = new Map<string, ComelecRawRow[]>();

  rows.forEach((row) => {
    const location = createLocation(row);
    const key = `${location.province}|${location.municipality || ''}|${location.barangay || ''}|${row.position}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  return groups;
}

/**
 * Converts grouped raw data into ElectionResult objects
 */
function createElectionResults(
  electionYear: number,
  groupedData: Map<string, ComelecRawRow[]>
): ElectionResult[] {
  const results: ElectionResult[] = [];

  groupedData.forEach((rows) => {
    if (rows.length === 0) return;

    const firstRow = rows[0];
    const location = createLocation(firstRow);

    // Sum votes by candidate
    const candidateVotes = new Map<string, { votes: number; party?: string }>();
    let totalVotes = 0;
    let registeredVoters: number | undefined;
    let actualVoters: number | undefined;

    rows.forEach((row) => {
      const votes = parseVotes(row.votes);
      const candidateName = row.candidate_name.trim();

      if (!candidateVotes.has(candidateName)) {
        candidateVotes.set(candidateName, {
          votes: 0,
          party: row.candidate_party || undefined,
        });
      }

      const existing = candidateVotes.get(candidateName)!;
      existing.votes += votes;
      totalVotes += votes;

      if (row.registered_voters && !registeredVoters) {
        registeredVoters = parseVotes(row.registered_voters);
      }
      if (row.actual_voters && !actualVoters) {
        actualVoters = parseVotes(row.actual_voters);
      }
    });

    // Create candidate results sorted by votes (descending)
    const candidates: CandidateResult[] = Array.from(candidateVotes.entries())
      .map(([name, data]) => ({
        name,
        party: data.party,
        votes: data.votes,
        percentage: totalVotes > 0 ? (data.votes / totalVotes) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes);

    const turnoutRate =
      actualVoters && registeredVoters ? actualVoters / registeredVoters : undefined;

    results.push({
      location,
      position: firstRow.position as any,
      electionYear,
      candidates,
      totalVotes,
      registeredVoters,
      actualVoters,
      turnoutRate,
    });
  });

  return results;
}

/**
 * Main function: Converts COMELEC CSV content to ElectionDataset
 */
export async function importComelecData(
  csvContent: string,
  electionYear: number,
  electionType: 'national' | 'local' | 'barangay'
): Promise<ElectionDataset> {
  try {
    // Parse CSV
    const rawRows = await parseComelecCsv(csvContent);

    // Validate and filter rows
    const validRows = rawRows.filter(validateRequiredFields);

    if (validRows.length === 0) {
      throw new Error('No valid election data found in CSV');
    }

    // Group data and create results
    const grouped = groupByLocationAndPosition(validRows);
    const results = createElectionResults(electionYear, grouped);

    return {
      electionYear,
      electionType,
      results,
      lastUpdated: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to import COMELEC data: ${error instanceof Error ? error.message : String(error)}`);
  }
}
