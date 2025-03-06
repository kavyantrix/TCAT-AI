from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from services.aws_service import AWSService
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv
from agno.tools.python import PythonTools
import os
from database import get_db, AWSResource, AWSAdvisor
from collections import Counter
from datetime import datetime, timedelta
import json
from pydantic import BaseModel

# Define request model
class QueryRequest(BaseModel):
    query: str

router = APIRouter()
aws_service = AWSService()
load_dotenv()

def get_cost_data(start_date=None, end_date=None):
    """
    Get AWS cost data for the specified date range.
    Use this function to get information about cost and total cost for same services
    Figure out the start and end date based on user question and provide to the function.
    If dates are not provided, default to the last 30 days from today's date which is 06 march 2025.
    
    Args:
        start_date (str, optional): Start date in YYYY-MM-DD format
        end_date (str, optional): End date in YYYY-MM-DD format
        
    Returns:
        str: JSON string containing AWS cost data for the specified period
    """
    try:
        # Set default dates if not provided
  
 
        # Fetch cost data from AWS
        print(start_date)
        print(end_date)
        cost_data = aws_service.get_cost_and_usage(start_date, end_date)
        
        # Convert to JSON string
        return json.dumps(cost_data)
    except Exception as e:
        error_msg = str(e)
        print(f"Error fetching cost data: {error_msg}")
        
        # Handle specific AWS error for historical data limitation
        if "historical data beyond 14 months" in error_msg:
            # Return a more user-friendly error message
            return json.dumps({
                "error": "AWS Cost Explorer can only access data from the last 14 months",
                "suggestion": "Please try with a more recent date range"
            })
        
        return json.dumps({"error": error_msg})

# Add new POST endpoint
@router.post("/chat")
async def post_agent_chat(request: QueryRequest, db: Session = Depends(get_db)):
    return await process_agent_chat(request.query, db)

