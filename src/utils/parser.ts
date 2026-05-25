import yaml from 'js-yaml';
import { IacConfig, ParsedTopology, ParsedNode, ParsedNetwork } from '../types';

function int2ip(ipInt: number) {
  return (
    ((ipInt >>> 24) & 255) +
    '.' +
    ((ipInt >>> 16) & 255) +
    '.' +
    ((ipInt >>> 8) & 255) +
    '.' +
    (ipInt & 255)
  );
}

function ip2int(ip: string) {
  return (
    ip.split('.').reduce((ipInt, octet) => {
      return (ipInt << 8) + parseInt(octet, 10);
    }, 0) >>> 0
  );
}

export function parseYamlToTopology(yamlString: string): ParsedTopology {
  const result: ParsedTopology = { nodes: [], networks: [], errors: [] };
  let doc: IacConfig;

  try {
    doc = yaml.load(yamlString) as IacConfig;
  } catch (e: any) {
    result.errors.push(`YAML Parsing Error: ${e.message}`);
    return result;
  }

  if (!doc) {
      result.errors.push('Empty or invalid YAML configuration.');
      return result;
  }

  if (!doc.services) {
    result.errors.push('No services found in YAML configuration.');
    return result;
  }

  // Parse Networks
  const networksMap = new Map<string, ParsedNetwork>();
  let defaultSubnetIndex = 0;

  const defaultSubnets = ['172.16.0.0/16', '172.17.0.0/16', '172.18.0.0/16', '10.0.0.0/24'];

  const getNextDefaultSubnet = () => {
    const subnet = defaultSubnets[defaultSubnetIndex] || `192.168.${defaultSubnetIndex}.0/24`;
    defaultSubnetIndex++;
    return subnet;
  };

  if (doc.networks) {
    Object.entries(doc.networks).forEach(([netName, netConfig]) => {
      let subnet = netConfig?.ipam?.config?.[0]?.subnet;
      if (!subnet) {
        subnet = getNextDefaultSubnet();
      }
      networksMap.set(netName, {
        id: `net-${netName}`,
        name: netName,
        subnet,
      });
    });
  }

  // Create default network if nothing is defined and no specific attached networks exist on any service
  const defaultNetworkName = 'default';
  
  // IP Assignment tracking per network
  const networkIpTracker = new Map<string, number>();

  const initNetworkTracker = (net: ParsedNetwork) => {
    const [baseIp] = net.subnet.split('/');
    // Start assigning from baseIp + 2
    networkIpTracker.set(net.name, ip2int(baseIp) + 2);
  };

  // Ensure default is created early if there's no explicitly defined net
  if (!networksMap.has(defaultNetworkName)) {
    networksMap.set(defaultNetworkName, {
      id: `net-default`,
      name: defaultNetworkName,
      subnet: getNextDefaultSubnet(),
    });
  }

  networksMap.forEach(initNetworkTracker);

  const getNextIp = (netName: string) => {
    const tracker = networkIpTracker.get(netName);
    if (!tracker) return '0.0.0.0';
    networkIpTracker.set(netName, tracker + 1);
    return int2ip(tracker);
  };

  // Next Host Port Tracker
  let nextHostPort = 8000;
  const getNextHostPort = () => {
    return nextHostPort++;
  };

  // Parse Services into Nodes
  Object.entries(doc.services).forEach(([serviceName, serviceConfig]) => {
    const node: ParsedNode = {
      id: `node-${serviceName}`,
      name: serviceName,
      type: serviceConfig.type === 'vm' ? 'vm' : 'container',
      image: serviceConfig.image || 'ubuntu:latest',
      ips: {},
      ports: [],
      dependsOn: Array.isArray(serviceConfig.dependsOn) ? serviceConfig.dependsOn : (typeof serviceConfig.dependsOn === 'string' ? [serviceConfig.dependsOn] : []),
    };

    // Parse Ports
    if (serviceConfig.ports) {
      serviceConfig.ports.forEach((portStr) => {
        // e.g. "8080:80", "80"
        if(typeof portStr === 'number') {
            node.ports.push({ host: getNextHostPort(), container: portStr });
        } else {
            const parts = portStr.split(':');
            if (parts.length === 2) {
            node.ports.push({ host: parts[0], container: parts[1] });
            } else if (parts.length === 1) {
            node.ports.push({ host: getNextHostPort(), container: parts[0] });
            }
        }
      });
    }

    // Parse Networks and Assign IPs
    let attachedNetworks: string[] = [];
    if (Array.isArray(serviceConfig.networks)) {
      attachedNetworks = serviceConfig.networks;
    } else if (typeof serviceConfig.networks === 'object' && serviceConfig.networks !== null) {
      attachedNetworks = Object.keys(serviceConfig.networks);
    } else {
      attachedNetworks = [defaultNetworkName]; // Attach to default
    }

    attachedNetworks.forEach((netName) => {
      // Ensure network exists implicitly if not defined in root
      if (!networksMap.has(netName)) {
        const newNet = {
          id: `net-${netName}`,
          name: netName,
          subnet: getNextDefaultSubnet(),
        };
        networksMap.set(netName, newNet);
        initNetworkTracker(newNet);
      }

      // Check if static IP is requested
      let requestedIp = undefined;
      if (typeof serviceConfig.networks === 'object' && serviceConfig.networks !== null && !Array.isArray(serviceConfig.networks)) {
        const netDef = (serviceConfig.networks as any)[netName];
        if (netDef && netDef.ipv4_address) {
          requestedIp = netDef.ipv4_address;
        }
      }

      const assignedIp = requestedIp || getNextIp(netName);
      node.ips[netName] = assignedIp;
    });

    result.nodes.push(node);
  });

  result.networks = Array.from(networksMap.values());

  return result;
}
