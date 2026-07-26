# Election Data

This directory contains sample and imported COMELEC (Commission on Elections) election datasets.

## Data Format

### Required Columns
- `province` - Province name
- `candidate_name` - Full name of candidate
- `votes` - Number of votes received
- `position` - Office being contested (e.g., Mayor, Councilor, President)

### Optional Columns
- `municipality` - Municipality/City name
- `barangay` - Barangay name (for barangay-level elections)
- `candidate_party` - Political party
- `precinct_no` - Precinct identifier
- `registered_voters` - Total registered voters
- `actual_voters` - Voters who actually voted

## Sample Files

Sample COMELEC datasets can be placed in the `sample/` subdirectory for testing and development.

## Data Sources

- **COMELEC Official**: https://www.comelec.gov.ph/
- **COMELEC Transparency Server**: https://transparency.sharekonekta.ph/
- **News Archives**: Major news outlets archive election results

## Preparing Your Data

1. Export election results from COMELEC in CSV format
2. Ensure all required columns are present
3. Verify data integrity (no missing values in required fields)
4. Use the web app to import the CSV
