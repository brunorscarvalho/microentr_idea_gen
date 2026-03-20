import React from 'react';
import {
  LayoutDashboard,
  Lightbulb,
  Target,
  FlaskConical,
  Compass,
  BookOpen,
  GitBranch,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Zap,
} from 'lucide-react';

export type SectionId =
  | 'overview'
  | 'insights'
  | 'opportunities'
  | 'experiments'
  | 'discovery'
  | 'patterns'
  | 'blind-spots'
  | 'decision-log'
  | 'source-trace';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  counts: {
    insights: number;
    opportunities: number;
    experiments: number;
    decisions: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  counts,
  isOpen,
  onClose,
}: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <Lightbulb size={18} />,
      badge: counts.insights,
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: <Target size={18} />,
      badge: counts.opportunities,
    },
    {
      id: 'experiments',
      label: 'Experiments',
      icon: <FlaskConical size={18} />,
      badge: counts.experiments,
    },
    {
      id: 'discovery',
      label: 'Discovery Mode',
      icon: <Compass size={18} />,
    },
    {
      id: 'patterns',
      label: 'Patterns',
      icon: <TrendingUp size={18} />,
    },
    {
      id: 'blind-spots',
      label: 'Blind Spots',
      icon: <AlertTriangle size={18} />,
    },
    {
      id: 'decision-log',
      label: 'Decision Log',
      icon: <BookOpen size={18} />,
      badge: counts.decisions,
    },
    {
      id: 'source-trace',
      label: 'Source Trace',
      icon: <GitBranch size={18} />,
    },
  ];

  const handleClick = (id: SectionId) => {
    onSectionChange(id);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-zinc-900 border-r border-zinc-800 z-30 flex flex-col
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100 leading-none">Cockpit</div>
            <div className="text-xs text-zinc-500 mt-0.5">Microentr</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                  ${
                    activeSection === item.id
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  }
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`
                      text-xs px-1.5 py-0.5 rounded-full font-medium
                      ${activeSection === item.id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-700 text-zinc-400'}
                    `}
                  >
                    {item.badge}
                  </span>
                )}
                {activeSection === item.id && (
                  <ChevronRight size={14} className="text-indigo-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">Local-first · No backend</p>
        </div>
      </aside>
    </>
  );
}
