import boto3

# Create a VPC client
client = boto3.client('ec2')

# Retrieve a list of all VPCs
vpcs = client.describe_vpcs()['Vpcs']

# Initialize a dictionary to hold resource counts per VPC
vpc_resource_count = {}

# Iterate over each VPC and get resource counts per VPC
for vpc in vpcs:
    vpc_id = vpc['VpcId']
    resources = client.describe_network_interfaces(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['NetworkInterfaces']
    resource_count = len(resources)
    vpc_resource_count[vpc_id] = resource_count

# Find the VPC with the most resources
max_vpc = max(vpc_resource_count, key=vpc_resource_count.get)
max_resource_count = vpc_resource_count[max_vpc]

max_vpc, max_resource_count