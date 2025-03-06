import boto3

# Create a session using the default profile
session = boto3.Session()

ec2_client = session.client('ec2', region_name='us-east-1')

# Retrieve the list of EC2 instances
response = ec2_client.describe_instances()

total_instances = 0

# Count the EC2 instances
for reservation in response['Reservations']:
    total_instances += len(reservation['Instances'])

# Return the total count of EC2 instances
print(total_instances)