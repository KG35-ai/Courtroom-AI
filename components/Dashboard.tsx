import React, { useState, useEffect } from 'react';
import { AppView, CaseFile } from '../types';
import { Clock, TrendingUp, FileText, AlertCircle, Plus, X, Search } from 'lucide-react';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const defaultCases: CaseFile[] = [
  { id: '1', refNumber: 'CV-2024-892', title: 'Smith v. TechCorp', client: 'John Smith', status: 'Active', lastUpdated: '2 hours ago' },
  { id: '2', refNumber: 'CR-2024-104', title: 'State v. Miller', client: 'D. Miller', status: 'Review', lastUpdated: '5 hours ago' },
  { id: '3', refNumber: 'RE-2023-441', title: 'Estate of H. Potts', client: 'Potts Trust', status: 'Active', lastUpdated: '1 day ago' },
];

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const [cases, setCases] = useState<CaseFile[]>(defaultCases);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', client: '', refNumber: '' });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('courtroom_ai_cases');
    if (saved) {
      setCases(JSON.parse(saved));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('courtroom_ai_cases', JSON.stringify(cases));
  }, [cases]);

  const handleAddCase = () => {
    if (!newCase.title || !newCase.client) return;
    const caseEntry: CaseFile = {
      id: Date.now().toString(),
      refNumber: newCase.refNumber || `CV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      title: newCase.title,
      client: newCase.client,
      status: 'Active',
      lastUpdated: 'Just now'
    };
    setCases([caseEntry, ...cases]);
    setShowNewCaseModal(false);
    setNewCase({ title: '', client: '', refNumber: '' });
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-slate-50 relative">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Practice Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Welcome back. You have {cases.filter(c => c.status === 'Active').length} active matters requiring attention.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onChangeView(AppView.RESEARCH)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-md hover:bg-slate-50 transition-colors shadow-sm"
          >
            Research
          </button>
          <button 
            onClick={() => setShowNewCaseModal(true)}
            className="px-4 py-2 bg-slate-900 text-white font-medium text-sm rounded-md hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={16} /> New Matter
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Matters" value={cases.length.toString()} icon={<FileText size={18} className="text-slate-500"/>} trend="+2 this week" />
        <MetricCard label="Pending Briefs" value="4" icon={<Clock size={18} className="text-amber-500"/>} trend="Due < 48h" urgent />
        <MetricCard label="Research Tasks" value="8" icon={<TrendingUp size={18} className="text-blue-500"/>} trend="All grounded" />
        <MetricCard label="System Load" value="Optimal" icon={<AlertCircle size={18} className="text-emerald-500"/>} trend="Gemini 1.5 Pro" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Matters Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Recent Matters</h3>
            <div className="relative">
               <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search files..." 
                 className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-full focus:outline-none focus:border-slate-400 w-48"
               />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 w-32">Ref. ID</th>
                  <th className="px-6 py-3">Case Title</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No active cases found. Create one to begin.</td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 group cursor-pointer transition-colors" onClick={() => onChangeView(AppView.CASE_ANALYSIS)}>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.refNumber}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{c.title}</td>
                      <td className="px-6 py-4 text-slate-600">{c.client}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 
                          c.status === 'Review' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-xs">{c.lastUpdated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              <DeadlineItem date="Oct 24" title="Motion to Dismiss" case="Smith v. TechCorp" daysLeft={2} />
              <DeadlineItem date="Oct 26" title="Discovery Cutoff" case="State v. Miller" daysLeft={4} />
              <DeadlineItem date="Nov 01" title="Settlement Conf" case="Quantum AI" daysLeft={9} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-md p-6 text-white relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold text-amber-500 mb-2">Simulate Cross-Exam</h3>
               <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                 Prepare for witness testimony using the persona engine.
               </p>
               <button 
                 onClick={() => onChangeView(AppView.MOCK_TRIAL)}
                 className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-sm font-medium transition-colors"
               >
                 Launch Simulation
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-900">Open New Matter</h3>
               <button onClick={() => setShowNewCaseModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Case Title</label>
                 <input 
                   type="text" 
                   value={newCase.title}
                   onChange={e => setNewCase({...newCase, title: e.target.value})}
                   className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:outline-none"
                   placeholder="e.g. Doe v. Roe"
                   autoFocus
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client Name</label>
                 <input 
                   type="text" 
                   value={newCase.client}
                   onChange={e => setNewCase({...newCase, client: e.target.value})}
                   className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:outline-none"
                   placeholder="e.g. Jane Doe"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reference ID (Optional)</label>
                 <input 
                   type="text" 
                   value={newCase.refNumber}
                   onChange={e => setNewCase({...newCase, refNumber: e.target.value})}
                   className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:outline-none"
                   placeholder="Leave blank for auto-gen"
                 />
               </div>
               
               <button 
                 onClick={handleAddCase}
                 disabled={!newCase.title || !newCase.client}
                 className="w-full py-2 bg-amber-600 text-white font-bold rounded hover:bg-amber-700 disabled:opacity-50 mt-4"
               >
                 Create File
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, icon, trend, urgent }: any) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between h-32">
    <div className="flex justify-between items-start">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className={`text-xs mt-1 font-medium ${urgent ? 'text-red-600' : 'text-emerald-600'}`}>
        {trend}
      </div>
    </div>
  </div>
);

const DeadlineItem = ({ date, title, case: caseName, daysLeft }: any) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-12 text-center bg-slate-50 rounded border border-slate-200 p-1">
      <div className="text-[10px] text-slate-500 uppercase">{date.split(' ')[0]}</div>
      <div className="text-sm font-bold text-slate-900">{date.split(' ')[1]}</div>
    </div>
    <div>
      <h4 className="text-sm font-medium text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500">{caseName}</p>
    </div>
    <div className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
      {daysLeft}d
    </div>
  </div>
);

export default Dashboard;