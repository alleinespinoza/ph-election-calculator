'use client';

import React, { useState } from 'react';
import { ElectionResult, ProjectionParams, WinningThreshold } from '../lib/types';
import { calculateWinningThreshold } from '../lib/calculator';

interface CalculatorProps {
  results: ElectionResult[] | null;
  selectedPosition?: string;
}

const Calculator: React.FC<CalculatorProps> = ({ results, selectedPosition }) => {
  const [voterGrowthRate, setVoterGrowthRate] = useState<string>('3'); // 3%
  const [turnoutRate, setTurnoutRate] = useState<string>('60'); // 60%
  const [numberOfSeats, setNumberOfSeats] = useState<string>('1');
  const [projection, setProjection] = useState<WinningThreshold | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    setError('');
    setProjection(null);

    try {
      if (!results || results.length === 0) {
        setError('No election results available');
        return;
      }

      // Get the result to calculate from
      const baseResult = selectedPosition
        ? results.find((r) => r.position === selectedPosition)
        : results[0];

      if (!baseResult) {
        setError('Selected position not found in results');
        return;
      }

      // Parse inputs
      const growthRate = parseFloat(voterGrowthRate) / 100;
      const turnout = parseFloat(turnoutRate) / 100;
      const seats = Math.max(1, parseInt(numberOfSeats, 10));

      if (isNaN(growthRate) || isNaN(turnout) || isNaN(seats)) {
        setError('Invalid input values');
        return;
      }

      if (turnout <= 0 || turnout > 1) {
        setError('Turnout rate must be between 0% and 100%');
        return;
      }

      // Calculate projection
      const params: ProjectionParams = {
        voterGrowthRate: growthRate,
        turnoutRate: turnout,
        baseElectionYear: baseResult.electionYear,
        projectionYear: new Date().getFullYear(),
      };

      const result = calculateWinningThreshold(baseResult, params, seats);
      setProjection(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
    }
  };

  return (
    <div className="calculator">
      <h3>Vote Calculator</h3>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="growth-rate">
            Voter Growth Rate (% per year):
          </label>
          <input
            id="growth-rate"
            type="number"
            step="0.1"
            min="-10"
            max="10"
            value={voterGrowthRate}
            onChange={(e) => setVoterGrowthRate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="turnout-rate">
            Expected Turnout Rate (%):
          </label>
          <input
            id="turnout-rate"
            type="number"
            step="1"
            min="0"
            max="100"
            value={turnoutRate}
            onChange={(e) => setTurnoutRate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="seats">
            Number of Seats:
          </label>
          <input
            id="seats"
            type="number"
            step="1"
            min="1"
            value={numberOfSeats}
            onChange={(e) => setNumberOfSeats(e.target.value)}
          />
        </div>

        <button onClick={handleCalculate} className="calculate-btn">
          Calculate
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {projection && (
        <div className="projection-results">
          <h4>Projection Results</h4>
          <p className="position">Position: {projection.position}</p>
          <p className="total-votes">
            Projected Total Votes: {projection.projectedTotalVotes.toLocaleString()}
          </p>

          <h5>Votes Needed for Each Rank:</h5>
          <table className="votes-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Votes Needed</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(projection.votesNeededForRank).map(([rank, votes]) => (
                <tr key={rank}>
                  <td>#{rank}</td>
                  <td>{votes.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5>Candidate Projections:</h5>
          <table className="projections-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Original Votes</th>
                <th>Projected Votes</th>
                <th>Vote % (estimated)</th>
              </tr>
            </thead>
            <tbody>
              {projection.projections.map((proj, index) => (
                <tr key={index}>
                  <td>{proj.rank}</td>
                  <td>{proj.candidateName}</td>
                  <td>{proj.originalVotes.toLocaleString()}</td>
                  <td>{proj.projectedVotes.toLocaleString()}</td>
                  <td>{proj.projectedPercentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .calculator {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f0f7ff;
        }
        .form-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: end;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        input {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        .calculate-btn {
          padding: 0.5rem 1.5rem;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .calculate-btn:hover {
          background-color: #1565c0;
        }
        .error-message {
          color: #d32f2f;
          background-color: #ffebee;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .projection-results {
          margin-top: 1.5rem;
          padding: 1rem;
          background-color: white;
          border-radius: 4px;
        }
        .position,
        .total-votes {
          margin: 0.5rem 0;
          color: #333;
          font-weight: 600;
        }
        h5 {
          margin: 1rem 0 0.5rem 0;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        thead {
          background-color: #e3f2fd;
        }
        th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #90caf9;
        }
        td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #e0e0e0;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default Calculator;
