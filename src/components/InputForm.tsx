'use client';

import React, { useState } from 'react';
import { Candidate, CalculationParams, PreviousElectionData, CalculationResult, ElectionPosition } from '../lib/types';
import { getAllPositions, formatNumber } from '../lib/data';
import { calculateResults } from '../lib/calculator';
import ResultsDisplay from './ResultsDisplay';

interface InputFormProps {
  onResultsCalculated: (result: CalculationResult) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onResultsCalculated }) => {
  // Form state
  const [selectedPosition, setSelectedPosition] = useState<ElectionPosition>('barangay_captain');
  const [previousElectionYear, setPreviousElectionYear] = useState<string>('2022');
  const [projectionYear, setProjectionYear] = useState<string>(new Date().getFullYear().toString());
  const [registeredVoters, setRegisteredVoters] = useState<string>('10000');
  const [actualVoters, setActualVoters] = useState<string>('6500');
  const [candidates, setCandidates] = useState<Candidate[]>([
    { name: 'Candidate 1', votes: 2500 },
    { name: 'Candidate 2', votes: 2200 },
    { name: 'Candidate 3', votes: 1800 },
  ]);
  const [voterGrowthRate, setVoterGrowthRate] = useState<string>('3');
  const [expectedTurnoutRate, setExpectedTurnoutRate] = useState<string>('65');
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Handle candidate name change
  const handleCandidateNameChange = (index: number, name: string) => {
    const updated = [...candidates];
    updated[index].name = name;
    setCandidates(updated);
  };

  // Handle candidate votes change
  const handleCandidateVotesChange = (index: number, votes: string) => {
    const updated = [...candidates];
    updated[index].votes = parseInt(votes) || 0;
    setCandidates(updated);
  };

  // Add candidate
  const addCandidate = () => {
    setCandidates([...candidates, { name: `Candidate ${candidates.length + 1}`, votes: 0 }]);
  };

  // Remove candidate
  const removeCandidate = (index: number) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  // Handle calculation
  const handleCalculate = () => {
    setError('');
    setResult(null);

    try {
      // Parse and validate inputs
      const baseYear = parseInt(previousElectionYear);
      const projYear = parseInt(projectionYear);
      const regVoters = parseInt(registeredVoters);
      const actVoters = parseInt(actualVoters);
      const growthRate = parseFloat(voterGrowthRate) / 100;
      const turnout = parseFloat(expectedTurnoutRate) / 100;

      if (isNaN(baseYear) || isNaN(projYear) || isNaN(regVoters) || isNaN(actVoters)) {
        throw new Error('Please enter valid numbers for all fields');
      }

      if (baseYear >= projYear) {
        throw new Error('Projection year must be after previous election year');
      }

      if (regVoters <= 0 || actVoters <= 0) {
        throw new Error('Voter counts must be greater than 0');
      }

      if (actVoters > regVoters) {
        throw new Error('Actual voters cannot exceed registered voters');
      }

      if (turnout <= 0 || turnout > 1) {
        throw new Error('Expected turnout must be between 1% and 100%');
      }

      if (candidates.some((c) => c.votes < 0)) {
        throw new Error('Candidate votes cannot be negative');
      }

      const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
      if (totalVotes === 0) {
        throw new Error('At least one candidate must have votes');
      }

      // Prepare data
      const previousData: PreviousElectionData = {
        position: selectedPosition,
        year: baseYear,
        candidates,
        totalVotes,
        registeredVoters: regVoters,
        actualVoters: actVoters,
        turnoutRate: actVoters / regVoters,
      };

      const params: CalculationParams = {
        voterGrowthRate: growthRate,
        expectedTurnoutRate: turnout,
        baseYear,
        projectionYear: projYear,
      };

      // Calculate
      const calculatedResult = calculateResults(previousData, params);
      setResult(calculatedResult);
      onResultsCalculated(calculatedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
    }
  };

  const positions = getAllPositions();
  const currentYear = new Date().getFullYear();
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
  const actualVoters = parseInt(actualVoters);
  const registeredVoters = parseInt(registeredVoters);
  const turnoutPercentage = registeredVoters > 0 ? (actualVoters / registeredVoters) * 100 : 0;

  return (
    <div className="input-form">
      <div className="form-container">
        <h2>⚙️ Election Calculator</h2>

        {/* Position Selection */}
        <section className="form-section">
          <h3>1. Select Position</h3>
          <div className="form-group">
            <label htmlFor="position">Position:</label>
            <select
              id="position"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value as ElectionPosition)}
              className="select-input"
            >
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.label} ({pos.seats} seat{pos.seats > 1 ? 's' : ''})
                </option>
              ))}
            </select>
            <p className="help-text">{positions.find((p) => p.id === selectedPosition)?.description}</p>
          </div>
        </section>

        {/* Previous Election Data */}
        <section className="form-section">
          <h3>2. Previous Election Data</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prev-year">Previous Election Year:</label>
              <input
                id="prev-year"
                type="number"
                min="2000"
                max={currentYear - 1}
                value={previousElectionYear}
                onChange={(e) => setPreviousElectionYear(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-voters">Registered Voters:</label>
              <input
                id="reg-voters"
                type="number"
                min="1"
                value={registeredVoters}
                onChange={(e) => setRegisteredVoters(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label htmlFor="act-voters">Actual Voters (Turnout):</label>
              <input
                id="act-voters"
                type="number"
                min="1"
                value={actualVoters}
                onChange={(e) => setActualVoters(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="info-box">
            <p><strong>Turnout Rate:</strong> {turnoutPercentage.toFixed(2)}%</p>
            <p><strong>Total Votes Cast:</strong> {formatNumber(totalVotes)}</p>
          </div>

          {/* Candidates Input */}
          <div className="candidates-section">
            <h4>Candidates from Previous Election:</h4>
            <div className="candidates-list">
              {candidates.map((candidate, index) => (
                <div key={index} className="candidate-row">
                  <input
                    type="text"
                    value={candidate.name}
                    onChange={(e) => handleCandidateNameChange(index, e.target.value)}
                    placeholder="Candidate name"
                    className="candidate-name"
                  />
                  <input
                    type="number"
                    value={candidate.votes}
                    onChange={(e) => handleCandidateVotesChange(index, e.target.value)}
                    placeholder="Votes"
                    className="candidate-votes"
                    min="0"
                  />
                  <span className="percentage">
                    {totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(2) : 0}%
                  </span>
                  {candidates.length > 1 && (
                    <button
                      onClick={() => removeCandidate(index)}
                      className="remove-btn"
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addCandidate} className="add-candidate-btn" type="button">
              + Add Candidate
            </button>
          </div>
        </section>

        {/* Projection Parameters */}
        <section className="form-section">
          <h3>3. Projection Parameters</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="growth-rate">Annual Voter Growth Rate (%):</label>
              <input
                id="growth-rate"
                type="number"
                step="0.1"
                min="-10"
                max="10"
                value={voterGrowthRate}
                onChange={(e) => setVoterGrowthRate(e.target.value)}
                className="input-field"
              />
              <p className="help-text">Typical range: 2-4% per year</p>
            </div>
            <div className="form-group">
              <label htmlFor="turnout">Expected Turnout Rate (%):</label>
              <input
                id="turnout"
                type="number"
                step="1"
                min="1"
                max="100"
                value={expectedTurnoutRate}
                onChange={(e) => setExpectedTurnoutRate(e.target.value)}
                className="input-field"
              />
              <p className="help-text">Typical range: 50-80%</p>
            </div>
            <div className="form-group">
              <label htmlFor="proj-year">Projection Year:</label>
              <input
                id="proj-year"
                type="number"
                min={parseInt(previousElectionYear) + 1}
                max={currentYear + 10}
                value={projectionYear}
                onChange={(e) => setProjectionYear(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && <div className="error-box">{error}</div>}

        {/* Calculate Button */}
        <button onClick={handleCalculate} className="calculate-btn">
          Calculate Results
        </button>
      </div>

      {/* Results */}
      <ResultsDisplay result={result} />

      <style jsx>{`
        .input-form {
          padding: 2rem 0;
        }

        .form-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #eee;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        h3 {
          margin-bottom: 1rem;
          color: #555;
          font-size: 1.1rem;
        }

        h4 {
          margin-bottom: 1rem;
          color: #666;
          font-size: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }

        .input-field,
        .select-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .input-field:focus,
        .select-input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }

        .help-text {
          margin: 0.5rem 0 0 0;
          font-size: 0.85rem;
          color: #999;
        }

        .info-box {
          background: #e3f2fd;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .info-box p {
          margin: 0.25rem 0;
          color: #1565c0;
        }

        .candidates-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }

        .candidates-list {
          margin-bottom: 1rem;
        }

        .candidate-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .candidate-name {
          flex: 2;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95rem;
        }

        .candidate-votes {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95rem;
        }

        .percentage {
          flex: 0.5;
          text-align: right;
          font-weight: 600;
          color: #666;
          min-width: 50px;
        }

        .remove-btn {
          padding: 0.5rem;
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          min-width: 40px;
        }

        .remove-btn:hover {
          background: #ff5252;
        }

        .add-candidate-btn {
          padding: 0.75rem 1.5rem;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .add-candidate-btn:hover {
          background: #45a049;
        }

        .error-box {
          background: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          border-left: 4px solid #c62828;
        }

        .calculate-btn {
          width: 100%;
          padding: 1rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .calculate-btn:hover {
          background: #1565c0;
        }

        .calculate-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default InputForm;
