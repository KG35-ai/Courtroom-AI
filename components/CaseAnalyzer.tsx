import React, { useState } from 'react';
import { analyzeCase } from '../services/geminiService';
import { CaseAnalysisResult } from '../types';
import { Loader2, CheckCircle, AlertTriangle, Lightbulb, TrendingUp, FileText, Layers, Shield } from 'lucide-react';

const CaseAnalyzer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaseAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'risks'>('overview');

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeCase(inputText);
      setResult(analysis);
    } catch (e) {
      alert("Analysis engine encountered an error. Please refine input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Panel: Input */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col p-6 shadow-sm z-10">
        <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <FileText size={20} className="text-slate-400"/> Case Details
        </h2>
        <p className="text-sm text-slate-500 mb-6">Input unstructured case notes, facts, or client emails.</p>
        
        <textarea
          className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none resize-none font-mono text-sm leading-relaxed mb-4 text-slate-800"
          placeholder="Paste case facts here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        
        <button
          onClick={handleAnalyze}
          disabled={loading || !inputText}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Layers size={18} />}
          <span>{loading ? 'Processing...' : 'Run Analysis'}</span>
        </button>
      </div>

      {/* Right Panel: Analysis */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
         {!result && !loading && (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
               <Layers size={40} className="text-slate-300" />
             </div>
             <h3 className="text-lg font-semibold text-slate-600">Awaiting Input</h3>
             <p className="max-w-md mt-2">The Gemini 3.0 reasoning engine is ready. Provide case details to generate a strategic assessment.</p>
           </div>
         )}

         {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12">
               <div className="relative mb-8">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
               </div>
               <h3 className="text-lg font-semibold text-slate-900 animate-pulse">Analyzing Legal Context...</h3>
               <div className="mt-4 space-y-2 w-64">
                 <div className="h-2 bg-slate-200 rounded overflow-hidden">
                   <div className="h-full bg-slate-400 w-2/3 animate-[progress_2s_ease-in-out_infinite]"></div>
                 </div>
                 <p className="text-xs text-center text-slate-500">Cross-referencing precedents</p>
               </div>
            </div>
         )}

         {result && (
           <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Analysis Report</h2>
                  <p className="text-sm text-slate-500">Generated via Gemini 3.0 Pro • Confidence Score: High</p>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Win Probability</p>
                     <p className={`text-3xl font-bold ${result.verdictProbability > 60 ? 'text-emerald-600' : result.verdictProbability > 40 ? 'text-amber-600' : 'text-red-600'}`}>
                       {result.verdictProbability}%
                     </p>
                   </div>
                   <div className="w-px h-10 bg-slate-200"></div>
                   <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                       className={`h-full ${result.verdictProbability > 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                       style={{ width: `${result.verdictProbability}%` }}
                     ></div>
                   </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-8 border-b border-slate-200 bg-white flex gap-6">
                <TabButton label="Executive Summary" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <TabButton label="Strategy & Tactics" active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} />
                <TabButton label="Risk Assessment" active={activeTab === 'risks'} onClick={() => setActiveTab('risks')} />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6 max-w-4xl">
                     <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                       <h4 className="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
                         <FileText size={16} className="text-blue-500"/> Summary of Facts
                       </h4>
                       <p className="text-slate-700 leading-relaxed text-sm">{result.summary}</p>
                     </div>
                     
                     <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                       <h4 className="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
                         <Layers size={16} className="text-slate-500"/> Key Precedents
                       </h4>
                       <div className="flex flex-wrap gap-2">
                         {result.keyPrecedents.map((p, i) => (
                           <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                             {p}
                           </span>
                         ))}
                       </div>
                     </div>
                  </div>
                )}

                {activeTab === 'strategy' && (
                   <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-4xl">
                      <h4 className="text-sm font-bold text-amber-600 uppercase mb-4 flex items-center gap-2">
                        <Lightbulb size={18} /> Recommended Legal Strategy
                      </h4>
                      <div className="prose prose-sm prose-slate max-w-none">
                        <p className="whitespace-pre-wrap leading-7">{result.strategy}</p>
                      </div>
                   </div>
                )}

                {activeTab === 'risks' && (
                  <div className="grid grid-cols-2 gap-6 max-w-5xl">
                    <div className="bg-white p-6 rounded-lg border border-emerald-100 shadow-sm">
                      <h4 className="text-sm font-bold text-emerald-700 uppercase mb-4 flex items-center gap-2">
                        <CheckCircle size={18} /> Key Strengths
                      </h4>
                      <ul className="space-y-3">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-red-100 shadow-sm">
                      <h4 className="text-sm font-bold text-red-700 uppercase mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} /> Critical Weaknesses
                      </h4>
                      <ul className="space-y-3">
                        {result.weaknesses.map((w, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700">
                             <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                             {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
      active 
        ? 'border-slate-900 text-slate-900' 
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);

export default CaseAnalyzer;
