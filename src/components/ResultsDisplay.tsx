'use client';

import React, { useState } from 'react';
import { getAllPositions, getPositionInfo, formatNumber, formatPercentage } from '../lib/data';
import { CalculationResult } from '../lib/types';

interface ResultsDisplayProps {
  result: CalculationResult | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  const { position, projections, votesNeededByRank, previousTotalVotes, projectedTotalVotes } = result;

  return (
    <div className="results-display">
      <h3>📊 Calculation Results</h3>

      <div className="summary-cards">
        <div className="card">
          <p className="label">Position</p>
          <p className="value">{position.label}</p>
        </div>
        <div className="card">
          <p className="label">Previous Total Votes</p>
          <p className="value">{formatNumber(previousTotalVotes)}</p>
        </div>
        <div className="card">
          <p className="label">Projected Total Votes</p>
          <p className="value">{formatNumber(projectedTotalVotes)}</p>
        </div>
        <div className="card">
          <p className="label">Votes Growth</p>
          <p className="value" style={{
            color: projectedTotalVotes >= previousTotalVotes ? '#4caf50' : '#f44336'
          }}>
            {formatNumber(projectedTotalVotes - previousTotalVotes)}
          </p>
        </div>
      </div>

      <div className="votes-needed-section">
        <h4>🏆 Votes Needed for Each Rank</h4>
        <div className="votes-grid">
          {Object.entries(votesNeededByRank).map(([rank, votes]) => (
            <div key={rank} className="vote-card">
              <p className="rank">Rank #{rank}</p>
              <p className="votes">{formatNumber(votes)}</p>
              <p className="percentage">{formatPercentage((votes / projectedTotalVotes) * 100)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="projections-section">
        <h4>👥 Candidate Projections</h4>
        <table className="projections-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate Name</th>
              <th>Previous Votes</th>
              <th>Projected Votes</th>
              <th>Vote Share</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((proj, index) => (
              <tr key={index}>
                <td className="rank-cell">#{proj.rank}</td>
                <td>{proj.candidateName}</td>
                <td>{formatNumber(proj.previousVotes)}</td>
                <td className="projected-votes">{formatNumber(proj.projectedVotes)}</td>
                <td>{formatPercentage(proj.projectedPercentage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .results-display {
          padding: 2rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin-top: 2rem;
        }

        h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .card .label {
          font-size: 0.85rem;
          color: #666;
          margin: 0 0 0.5rem 0;
          font-weight: 500;
        }

        .card .value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1976d2;
          margin: 0;
        }

        .votes-needed-section {
          margin-bottom: 2rem;
        }

        h4 {
          margin-bottom: 1rem;
          color: #333;
        }

        .votes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .vote-card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #1976d2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .vote-card .rank {
          font-size: 0.9rem;
          color: #666;
          margin: 0 0 0.5rem 0;
        }

        .vote-card .votes {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1976d2;
          margin: 0 0 0.5rem 0;
        }

        .vote-card .percentage {
          font-size: 0.9rem;
          color: #999;
          margin: 0;
        }

        .projections-section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .projections-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        thead {
          background-color: #e3f2fd;
        }

        th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #1976d2;
          border-bottom: 2px solid #90caf9;
        }

        td {
          padding: 0.75rem;
          border-bottom: 1px solid #eee;
        }

        .rank-cell {
          font-weight: 600;
          color: #1976d2;
        }

        .projected-votes {
          font-weight: 600;
          color: #4caf50;
        }

        tbody tr:hover {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;