# Common processing function for both GET and POST
async def process_agent_chat(query: str, db: Session):
    try:
        # Get resources from database and count by type
        db_resources = db.query(AWSResource).all()
        resource_counts = Counter()
        
        for resource in db_resources:
            resource_type = resource.resource_type
            resource_counts[resource_type] += 1
        
        # Create simple context string with just resource types and counts
        context = "AWS Resource Summary:\n"
        context += "\n".join([f"- {res_type}: {count} resources" for res_type, count in resource_counts.items()])
        
        # Get advisor recommendations from database
        advisor_data = db.query(AWSAdvisor).all()
        
        # Add advisor context if available
        if advisor_data:
            context += "\n\nAWS Cost Optimization Recommendations:\n"
            for recommendation in advisor_data:
                check_type = recommendation.check_type
                data = recommendation.data
                
                # Format the recommendation data - improved handling
                try:
                    if isinstance(data, dict):
                        # Try to parse if it's a JSON string                        
                        # Check if we have cost_optimizing key directly in the data
                        if isinstance(data, dict) and 'cost_optimizing' in data:
                            cost_items = data['cost_optimizing']
                            print(type(cost_items))
                            if isinstance(cost_items, list):
                                context += f"- Cost Optimization Recommendations:\n"
                                
                                for item in cost_items:
                                    print(type(item))
                                    if not isinstance(item, dict):
                                        continue
                                        
                                    # Skip if status is not warning or error
                                    item_status = item.get('status', '').lower()
                                    if item_status not in ['warning', 'error']:
                                        continue
                                    
                                    # Extract the most useful information
                                    name = item.get('name', '')
                                    description = item.get('description', '')
                                    category = item.get('category', '')
                                    savings = item.get('estimatedMonthlySavings', 0)
                                    
                                    # Get flagged resources
                                    flagged_resources = item.get('flaggedResources', [])
                                    
                                    # Build a comprehensive entry
                                    if name:
                                        context += f"  • {name}\n"
                                    if description:
                                        # Clean up HTML tags from description
                                        clean_desc = description.replace('<br/>', ' ').replace('<br>', ' ')
                                        clean_desc = ' '.join([line.strip() for line in clean_desc.split('\n')])
                                        
                                        # Remove HTML tags
                                        import re
                                        clean_desc = re.sub(r'<[^>]+>', '', clean_desc)
                                        
                                        # Truncate if too long
                                        if len(clean_desc) > 300:
                                            clean_desc = clean_desc[:297] + "..."
                                            
                                        context += f"    Description: {clean_desc}\n"
                                    if item_status:
                                        context += f"    Status: {item_status}\n"
                                    if savings > 0:
                                        context += f"    Estimated Monthly Savings: ${savings}\n"
                                    
                                    # Add information about flagged resources
                                    if flagged_resources:
                                        context += f"    Affected Resources ({len(flagged_resources)}):\n"
                                        # Limit to 5 resources to avoid context bloat
                                        for i, resource in enumerate(flagged_resources[:5]):
                                            resource_id = resource.get('resourceId', '')
                                            resource_region = resource.get('region', '')
                                            if resource_id:
                                                context += f"      - {resource_id} ({resource_region})\n"
                                        
                                        if len(flagged_resources) > 5:
                                            context += f"      - ... and {len(flagged_resources) - 5} more resources\n"
                            
                        # Process dictionary data that might contain cost optimization info
                        elif isinstance(data, dict):
                            # Skip if not related to cost optimization
                            for key, value in data.items():
                                if 'cost' in key.lower() and isinstance(value, list):
                                    context += f"- {key.replace('_', ' ').title()}:\n"
                                    
                                    for item in value:
                                        if not isinstance(item, dict):
                                            continue
                                            
                                        # Skip if status is not warning or error
                                        item_status = item.get('status', '').lower()
                                        if item_status not in ['warning', 'error']:
                                            continue
                                        
                                        # Extract the most useful information
                                        name = item.get('name', '')
                                        description = item.get('description', '')
                                        savings = item.get('estimatedMonthlySavings', 0)
                                        
                                        # Build a comprehensive entry
                                        if name:
                                            context += f"  • {name}\n"
                                        if description:
                                            # Clean up HTML tags from description
                                            clean_desc = description.replace('<br/>', ' ').replace('<br>', ' ')
                                            clean_desc = ' '.join([line.strip() for line in clean_desc.split('\n')])
                                            
                                            # Remove HTML tags
                                            import re
                                            clean_desc = re.sub(r'<[^>]+>', '', clean_desc)
                                            
                                            # Truncate if too long
                                            if len(clean_desc) > 300:
                                                clean_desc = clean_desc[:297] + "..."
                                                
                                            context += f"    Description: {clean_desc}\n"
                                        if item_status:
                                            context += f"    Status: {item_status}\n"
                                        if savings > 0:
                                            context += f"    Estimated Monthly Savings: ${savings}\n"
                except Exception as e:
                    print(f"Error formatting advisor data: {e}")
                    # Skip items that cause errors
                    continue
        else:
            print("No advisor data found in the database")
            context += "\n\nNo AWS Cost Optimization Recommendations available.\n"
        
        agent = Agent(
            model=OpenAIChat(id="gpt-4o-mini", api_key=os.getenv("OPENAI_API_KEY"),),
            description="You are an agent that can answer questions about AWS resources and costs. Use the provided context about the user's AWS resources whenever possible. If the context lacks information, generate and execute boto3 code, summarize the result, and return the answer—without mentioning that code execution or context retrieval occurred. When interpreting relative dates (e.g., 'last 60 days' or '30 days ago'), always calculate the date range from March 06, 2025, regardless of the current date. If the user specifies a custom range (e.g., 60 days, 90 days), respect their request and calculate the start date accordingly. If no date range is specified, default to the last 30 days from March 06, 2025 (i.e., February 04, 2025 - March 06, 2025). However, do not override user-provided date ranges. Whenever user talks about cost optimization recommendations or strategy get data from  the AWS Advisor Recommendations context. If user asks any question about their infrastructure and there is no answer do not hallucinate create boto3 code and get answers from the aws account", 
            markdown=True,
            tools=[PythonTools(), get_cost_data], 
            show_tool_calls=False
        )
        
        # Provide context and user query to the agent
        full_prompt = f"Context about the user's AWS resources and costs:\n{context}\n\nUser question: {query}"
        print(len(full_prompt))
        print(full_prompt)
        response = agent.run(full_prompt)
        return {"response": response.content}
    except Exception as e:
        print(f"Error in agent chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))