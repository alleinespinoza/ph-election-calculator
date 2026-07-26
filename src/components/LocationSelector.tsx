'use client';

import React, { useState, useEffect } from 'react';
import { Location, ElectionDataset } from '../lib/types';

interface LocationSelectorProps {
  dataset: ElectionDataset | null;
  onLocationSelect: (location: Location | null) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  dataset,
  onLocationSelect,
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('');

  const [provinces, setProvinces] = useState<Set<string>>(new Set());
  const [municipalities, setMunicipalities] = useState<Set<string>>(new Set());
  const [barangays, setBarangays] = useState<Set<string>>(new Set());

  // Extract unique provinces from dataset
  useEffect(() => {
    if (!dataset) {
      setProvinces(new Set());
      return;
    }

    const uniqueProvinces = new Set(
      dataset.results.map((r) => r.location.province)
    );
    setProvinces(uniqueProvinces);
    setSelectedProvince('');
    setSelectedMunicipality('');
    setSelectedBarangay('');
  }, [dataset]);

  // Extract municipalities for selected province
  useEffect(() => {
    if (!dataset || !selectedProvince) {
      setMunicipalities(new Set());
      return;
    }

    const uniqueMunicipalities = new Set(
      dataset.results
        .filter((r) => r.location.province === selectedProvince)
        .map((r) => r.location.municipality)
        .filter((m): m is string => !!m)
    );
    setMunicipalities(uniqueMunicipalities);
    setSelectedMunicipality('');
    setSelectedBarangay('');
  }, [dataset, selectedProvince]);

  // Extract barangays for selected municipality
  useEffect(() => {
    if (!dataset || !selectedProvince || !selectedMunicipality) {
      setBarangays(new Set());
      return;
    }

    const uniqueBarangays = new Set(
      dataset.results
        .filter(
          (r) =>
            r.location.province === selectedProvince &&
            r.location.municipality === selectedMunicipality
        )
        .map((r) => r.location.barangay)
        .filter((b): b is string => !!b)
    );
    setBarangays(uniqueBarangays);
    setSelectedBarangay('');
  }, [dataset, selectedProvince, selectedMunicipality]);

  // Notify parent of selection
  useEffect(() => {
    if (!selectedProvince) {
      onLocationSelect(null);
      return;
    }

    onLocationSelect({
      province: selectedProvince,
      municipality: selectedMunicipality || undefined,
      barangay: selectedBarangay || undefined,
      level: selectedBarangay
        ? 'barangay'
        : selectedMunicipality
        ? 'municipal'
        : 'provincial',
    });
  }, [selectedProvince, selectedMunicipality, selectedBarangay, onLocationSelect]);

  return (
    <div className="location-selector">
      <h3>Select Location</h3>

      <div className="form-group">
        <label htmlFor="province">Province:</label>
        <select
          id="province"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          disabled={provinces.size === 0}
        >
          <option value="">-- Select Province --</option>
          {Array.from(provinces).sort().map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {municipalities.size > 0 && (
        <div className="form-group">
          <label htmlFor="municipality">Municipality/City:</label>
          <select
            id="municipality"
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
          >
            <option value="">-- All Municipalities --</option>
            {Array.from(municipalities).sort().map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>
        </div>
      )}

      {barangays.size > 0 && (
        <div className="form-group">
          <label htmlFor="barangay">Barangay:</label>
          <select
            id="barangay"
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
          >
            <option value="">-- All Barangays --</option>
            {Array.from(barangays).sort().map((barangay) => (
              <option key={barangay} value={barangay}>
                {barangay}
              </option>
            ))}
          </select>
        </div>
      )}

      <style jsx>{`
        .location-selector {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default LocationSelector;
