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
                Granularity='MONTHLY',  # Changed from DAILY to MONTHLY
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

    def get_trusted_advisor_details(self) -> Dict:
        support = self.session.client('support')
        try:
            # Get all check categories
            categories = ['cost_optimizing', 'security', 'fault_tolerance', 'performance', 'service_limits']
            all_checks = {}
            
            for category in categories:
                checks_response = support.describe_trusted_advisor_checks(
                    language='en',
                    checkNames=[category]
                )
                category_checks = []
                
                for check in checks_response['checks']:
                    result = support.describe_trusted_advisor_check_result(
                        checkId=check['id'],
                        language='en'
                    )
                    
                    check_details = {
                        'id': check['id'],
                        'name': check['name'],
                        'description': check['description'],
                        'category': category,
                        'status': result['result']['status'],
                        'resourcesSummary': result['result'].get('resourcesSummary', {}),
                        'flaggedResources': result['result'].get('flaggedResources', []),
                        'timestamp': result['result'].get('timestamp'),
                    }
                    
                    if category == 'cost_optimizing':
                        check_details['estimatedMonthlySavings'] = result['result'].get('costOptimizing', {}).get('estimatedMonthlySavings', 0)
                
                    category_checks.append(check_details)
                
                all_checks[category] = category_checks
                
            return all_checks
        except ClientError as e:
            raise Exception(f"Error fetching Trusted Advisor details: {str(e)}")

    def get_resources_by_tag(self) -> Dict:
        client = self.session.client('resourcegroupstaggingapi')
        try:
            paginator = client.get_paginator('get_resources')
            resources_by_type = {}
            
            # Iterate through all pages of resources
            for page in paginator.paginate(
                ResourcesPerPage=100,
                IncludeComplianceDetails=False,
                ExcludeCompliantResources=False
            ):
                for resource in page.get('ResourceTagMappingList', []):
                    arn = resource['ResourceARN']
                    tags = resource.get('Tags', [])
                    resource_type = arn.split(':')[2]
                    
                    if resource_type not in resources_by_type:
                        resources_by_type[resource_type] = []
                        
                    resources_by_type[resource_type].append({
                        'arn': arn,
                        'tags': tags,
                        'name': arn.split('/')[-1] if '/' in arn else arn.split(':')[-1]
                    })
            
            # Get additional resources without tags
            ec2 = self.session.client('ec2')
            rds = self.session.client('rds')
            s3 = self.session.client('s3')
            
            # Add EC2 instances
            try:
                ec2_response = ec2.describe_instances()
                if 'ec2' not in resources_by_type:
                    resources_by_type['ec2'] = []
                for reservation in ec2_response['Reservations']:
                    for instance in reservation['Instances']:
                        if not any(r['arn'].endswith(instance['InstanceId']) for r in resources_by_type.get('ec2', [])):
                            resources_by_type['ec2'].append({
                                'arn': f"arn:aws:ec2:{self.session.region_name}:{instance['OwnerId']}:instance/{instance['InstanceId']}",
                                'tags': instance.get('Tags', []),
                                'name': instance['InstanceId']
                            })
            except ClientError:
                pass
        
            # Add S3 buckets
            try:
                s3_response = s3.list_buckets()
                if 's3' not in resources_by_type:
                    resources_by_type['s3'] = []
                for bucket in s3_response['Buckets']:
                    if not any(r['arn'].endswith(bucket['Name']) for r in resources_by_type.get('s3', [])):
                        try:
                            tags = s3.get_bucket_tagging(Bucket=bucket['Name']).get('TagSet', [])
                        except ClientError:
                            tags = []
                        resources_by_type['s3'].append({
                            'arn': f"arn:aws:s3:::{bucket['Name']}",
                            'tags': tags,
                            'name': bucket['Name']
                        })
            except ClientError:
                pass
        
            # Add RDS instances
            try:
                rds_response = rds.describe_db_instances()
                if 'rds' not in resources_by_type:
                    resources_by_type['rds'] = []
                for instance in rds_response['DBInstances']:
                    if not any(r['arn'].endswith(instance['DBInstanceIdentifier']) for r in resources_by_type.get('rds', [])):
                        resources_by_type['rds'].append({
                            'arn': instance['DBInstanceArn'],
                            'tags': instance.get('TagList', []),
                            'name': instance['DBInstanceIdentifier']
                        })
            except ClientError:
                pass
        
            return resources_by_type
        except ClientError as e:
            raise Exception(f"Error fetching tagged resources: {str(e)}")