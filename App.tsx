
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Message, Document, AuditLog } from './types';
import { analyzeDocument } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        content,
        type: file.type || 'text/plain'
      };
      setDocuments(prev => [...prev, newDoc]);
      
      // Log upload action
      const log: AuditLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        query: `System: Uploaded ${file.name}`,
        status: 'Success'
      };
      setAuditLogs(prev => [log, ...prev]);
    };
    reader.readAsText(file);
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const context = documents.length > 0 
      ? documents.map(d => `--- DOCUMENT: ${d.name} ---\n${d.content}`).join('\n\n')
      : "No document provided. Please ask the user to upload one first.";

    try {
      const responseText = await analyzeDocument(
        input, 
        context, 
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add to audit logs
      const log: AuditLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        query: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
        status: 'Success'
      };
      setAuditLogs(prev => [log, ...prev]);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error while analyzing your request. Please ensure your API key is correct and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      setAuditLogs(prev => [{
        id: Date.now().toString(),
        timestamp: new Date(),
        query: input,
        status: 'Error'
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        documents={documents} 
        onFileSelect={handleFileSelect} 
        onRemoveDoc={removeDoc}
        auditLogs={auditLogs}
      />
      
      <main className="flex-1 flex flex-col bg-white relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Legal Analysis Workspace</h2>
            <p className="text-xs text-slate-500">
              {documents.length > 0 
                ? `${documents.length} document(s) loaded for context` 
                : "Upload a document to begin RAG analysis"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
              Vibe Coding Edition v1.0
            </span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mb-4">
                <i className="fas fa-gavel"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Welcome to DocuSense AI</h3>
              <p className="text-slate-600 leading-relaxed">
                Upload your legal documents (NDAs, Service Agreements, Privacy Policies) and I'll help you find hidden clauses, summarize key terms, or check for compliance risks.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full text-left">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => setInput("What are the termination conditions in this contract?")}>
                  <i className="fas fa-stopwatch text-indigo-500 mb-2"></i>
                  <h4 className="font-semibold text-sm">Find Deadlines</h4>
                  <p className="text-xs text-slate-500">Extract all dates and deadlines.</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => setInput("Explain the liability clause in plain English.")}>
                  <i className="fas fa-shield-halved text-emerald-500 mb-2"></i>
                  <h4 className="font-semibold text-sm">Plain English</h4>
                  <p className="text-xs text-slate-500">Simplify complex legalese.</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-3xl flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-robot'} text-xs`}></i>
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none prose prose-slate max-w-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <div className={`mt-2 text-[10px] ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <i className="fas fa-robot text-xs text-slate-400"></i>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={documents.length > 0 ? "Ask a question about the documents..." : "Upload a document in the sidebar to begin..."}
              disabled={isLoading}
              className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-3 top-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-paper-plane text-sm"></i>
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-widest font-semibold">
            Powered by Gemini 3 Pro • For Educational Purposes Only
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
