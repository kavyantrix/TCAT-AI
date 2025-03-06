from agno import agent
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resources, costs, advisor, chatbot, tags, auth, diagrams

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
app.include_router(advisor.router, prefix="/api/advisor", tags=["advisor"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(diagrams.router, prefix="/api/diagrams", tags=["diagrams"])

@app.get("/")
async def root():
    return {"message": "AWS Cost Optimizer API"}