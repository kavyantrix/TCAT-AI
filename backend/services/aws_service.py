import boto3
from botocore.exceptions import ClientError
from typing import Dict, List
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

class AWSService:
    def __init__(self):
        load_dotenv()
        self.session = boto3.Session(
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )

    def get_cost_and_usage(self, start_date: str, end_date: str) -> Dict:
        client = self.session.client('ce')
        try:
            response = client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date,
                    'End': end_date
                },
                Granularity='DAILY',
                Metrics=['UnblendedCost'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'}
                ]
            )
            return response
        except ClientError as e:
            raise Exception(f"Error fetching AWS costs: {str(e)}")

    def get_ec2_instances(self) -> List[Dict]:
        ec2 = self.session.client('ec2')
        try:
            response = ec2.describe_instances()
            instances = []
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    instances.append({
                        'id': instance['InstanceId'],
                        'type': instance['InstanceType'],
                        'state': instance['State']['Name'],
                        'launch_time': instance['LaunchTime'].isoformat()
                    })
            return instances
        except ClientError as e:
            raise Exception(f"Error fetching EC2 instances: {str(e)}")

    def get_trusted_advisor_recommendations(self) -> List[Dict]:
        support = self.session.client('support')
        try:
            response = support.describe_trusted_advisor_checks('cost_optimizing')
            checks = []
            for check in response['checks']:
                result = support.describe_trusted_advisor_check_result(
                    checkId=check['id'],
                    language='en'
                )
                checks.append({
                    'id': check['id'],
                    'name': check['name'],
                    'status': result['result']['status'],
                    'resourcesFlagged': result['result'].get('resourcesSummary', {}).get('resourcesFlagged', 0),
                    'estimatedMonthlySavings': result['result'].get('costOptimizing', {}).get('estimatedMonthlySavings', 0)
                })
            return checks
        except ClientError as e:
            raise Exception(f"Error fetching Trusted Advisor recommendations: {str(e)}")