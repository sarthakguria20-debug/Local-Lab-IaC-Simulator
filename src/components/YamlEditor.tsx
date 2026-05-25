import React from 'react';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function YamlEditor({ value, onChange }: YamlEditorProps) {
  return (
    <textarea
      className="w-full h-full p-6 bg-transparent text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  );
}
