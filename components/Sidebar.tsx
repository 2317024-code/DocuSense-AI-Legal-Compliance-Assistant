
import React, { useState } from 'react';
import { Document, AuditLog } from '../types';

interface SidebarProps {
  documents: Document[];
  onFileSelect: (file: File) => void;
  onRemoveDoc: (id: string) => void;
  auditLogs: AuditLog[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  documents, 
  onFileSelect, 
  onRemoveDoc,
  auditLogs 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div 
      className={`w-80 h-screen bg-slate-900 text-white flex flex-col border-r transition-colors duration-200 ${
        isDragging ? 'border-indigo-500 bg-slate-800' : 'border-slate-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <i className="fas fa-scale-balanced text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight">DocuSense AI</h1>
        </div>
        <p className="text-xs text-slate-400">Legal & Compliance Intelligence</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Document Section */}
        <section className="relative">
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documents</h2>
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 p-1.5 rounded transition-colors group relative">
              <i className="fas fa-plus text-xs"></i>
              <input 
                type="file" 
                className="hidden" 
                accept=".txt,.md,.json" 
                onChange={handleFileInputChange} 
              />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
                Click or Drop
              </span>
            </label>
          </div>

          {/* Search Bar */}
          <div className="px-2 mb-4">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input 
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          
          <div className={`space-y-2 min-h-[100px] rounded-lg border-2 border-dashed transition-all p-2 ${
            isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent'
          }`}>
            {isDragging && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-indigo-600/20 backdrop-blur-[2px] rounded-lg">
                <div className="text-center">
                  <i className="fas fa-file-arrow-up text-2xl mb-2 animate-bounce"></i>
                  <p className="text-sm font-bold">Drop to Upload</p>
                </div>
              </div>
            )}
            
            {documents.length === 0 && !isDragging ? (
              <div className="text-sm text-slate-500 italic px-2 py-4 text-center border border-slate-800 rounded-lg">
                Drag documents here or click +
              </div>
            ) : filteredDocuments.length === 0 && !isDragging ? (
              <div className="text-xs text-slate-500 italic px-2">No matches found</div>
            ) : (
              filteredDocuments.map(doc => (
                <div key={doc.id} className="group flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:border-indigo-500 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <i className="far fa-file-lines text-indigo-400"></i>
                    <span className="text-sm truncate font-medium">{doc.name}</span>
                  </div>
                  <button 
                    onClick={() => onRemoveDoc(doc.id)}
                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i className="fas fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Audit Logs */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-2">Compliance Audit Log</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {auditLogs.length === 0 ? (
              <div className="text-sm text-slate-500 italic px-2">Waiting for interaction...</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="text-xs p-2 rounded bg-slate-800/30 border border-slate-700/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">{log.timestamp.toLocaleTimeString()}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="truncate text-slate-300">Q: {log.query}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Connected to Gemini 3 Pro
        </div>
      </div>
    </div>
  );
};
