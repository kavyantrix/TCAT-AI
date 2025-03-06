from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resources, costs, trusted_advisor, chatbot

app = FastAPI(title="AWS Cost Optimizer")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(costs.router, prefix="/api/costs", tags=["costs"])
app.include_router(trusted_advisor.router, prefix="/api/advisor", tags=["advisor"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])

@app.get("/")
async def root():
    return {"message": "AWS Cost Optimizer API"}