# CropLog Frontend

A modern React-based web application for agricultural harvest tracking and farm management.

## Overview

CropLog is a comprehensive harvest logging system that allows farmers and agricultural professionals to:

- Log daily harvest entries with crop, quantity, field, and date information
- View and analyze historical harvest data
- Manage farm metadata (crops, fields, categories, measurement units)
- Track harvest patterns across different time periods

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS v4
- **HTTP Client:** Axios
- **Validation:** Zod
- **Development:** ESLint

## Features

### 🌱 Harvest Logging
- Quick harvest entry with date, crop, amount, and field selection
- Real-time form validation
- Support for custom harvest dates

### 📊 Harvest Analytics
- Historical harvest log with filtering capabilities
- Date range selection for targeted analysis
- Tabular display of harvest records
- Latest entry tracking

### ⚙️ Farm Management
- **Crops:** Add, edit, and manage crop varieties
- **Fields:** Organize and track different field locations
- **Categories:** Categorize crops and harvests
- **Measure Units:** Define custom measurement units

### 🔐 Authentication
- User registration and login system
- Protected routes for authenticated users
- Session management with Redux

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd new-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code analysis

## Project Structure

```
src/
├── authentification/          # Authentication components and context
├── components/               # Reusable UI components
│   ├── harvestFields/       # Field selection components
│   ├── harvestLog/          # Log display components
│   ├── modify/              # Farm data management
│   ├── newHarvestEntry/     # Harvest entry forms
│   └── universal/           # Shared components
├── context/                 # React context providers
├── pages/                   # Main page components
├── reduxStore/             # Redux store and slices
│   └── Slices/             # Redux state slices
├── routes/                 # Application routing
└── service/                # API services and utilities
```

## Key Components

### Main Pages
- **MainPage** (`src/pages/MainPage.jsx`) - Primary harvest entry interface
- **HarvestLog** (`src/pages/HarvestLog.jsx`) - Historical data viewer

### Core Features
- **Authentication** - Complete login/register system with protected routes
- **Harvest Entry** - Multi-step form for logging harvests
- **Data Management** - CRUD operations for crops, fields, and categories

### State Management
- Redux Toolkit for global state
- React Context for feature-specific state
- Custom hooks for form management

## API Integration

The application integrates with a backend API through the service layer:

- `apiService.js` - Core harvest and user data operations
- `modifyService.js` - Farm metadata management
- `utils.js` - Utility functions and validation

## Development Guidelines

### Code Style
- ESLint configuration for consistent code formatting
- React functional components with hooks
- Modern ES6+ JavaScript features

### Component Organization
- Feature-based component grouping
- Reusable components in `/universal`
- Page-level components in `/pages`

### State Management
- Redux for global application state
- React Context for feature-specific state
- Custom hooks for complex logic

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment.

## Contributing

1. Follow the existing code structure and naming conventions
2. Use functional components with React hooks
3. Implement proper error handling for API calls
4. Add appropriate validation for user inputs
5. Test components thoroughly before submitting

## License

[Add your license information here]

## Support

For questions or issues, please [create an issue](link-to-issues) or contact the development team.