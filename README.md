# Philippine Election Calculator

A web application for estimating vote requirements in Philippine barangay and national-local elections based on historical data and projected voter growth.

## Features

- **COMELEC Data Import**: Parse and import Philippine election data in COMELEC format
- **Location-Based Selection**: Choose barangay, municipality, or province for analysis
- **Historical Results Display**: View previous election results by candidate
- **Vote Projection**: Calculate estimated votes needed to win based on:
  - Voter population growth rate
  - Expected voter turnout rate
  - Historical election data
- **Multi-Seat Support**: Handle elections with multiple seats (councilors, senators)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
git clone https://github.com/alleinespinoza/ph-election-calculator.git
cd ph-election-calculator
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── components/          # React UI components
│   ├── LocationSelector.tsx     # Location picker
│   ├── ResultsDisplay.tsx       # Display election results
│   ├── Calculator.tsx           # Vote projection interface
│   └── DataUploader.tsx         # COMELEC CSV upload
├── lib/
│   ├── comelecImporter.ts       # COMELEC CSV parser
│   ├── calculator.ts             # Vote projection calculations
│   ├── types.ts                  # TypeScript type definitions
│   └── data.ts                   # Data management utilities
├── pages/
│   ├── index.tsx                 # Home page
│   ├── _app.tsx                  # Next.js app wrapper
│   └── _document.tsx             # Document setup
└── styles/                       # CSS/styling

data/
├── sample/                       # Sample COMELEC datasets
│   ├── 2022_national_sample.csv
│   ├── 2022_local_sample.csv
│   └── 2022_barangay_sample.csv
└── README.md                     # Data format documentation

public/                           # Static assets
```

## COMELEC Data Format

Supported CSV structure:

| province | municipality | barangay | candidate_name | candidate_party | votes | position |
|----------|-------------|----------|----------------|-----------------|---------|--------------|
| Laguna   | Sta. Rosa   | San Jose | Juan Dela Cruz | Sample Party    | 2,350   | Mayor    |

**Required fields:**
- `province`
- `municipality` 
- `candidate_name`
- `votes`
- `position`

**Optional fields:**
- `barangay` (for barangay-level elections)
- `candidate_party`
- `precinct_no`
- `registered_voters`
- `actual_voters`

## Usage

1. **Upload Data**: Import a COMELEC CSV file with election results
2. **Select Location**: Choose the barangay, municipality, or province
3. **View Results**: See historical vote counts for all candidates
4. **Project Votes**: Enter voter growth rate and turnout percentage
5. **View Calculation**: See estimated votes needed for each rank

## Development

### Running Tests

```bash
npm test
```

### Project Roadmap

- [ ] COMELEC CSV importer implementation
- [ ] Data storage/caching system
- [ ] Vote projection calculator
- [ ] UI components
- [ ] Unit tests
- [ ] Sample datasets
- [ ] Documentation

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
