from fastapi import APIRouter, HTTPException
from services.aws_service import AWSService
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
from agno.tools.python import PythonTools
import os
router = APIRouter()
aws_service = AWSService()
load_dotenv()


@router.get("/chat")
async def get_ec2_resources():
    try:
        print(os.getenv("OPENAI_API_KEY"))
        agent = Agent(
            model=OpenAIChat(id="gpt-4o-mini", api_key=os.getenv("OPENAI_API_KEY"),),
            description="You are an agent that can answer questions about AWS resources. If user asks specific questions about their resource that you dont have any idea about then generate boto3 code execute it get the result, summarize it and return it to the user otherwise if you can answer the question without generating boto3 code then answer it. In the response dont return the fact that you run some code just tell them the answer. Remove this from content response 'Running: save_to_file_and_run(file_name=count_ec2_instances.py, code=..., variable_to_return=instance_count)\n\n'", 
            markdown=True,
            tools=[PythonTools()], show_tool_calls=False
            )
        response =  agent.run("What are the instance sizes of ec2 instances in us-east-1 region for my AWS account?")
        print(response)
        return {"response":response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))