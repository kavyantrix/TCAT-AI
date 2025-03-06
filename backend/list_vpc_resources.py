import boto3

# Create a VPC client
evpc_client = boto3.client('ec2')

vpc_id = 'vpc-0f441362c6bf2e9bb'

# Getting all resources in a VPC
resources = {
    'subnets': [],
    'instances': [],
    'security_groups': [],
    'network_interfaces': [],
    'volumes': [],
    'route_tables': [],
    'internet_gateways': [],
}

# Get subnets in the VPC
subnets = evpc_client.describe_subnets(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['Subnets']
resources['subnets'] = len(subnets)

# Get EC2 instances in the VPC
instances = evpc_client.describe_instances(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['Reservations']
resources['instances'] = sum(len(r['Instances']) for r in instances)

# Get security groups in the VPC
security_groups = evpc_client.describe_security_groups(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['SecurityGroups']
resources['security_groups'] = len(security_groups)

# Get network interfaces in the VPC
network_interfaces = evpc_client.describe_network_interfaces(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['NetworkInterfaces']
resources['network_interfaces'] = len(network_interfaces)

# Get volumes in the VPC
volumes = evpc_client.describe_volumes(Filters=[{'Name': 'status', 'Values': ['available', 'in-use']}, {'Name': 'attachment.instance-id', 'Values': [vpc_id]}])['Volumes']
resources['volumes'] = len(volumes)

# Get route tables in the VPC
route_tables = evpc_client.describe_route_tables(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['RouteTables']
resources['route_tables'] = len(route_tables)

# Get internet gateways in the VPC
internet_gateways = evpc_client.describe_internet_gateways(Filters=[{'Name': 'attachment.vpc-id', 'Values': [vpc_id]}])['InternetGateways']
resources['internet_gateways'] = len(internet_gateways)

resources