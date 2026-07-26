'use client';

import React from 'react';
import { ElectionResult } from '../lib/types';

interface ResultsDisplayProps {
  results: ElectionResult[] | null;
  selectedPosition?: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  selectedPosition,
}) => {
  if (!results || results.length === 0) {
    return <div className="results-display">No results to display</div>;
  }

  // Filter by position if specified
  const filteredResults = selectedPosition
    ? results.filter((r) => r.position === selectedPosition)
    : results;

  if (filteredResults.length === 0) {
    return <div className="results-display">No results for this position</div>;
  }

  return (
    <div className="results-display">
      <h3>Previous Election Results</h3>

      {filteredResults.map((result, index) => (
        <div key={index} className="result-card">
          <h4>
            {result.location.barangay && `${result.location.barangay}, `}
            {result.location.municipality && `${result.location.municipality}, `}
            {result.location.province}
          </h4>
          <p className="position">Position: {result.position}</p>
          <p className="year">Election Year: {result.electionYear}</p>

          {result.turnoutRate && (
            <p className="turnout">
              Turnout Rate: {(result.turnoutRate * 100).toFixed(2)}%
            </p>
          )}

          <table className="candidates-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Party</th>
                <th>Votes</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {result.candidates.map((candidate, candidateIndex) => (
                <tr key={candidateIndex}>
                  <td>{candidateIndex + 1}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.party || '-'}</td>
                  <td>{candidate.votes.toLocaleString()}</td>
                  <td>{(candidate.percentage || 0).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="total-votes">
            Total Votes: {result.totalVotes.toLocaleString()}
          </p>
        </div>
      ))}

      <style jsx>{`
        .results-display {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fafafa;
        }
        .result-card {
          margin-bottom: 2rem;
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 4px;
          background-color: white;
        }
        h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        .position,
        .year,
        .turnout {
          margin: 0.25rem 0;
          color: #666;
          font-size: 0.95rem;
        }
        .candidates-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.9rem;
        }
        thead {
          background-color: #f0f0f0;
        }
        th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #ddd;
        }
        td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #eee;
        }
        tr:hover {
          background-color: #f9f9f9;
        }
        .total-votes {
          margin-top: 0.5rem;
          font-weight: 600;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;
