import boto3

# Initialize a session using Boto3
session = boto3.Session()

# Create an EC2 resource
ec2 = session.resource('ec2')

# Create a dictionary to hold the instance counts per region
instance_count_by_region = {}

# Loop through all regions
for region in ec2.meta.client.describe_regions()['Regions']:
    region_name = region['RegionName']
    region_ec2 = session.resource('ec2', region_name=region_name)
    instance_count = sum(1 for _ in region_ec2.instances.all())
    instance_count_by_region[region_name] = instance_count

# Return the count of EC2 instances by region
instance_count_by_region