# TCAT-AI

An intelligent cloud cost management tool that leverages AI to analyze AWS infrastructure, optimize costs, and provide actionable recommendations.

## Features

- 📊 Real-time AWS cost analysis and visualization
- 🤖 AI-powered architecture analysis using Gemini and OpenAI
- 📋 Automated Trusted Advisor checks and recommendations
- 📑 Automated report generation (PDF/DOCX)
- 🔍 Image-based architecture analysis
- 💰 Cost optimization suggestions
- 📈 Resource utilization tracking

## Tech Stack

- Backend: FastAPI, PostgreSQL
- Frontend: React, Material-UI
- AI/ML: OpenAI GPT-4, Google Gemini
- AWS SDK: Boto3

## Getting Started

1. Clone the repository
2. Configure environment variables
3. Install dependencies
4. Run the application

## Note

Remember to secure your AWS credentials and API keys before deploying.

## License

MIT License

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- AWS Account with access credentials
- OpenAI API key

## Project Structure

aws-cost-optimizer/
├── backend/         # FastAPI backend
├── frontend/        # Next.js frontend


## Setup Instructions

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate

2. Install dependencies:
pip install -r requirements.txt

cp .env.example .env

uvicorn main:app --reload --host 0.0.0.0 --port 8000

## Database Setup
brew install postgresql@14
brew services start postgresql@14
psql postgresql://username:password@localhost:5432/aws_cost_optimizer
# Connect to PostgreSQL as the default postgres user
psql postgres

# Inside the PostgreSQL shell, create a new user
CREATE USER username WITH PASSWORD 'password';

# Create the database
CREATE DATABASE aws_cost_optimizer;

# Grant privileges to the user on the database
GRANT ALL PRIVILEGES ON DATABASE aws_cost_optimizer TO username;

# Exit the PostgreSQL shell
\q

### Frontend Setup
1. Navigate to frontend directory:
cd frontend
npm install

npm run dev
