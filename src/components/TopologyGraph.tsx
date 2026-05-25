import React from 'react';
import { ParsedTopology, ParsedNode, ParsedNetwork } from '../types';
import { Server, Box, Network, Activity } from 'lucide-react';

interface TopologyGraphProps {
  topology: ParsedTopology | null;
}

export function TopologyGraph({ topology }: TopologyGraphProps) {
  if (!topology) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Waiting for valid YAML configuration...
      </div>
    );
  }

  if (topology.errors && topology.errors.length > 0) {
    return (
      <div className="m-6 p-4 border border-red-900/50 text-red-400 bg-[#16191F] rounded shadow-lg overflow-y-auto">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Activity size={16} />
          Parsing Errors
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          {topology.errors.map((err, i) => (
            <li key={i} className="text-xs font-mono">{err}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8 bg-[#0A0B0E]">
      <div className="flex justify-between items-center bg-[#16191F] p-4 rounded border border-slate-800">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Network size={16} className="text-indigo-400" />
          Live Topology
        </h2>
        <span className="text-xs text-slate-500 font-mono tracking-widest">{topology.nodes.length} NODES / {topology.networks.length} NETS</span>
      </div>

      {/* Networks */}
      <section>
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Configured Networks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topology.networks.map(net => (
            <div key={net.id} className="bg-[#111418] border border-slate-800 rounded p-4 flex flex-col shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-900"></div>
                 <span className="text-sm font-medium text-white">{net.name}</span>
              </div>
              <div className="text-slate-500 font-mono text-[10px] uppercase">
                Subnet: <span className="text-indigo-400 normal-case ml-1">{net.subnet}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nodes */}
      <section className="flex-1 pb-6">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Isolated Environments (Compute)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topology.nodes.map(node => (
            <div key={node.id} className="bg-[#111418] border border-slate-800 rounded p-4 hover:bg-[#16191F] transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 border rounded flex items-center justify-center shadow-md ${node.type === 'vm' ? 'bg-[#1E293B] border-indigo-500/50 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {node.type === 'vm' ? <Server size={20} /> : <Box size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{node.name}</h3>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{node.image}</div>
                  </div>
                </div>
                <div className="px-2 py-0.5 border border-slate-700 bg-slate-800/50 text-slate-400 text-[9px] rounded uppercase font-bold tracking-widest">
                  {node.type}
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-800/50 mt-2">
                {/* IPs */}
                <div>
                  <div className="text-slate-500 text-[9px] uppercase font-bold mb-2 tracking-widest">Interfaces</div>
                  <div className="space-y-1.5">
                    {Object.entries(node.ips).map(([netName, ip]) => (
                      <div key={netName} className="flex items-center justify-between bg-[#0A0B0E] px-2 py-1.5 rounded border border-slate-800/50 text-[10px] font-mono">
                        <span className="text-indigo-400">{netName}</span>
                        <span className="text-slate-300">{ip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ports */}
                {node.ports.length > 0 && (
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase font-bold mb-2 tracking-widest">Ports</div>
                    <div className="flex flex-wrap gap-2">
                      {node.ports.map((port, i) => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                          {port.host} &rarr; {port.container}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {node.dependsOn.length > 0 && (
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase font-bold mb-2 tracking-widest">Depends On</div>
                    <div className="flex gap-2">
                      {node.dependsOn.map(dep => (
                        <div key={dep} className="px-2 py-0.5 bg-slate-800/30 text-slate-400 border border-slate-700/50 rounded text-[10px]">
                          {dep}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
