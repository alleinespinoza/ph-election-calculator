'use client';

import React, { useState, useRef } from 'react';
import { importComelecData } from '../lib/comelecImporter';
import { ElectionDataset } from '../lib/types';

interface DataUploaderProps {
  onDataLoaded: (dataset: ElectionDataset) => void;
  isLoading?: boolean;
}

const DataUploader: React.FC<DataUploaderProps> = ({
  onDataLoaded,
  isLoading = false,
}) => {
  const [error, setError] = useState<string>('');
  const [electionYear, setElectionYear] = useState<string>('2022');
  const [electionType, setElectionType] = useState<'national' | 'local' | 'barangay'>('local');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const content = await file.text();
      const year = parseInt(electionYear, 10);

      if (isNaN(year)) {
        setError('Invalid election year');
        return;
      }

      const dataset = await importComelecData(content, year, electionType);
      onDataLoaded(dataset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="data-uploader">
      <h3>Upload COMELEC Data</h3>

      <div className="form-group">
        <label htmlFor="election-year">Election Year:</label>
        <input
          id="election-year"
          type="number"
          value={electionYear}
          onChange={(e) => setElectionYear(e.target.value)}
          min="2000"
          max={new Date().getFullYear()}
        />
      </div>

      <div className="form-group">
        <label htmlFor="election-type">Election Type:</label>
        <select
          id="election-type"
          value={electionType}
          onChange={(e) => setElectionType(e.target.value as any)}
        >
          <option value="national">National</option>
          <option value="local">Local (Provincial/Municipal)</option>
          <option value="barangay">Barangay</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="csv-file">CSV File:</label>
        <input
          id="csv-file"
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .data-uploader {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
          background-color: #f9f9f9;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        input[type='number'],
        input[type='file'],
        select {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .error-message {
          color: #d32f2f;
          background-color: #ffebee;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default DataUploader;
