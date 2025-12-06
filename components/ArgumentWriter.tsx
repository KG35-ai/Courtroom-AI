import React, { useState } from 'react';
import { generateLegalArgument } from '../services/geminiService';
import { Copy, FileText, PenTool, Check, Download, AlignLeft } from 'lucide-react';

const ArgumentWriter: React.FC = () => {
  const [docType, setDocType] = useState('Opening Statement');
  const [jurisdiction, setJurisdiction] = useState('US Federal');
  const [tone, setTone] = useState('Persuasive & Authoritative');
  const [facts, setFacts] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!facts || !keyPoints) return;
    setLoading(true);
    setGeneratedDoc('');
    try {
      const text = await generateLegalArgument(docType, facts, keyPoints, jurisdiction, tone);
      setGeneratedDoc(text);
    } catch (e) {
      alert('Error generating document');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedDoc) {
      navigator.clipboard.writeText(generatedDoc);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Panel: Configuration */}
      <div className="w-96 border-r border-slate-200 bg-white flex flex-col p-6 overflow-y-auto shadow-sm z-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PenTool size={20} className="text-slate-400" /> Draft Configuration
        </h2>
        
        <div className="space-y-5 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Document Type</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option>Opening Statement</option>
              <option>Closing Argument</option>
              <option>Motion to Dismiss</option>
              <option>Motion for Summary Judgment</option>
              <option>Cross-Examination Outline</option>
              <option>Settlement Demand Letter</option>
              <option>Internal Legal Memo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jurisdiction</label>
            <select 
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option>US Federal</option>
              <option>California</option>
              <option>New York</option>
              <option>Texas</option>
              <option>United Kingdom</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tone Strategy</label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option>Persuasive & Authoritative</option>
              <option>Aggressive & Firm</option>
              <option>Conciliatory (Settlement)</option>
              <option>Objective & Analytical</option>
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Case Facts</label>
             <textarea 
               value={facts}
               onChange={(e) => setFacts(e.target.value)}
               className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
               placeholder="Essential background facts..."
             />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Key Legal Arguments</label>
             <textarea 
               value={keyPoints}
               onChange={(e) => setKeyPoints(e.target.value)}
               className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
               placeholder="Points to emphasize (e.g. lack of standing, statute of limitations)..."
             />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 mt-6">
          <button 
            onClick={handleGenerate}
            disabled={loading || !facts || !keyPoints}
            className="w-full py-3 bg-slate-900 text-white rounded-md font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? <span className="animate-spin text-lg">⟳</span> : <FileText size={18} />}
            {loading ? 'Drafting...' : 'Generate Document'}
          </button>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="flex-1 flex flex-col bg-slate-100 p-8 overflow-hidden">
         <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-700 flex items-center gap-2">
               <AlignLeft size={18} /> Document Preview
             </h3>
             <div className="flex gap-2">
                {generatedDoc && (
                 <>
                   <button 
                     onClick={copyToClipboard}
                     className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
                   >
                     {copied ? <Check size={14} className="text-emerald-600"/> : <Copy size={14} />}
                     {copied ? 'Copied' : 'Copy'}
                   </button>
                   <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white border border-slate-900 rounded text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm">
                     <Download size={14} /> Export PDF
                   </button>
                 </>
                )}
             </div>
         </div>
         
         <div className="flex-1 bg-white border border-slate-300 shadow-md rounded-sm overflow-y-auto p-12">
             {generatedDoc ? (
               <div className="prose prose-slate max-w-none font-serif leading-8 text-slate-900 whitespace-pre-wrap">
                 {generatedDoc}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-300">
                 <FileText size={64} strokeWidth={1} className="mb-4" />
                 <p className="font-medium text-slate-400">Configure parameters to generate draft</p>
               </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default ArgumentWriter;
