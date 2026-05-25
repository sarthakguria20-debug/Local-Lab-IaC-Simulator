export interface IacConfig {
  version?: string;
  services: Record<string, IacService>;
  networks?: Record<string, IacNetwork>;
}

export interface IacService {
  image?: string;
  ports?: string[];
  networks?: string[] | Record<string, { ipv4_address?: string }>;
  dependsOn?: string[];
  environment?: Record<string, string>;
  type?: 'vm' | 'container';
}

export interface IacNetwork {
  driver?: string;
  ipam?: {
    config?: {
      subnet?: string;
    }[];
  };
}

export interface ParsedNode {
  id: string;
  name: string;
  type: 'container' | 'vm';
  image: string;
  ips: Record<string, string>; // networkName -> IP
  ports: { host: number | string; container: number | string }[];
  dependsOn: string[];
}

export interface ParsedNetwork {
  id: string;
  name: string;
  subnet: string;
}

export interface ParsedTopology {
  nodes: ParsedNode[];
  networks: ParsedNetwork[];
  errors: string[];
}
