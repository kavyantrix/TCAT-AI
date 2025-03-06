# AI-Powered AWS Cost Optimizer

A full-stack application to analyze and optimize AWS costs using FastAPI, Next.js, and OpenAI.

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

### Frontend Setup
1. Navigate to frontend directory:
cd frontend
npm install

npm run dev