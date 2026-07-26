import React, { useState } from 'react';
import Head from 'next/head';
import DataUploader from '../src/components/DataUploader';
import LocationSelector from '../src/components/LocationSelector';
import ResultsDisplay from '../src/components/ResultsDisplay';
import Calculator from '../src/components/Calculator';
import { ElectionDataset, Location, ElectionResult } from '../src/lib/types';

export default function Home() {
  const [dataset, setDataset] = useState<ElectionDataset | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filteredResults, setFilteredResults] = useState<ElectionResult[]>([]);

  const handleDataLoaded = (newDataset: ElectionDataset) => {
    setDataset(newDataset);
    setSelectedLocation(null);
    setFilteredResults([]);
  };

  const handleLocationSelect = (location: Location | null) => {
    setSelectedLocation(location);

    if (!location || !dataset) {
      setFilteredResults([]);
      return;
    }

    // Filter results by location
    const filtered = dataset.results.filter((result) => {
      if (result.location.province !== location.province) return false;
      if (location.municipality && result.location.municipality !== location.municipality)
        return false;
      if (location.barangay && result.location.barangay !== location.barangay)
        return false;
      return true;
    });

    setFilteredResults(filtered);
  };

  return (
    <>
      <Head>
        <title>Philippine Election Calculator</title>
        <meta name="description" content="Calculate votes needed to win Philippine elections" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container">
        <header className="header">
          <h1>🗳️ Philippine Election Calculator</h1>
          <p>Estimate vote requirements based on historical election data</p>
        </header>

        <div className="content">
          <section className="section">
            <DataUploader onDataLoaded={handleDataLoaded} />
          </section>

          {dataset && (
            <>
              <section className="section">
                <LocationSelector dataset={dataset} onLocationSelect={handleLocationSelect} />
              </section>

              {filteredResults.length > 0 && (
                <>
                  <section className="section">
                    <ResultsDisplay results={filteredResults} />
                  </section>

                  <section className="section">
                    <Calculator results={filteredResults} />
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        main {
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .header {
          text-align: center;
          margin-bottom: 3rem;
          color: #333;
        }
        .header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
        }
        .header p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }
        .content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .section {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
