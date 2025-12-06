import React from 'react';
import { Scale, Gavel, BookOpen, MessageSquare, FileText, LayoutDashboard, UserCircle, ChevronRight } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
    { id: AppView.CASE_ANALYSIS, label: 'Case Analysis', icon: Scale },
    { id: AppView.RESEARCH, label: 'Legal Research', icon: BookOpen },
    { id: AppView.MOCK_TRIAL, label: 'Trial Sim', icon: Gavel },
    { id: AppView.ARGUMENT_WRITER, label: 'Drafting', icon: FileText },
  ];

  return (
    <div className="w-72 bg-slate-900 text-slate-300 h-full flex flex-col shadow-2xl z-20">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-900/20">
           <Scale size={20} className="text-slate-900" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">Courtroom AI</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">PRO EDITION</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tools</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-slate-800 text-white shadow-sm border-l-2 border-amber-500'
                : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={currentView === item.id ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-300'} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            {currentView === item.id && <ChevronRight size={14} className="text-amber-500/50" />}
          </button>
        ))}
      </nav>

      {/* Profile / Bottom */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-950/30">
        <div className="flex items-center gap-3 hover:bg-slate-800/50 p-2 rounded-lg cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
             <UserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">J. Doe, Esq.</p>
            <p className="text-xs text-slate-500 truncate">Senior Associate</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 justify-center">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">System Operational</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
