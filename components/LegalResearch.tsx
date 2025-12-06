import React, { useState } from 'react';
import { conductLegalResearch } from '../services/geminiService';
import { ResearchResult, Jurisdiction } from '../types';
import { Search, ExternalLink, BookOpen, Loader2, Globe, FileText, ChevronRight } from 'lucide-react';

const LegalResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('US Federal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await conductLegalResearch(query, jurisdiction);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar Controls */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm z-10">
         <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <Globe size={20} className="text-slate-400"/> Research Engine
         </h2>
         
         <form onSubmit={handleSearch} className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jurisdiction</label>
             <select 
               value={jurisdiction}
               onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
               className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 focus:outline-none"
             >
               <option value="US Federal">US Federal</option>
               <option value="California">California</option>
               <option value="New York">New York</option>
               <option value="Texas">Texas</option>
               <option value="Delaware">Delaware</option>
               <option value="United Kingdom">United Kingdom</option>
               <option value="European Union">European Union</option>
             </select>
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Query</label>
             <textarea
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 focus:ring-2 focus:ring-slate-400 focus:outline-none resize-none h-32"
               placeholder="e.g. 'Copyright fair use precedents for AI training data'"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
             />
           </div>

           <button 
             type="submit" 
             disabled={loading || !query}
             className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-md font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
           >
             {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
             <span>Run Search</span>
           </button>
         </form>

         <div className="mt-auto pt-6 border-t border-slate-100">
           <p className="text-xs text-slate-400 text-center">
             Powered by Gemini Google Search Grounding.
             Results prioritize authoritative sources.
           </p>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {!result && !loading && (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
             <BookOpen size={64} strokeWidth={1} className="mb-4" />
             <p className="text-lg font-medium">Ready to research</p>
           </div>
        )}

        {loading && (
          <div className="space-y-6 max-w-4xl mx-auto animate-pulse mt-12">
             <div className="h-4 bg-slate-200 rounded w-1/4 mb-8"></div>
             <div className="space-y-3">
               <div className="h-3 bg-slate-200 rounded w-full"></div>
               <div className="h-3 bg-slate-200 rounded w-full"></div>
               <div className="h-3 bg-slate-200 rounded w-5/6"></div>
             </div>
             <div className="pt-8 grid grid-cols-2 gap-4">
               <div className="h-24 bg-slate-100 rounded"></div>
               <div className="h-24 bg-slate-100 rounded"></div>
             </div>
          </div>
        )}

        {result && (
          <div className="max-w-4xl mx-auto space-y-8">
             {/* Text Result */}
             <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
               <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                   <FileText size={20} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900">Research Memorandum</h3>
               </div>
               <div className="prose prose-sm prose-slate max-w-none text-slate-800 leading-7 whitespace-pre-wrap">
                 {result.text}
               </div>
             </div>

             {/* Sources Grid */}
             <div>
               <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider">Citations & Authorities</h4>
               <div className="grid grid-cols-1 gap-3">
                  {result.sources.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No direct web citations returned for this query.</p>
                  ) : (
                    result.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group"
                      >
                         <span className="text-xs font-mono text-slate-400 mt-1">[{idx + 1}]</span>
                         <div className="flex-1">
                           <h5 className="text-sm font-semibold text-blue-700 group-hover:underline mb-1">{source.title}</h5>
                           <p className="text-xs text-slate-500 truncate max-w-2xl">{source.uri}</p>
                         </div>
                         <ExternalLink size={14} className="text-slate-300 group-hover:text-amber-500 mt-1" />
                      </a>
                    ))
                  )}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalResearch;
