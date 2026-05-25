import React, { useState, useEffect, useMemo } from 'react';
import { YamlEditor } from './components/YamlEditor';
import { TopologyGraph } from './components/TopologyGraph';
import { DEFAULT_YAML } from './constants';
import { parseYamlToTopology } from './utils/parser';
import { Play, Code, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [yamlConfig, setYamlConfig] = useState(DEFAULT_YAML);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'topology'>('topology');

  const topology = useMemo(() => {
    return parseYamlToTopology(yamlConfig);
  }, [yamlConfig]);

  const handleDeploy = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      alert('Deployment simulated to local Hypervisor/Docker daemon! (This is a web simulation)');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0B0E] font-sans text-slate-300">
      {/* Header */}
      <nav className="flex-none bg-[#16191F] border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight">NEXUS <span className="text-indigo-400">IaC</span></span>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold md:block hidden leading-none mt-0.5">Local Lab Orchestrator</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-[#0A0B0E] rounded border border-slate-800 p-0.5 flex md:hidden items-center">
             <button 
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded flex items-center space-x-2 text-xs font-medium transition-colors ${activeTab === 'editor' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'}`}
              >
                <Code size={14} />
                <span>YAML</span>
              </button>
              <button 
                onClick={() => setActiveTab('topology')}
                className={`px-3 py-1.5 rounded flex items-center space-x-2 text-xs font-medium transition-colors ${activeTab === 'topology' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'}`}
              >
                <LayoutDashboard size={14} />
                <span>Topology</span>
              </button>
          </div>

          <button
            onClick={handleDeploy}
            disabled={isSimulating || (topology?.errors?.length ?? 0) > 0}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none text-white text-xs font-bold rounded flex items-center space-x-2 shadow-lg shadow-indigo-900/20 transition-colors"
          >
            {isSimulating ? (
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>PROVISIONING...</span>
              </span>
            ) : (
              <>
                <Play size={12} fill="currentColor" />
                <span>PROVISION LAB</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor (Hidden on Mobile if Tab is not Editor) */}
        <section className={`w-full md:w-1/2 lg:w-[500px] flex-none border-r border-slate-800 flex flex-col bg-[#0A0B0E] ${activeTab === 'topology' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-[#16191F] px-4 py-2 flex items-center border-b border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 tracking-wider">Infrastructure Definition (YAML)</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <YamlEditor value={yamlConfig} onChange={setYamlConfig} />
          </div>
        </section>

        {/* Topology View */}
        <section className={`flex-1 flex flex-col bg-[#0A0B0E] overflow-hidden ${activeTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
          <TopologyGraph topology={topology} />
        </section>
      </main>
      
      {/* Bottom Status Bar */}
      <footer className="h-7 bg-[#16191F] border-t border-slate-800 flex items-center px-4 justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            <span className="text-indigo-500">●</span>
            <span>ENGINE: RUNNING (Local)</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1">
            <span>NODES:</span>
            <span className="text-slate-300">{topology?.nodes?.length || 0} ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span>{topology?.networks?.length || 0} NETWORKS ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
