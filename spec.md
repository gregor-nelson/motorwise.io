# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MotCheck-UK is a vehicle analysis platform that provides comprehensive MOT history, DVLA data, and vehicle insights. The architecture consists of a React frontend and multiple specialized Python/FastAPI backend services.

## Development Commands

### Frontend (React + Vite)
- **Development server**: `npm run dev` (in `/frontend/`)
- **Build**: `npm run build` (in `/frontend/`)
- **Lint**: `npm run lint` (in `/frontend/`)
- **Preview**: `npm run preview` (in `/frontend/`)

### Backend Services
Individual services run independently. Common structure:
- **Start service**: `python main.py` or `python app.py` (in respective service directory)
- **Logs**: Check `*.log` files in each service directory

### Development Environment
Use the GUI launcher: `python configs/dev_start.py` to manage all services simultaneously.

## Architecture

### Frontend (`/frontend/`)
- **Framework**: React 19 with Vite build system
- **UI Library**: Material-UI (@mui/material)
- **Routing**: React Router DOM
- **Payment**: Stripe integration
- **Charts**: Recharts for data visualization
- **PDF**: pdfmake for report generation

Key components:
- `/src/components/AutoData/` - Vehicle data and analysis components
- `/src/components/Results/` - MOT history and search results
- `/src/pages/` - Main application pages
- `/src/middleware/` - Custom middleware for data processing

### Backend Services (`/backend/`)

**Service Architecture**: Microservices pattern with specialized APIs:

1. **DVLA API** (`/dvla_api/`) - Port 8004
   - DVLA Vehicle Enquiry Service integration
   - Vehicle registration data retrieval

2. **MOT API** (`/mot_api/`) - Port varies
   - MOT history data from government APIs
   - Test results and advisory information

3. **Auto Data API** (`/auto_data_api/`) - Port 8005
   - Repair times and technical specifications
   - Vehicle-specific maintenance data

4. **Claude API** (`/claude_api/`)
   - AI-powered vehicle analysis
   - Risk assessment and insights generation

5. **Manual API** (`/manual_api/`)
   - MOT manual data and guidance
   - Test procedures and requirements

6. **Stripe API** (`/stripe_api/`)
   - Payment processing for premium features

7. **TSB API** (`/tsb_api/`)
   - Technical Service Bulletins
   - Manufacturer recall and fix information

### Data Processing

**Vehicle Analysis Pipeline**:
1. Registration lookup via DVLA API
2. MOT history retrieval and analysis
3. Cross-reference with technical specifications
4. AI-powered risk assessment via Claude API
5. Integration with TSB/recall data

**Key Data Sources**:
- `/backend/auto_data_api/data/` - Static vehicle data (repair times, tech specs)
- `/utils/fix_details*/` - Detailed fix information for specific vehicles
- Cache systems for API responses

### Environment Configuration

Services use environment variables for:
- API keys (DVLA_API_KEY, MOT_CLIENT_ID, etc.)
- Service ports and hosts
- External API endpoints
- Feature flags (USE_TEST_ENV)

### Service Communication

- **CORS**: Configured for cross-origin requests between frontend and APIs
- **Middleware**: Compression, logging, and error handling
- **Caching**: TTL caches for expensive API calls
- **Rate Limiting**: Implemented in individual services

## Key Development Notes

### Frontend Development
- Uses ES modules and Vite for fast development
- Material-UI theming system in `/src/styles/`
- Component-based architecture with reusable elements
- React Router for client-side navigation

### Backend Development
- FastAPI framework with async/await patterns
- Pydantic models for request/response validation
- Structured logging to individual service log files
- Environment-based configuration management

### Data Integration
- JSON-based data storage for static information
- API caching to reduce external service calls
- Error handling and fallback mechanisms
- Structured data parsing for technical specifications

### Service Orchestration
The `configs/dev_start.py` provides a PyQt6 GUI for managing all services during development, with features like:
- Individual service start/stop controls
- Real-time log viewing with ANSI color support
- Service status monitoring
- Bulk operations (start all, stop all, clear logs)