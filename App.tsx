import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CaseAnalyzer from './components/CaseAnalyzer';
import LegalResearch from './components/LegalResearch';
import MockTrial from './components/MockTrial';
import ArgumentWriter from './components/ArgumentWriter';
import { AppView } from './types';
import { ShieldAlert, Check } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('courtroom_ai_terms_accepted');
    if (accepted === 'true') {
      setHasAcceptedTerms(true);
    }
  }, []);

  const acceptTerms = () => {
    localStorage.setItem('courtroom_ai_terms_accepted', 'true');
    setHasAcceptedTerms(true);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} />;
      case AppView.CASE_ANALYSIS:
        return <CaseAnalyzer />;
      case AppView.RESEARCH:
        return <LegalResearch />;
      case AppView.MOCK_TRIAL:
        return <MockTrial />;
      case AppView.ARGUMENT_WRITER:
        return <ArgumentWriter />;
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  if (!hasAcceptedTerms) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Professional Disclaimer</h2>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Action Required</p>
            </div>
          </div>
          <div className="p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              <strong>Courtroom AI</strong> utilizes advanced artificial intelligence (Google Gemini) to assist legal professionals. By proceeding, you acknowledge and agree to the following:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Not Legal Advice:</strong> Outputs are for informational and drafting assistance only. They do not constitute legal advice or create an attorney-client relationship.
              </li>
              <li>
                <strong>Verification Required:</strong> AI models can occasionally produce "hallucinations" or incorrect case citations. You must independently verify all statutes, precedents, and facts.
              </li>
              <li>
                <strong>Data Privacy:</strong> Do not input highly sensitive, unredacted Personally Identifiable Information (PII) into this demo environment.
              </li>
            </ul>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button 
              onClick={acceptTerms}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Check size={18} />
              I Acknowledge & Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-legal-50 font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>
    </div>
  );
};

export default App;