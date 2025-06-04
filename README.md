
**MotCheck-UK is a comprehensive vehicle analysis platform providing MOT history, DVLA data, and insightful vehicle diagnostics for UK vehicles.**

This platform leverages a microservice architecture with a React frontend and multiple specialized Python/FastAPI backend services to deliver timely and accurate vehicle information.
---

## Features

* **Comprehensive MOT History:** Access detailed MOT test results and advisory information.
* **DVLA Vehicle Data:** Retrieve up-to-date vehicle registration details from the DVLA.
* **Technical Specifications:** View vehicle-specific maintenance data and repair times.
* **AI-Powered Insights:** Leverage AI for vehicle risk assessment and diagnostic insights (via Claude API).
* **MOT Manual Access:** Browse MOT manual data, guidance, test procedures, and requirements.
* **Technical Service Bulletins (TSBs):** Stay informed about manufacturer recalls and fix information.
* **Premium Features:** Secure payment processing via Stripe for advanced functionalities.
* **Data Visualization:** Interactive charts for understanding vehicle data.
* **PDF Report Generation:** Create downloadable PDF reports of vehicle analyses.

---

## Architecture

MotCheck-UK employs a microservices pattern. The frontend is a **React (v19)** application built with **Vite**, communicating with several independent **Python/FastAPI** backend services.

### Frontend (`/frontend/`)

* **Framework/Build:** React 19 with Vite
* **UI Library:** Material-UI (`@mui/material`)
* **Routing:** React Router DOM
* **Payment:** Stripe Integration
* **Charting:** Recharts
* **PDF Generation:** pdfmake

**Key Frontend Directories:**

* `/frontend/src/components/AutoData/`: Components for vehicle data and analysis.
* `/frontend/src/components/Results/`: Components for MOT history and search results.
* `/frontend/src/pages/`: Main application pages.
* `/frontend/src/middleware/`: Custom middleware for data processing.
* `/frontend/src/styles/`: Material-UI theming system.

### Backend Services (`/backend/`)

Each backend service is a specialized FastAPI application.

1.  **DVLA API** (`/backend/dvla_api/`)
    * **Port:** `8004`
    * **Function:** Integrates with DVLA Vehicle Enquiry Service for vehicle registration data.
2.  **MOT API** (`/backend/mot_api/`)
    * **Port:** Varies (check service configuration)
    * **Function:** Fetches MOT history and advisory information from government APIs.
3.  **Auto Data API** (`/backend/auto_data_api/`)
    * **Port:** `8005`
    * **Function:** Provides repair times, technical specifications, and maintenance data. Static data located in `/backend/auto_data_api/data/`.
4.  **Claude API** (`/backend/claude_api/`)
    * **Function:** AI-powered vehicle analysis, risk assessment, and insights generation.
5.  **Manual API** (`/backend/manual_api/`)
    * **Function:** Provides access to MOT manual data, test procedures, and requirements.
6.  **Stripe API** (`/backend/stripe_api/`)
    * **Function:** Handles payment processing for premium features.
7.  **TSB API** (`/backend/tsb_api/`)
    * **Function:** Delivers Technical Service Bulletins, including manufacturer recalls and fix information.

### Data Processing & Integration

* **Vehicle Analysis Pipeline:**
    1.  Registration lookup (DVLA API).
    2.  MOT history retrieval and analysis (MOT API).
    3.  Cross-reference with technical specifications (Auto Data API).
    4.  AI-powered risk assessment (Claude API).
    5.  Integration with TSB/recall data (TSB API).
* **Key Data Sources:**
    * `/backend/auto_data_api/data/`: Static vehicle data (repair times, tech specs).
    * `/utils/fix_details*/`: Detailed fix information for specific vehicles.
* **Data Storage:** Primarily JSON-based for static information.
* **Caching:** TTL caches implemented for expensive API calls to improve performance and reduce external service load.

### Service Communication

* **CORS:** Configured for cross-origin requests between the frontend and backend APIs.
* **Middleware:** Includes compression, structured logging, and error handling. Pydantic models are used for request/response validation in backend services.
* **Rate Limiting:** Implemented within individual backend services.

---

### Prerequisites

* Node.js and npm (for Frontend)
* Python 3.x and pip (for Backend services)
* Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your_username/MotCheck-UK.git](https://github.com/your_username/MotCheck-UK.git)
    cd MotCheck-UK
    ```

2.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

3.  **Backend Setup:**
    Each backend service in the `/backend/` directory has its own dependencies. You'll need to install them for each service. For example, for `dvla_api`:
    ```bash
    cd backend/dvla_api
    # Assuming a requirements.txt file exists or you install dependencies manually
    pip install -r requirements.txt # Or your specific dependency management command
    cd ../..
    ```
    Repeat this process for each service directory under `/backend/`.

### Environment Configuration

Services rely on environment variables for configuration (API keys, service ports, external API endpoints, feature flags).

* Create a `.env` file in the root directory or in individual service directories as needed.
* Populate it with necessary values based on an `.env.example` file (if provided) or the following common variables:
    * `DVLA_API_KEY`
    * `MOT_CLIENT_ID`
    * `MOT_CLIENT_SECRET`
    * `STRIPE_SECRET_KEY`
    * `CLAUDE_API_KEY`
    * Service-specific `HOST` and `PORT` variables.
    * `USE_TEST_ENV` (feature flag)

---

##  Development & Usage

### Running the Frontend (React + Vite)

Navigate to the frontend directory:
```bash
cd frontend
