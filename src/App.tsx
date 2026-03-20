import React, { useState } from 'react';
import { Menu, Download, Upload, RotateCcw } from 'lucide-react';
import { Sidebar, SectionId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Overview } from './components/dashboard/Overview';
import { InsightList } from './components/insights/InsightList';
import { OpportunityList } from './components/opportunities/OpportunityList';
import { ExperimentList } from './components/experiments/ExperimentList';
import { DiscoveryMode } from './components/discovery/DiscoveryMode';
import { Patterns } from './components/patterns/Patterns';
import { BlindSpots } from './components/blind-spots/BlindSpots';
import { DecisionLog } from './components/decision-log/DecisionLog';
import { SourceTrace } from './components/source-trace/SourceTrace';
import { useStore } from './hooks/useStore';
import { exportToJSON } from './lib/export';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState('');

  const store = useStore();

  const counts = {
    insights: store.insights.filter(i => i.status === 'active').length,
    opportunities: store.opportunities.filter(o => o.status === 'active').length,
    experiments: store.experiments.length,
    decisions: store.decisionLog.length,
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const ok = store.importFromJSON(text);
      if (ok) {
        setShowImport(false);
        setImportError('');
      } else {
        setImportError('Invalid JSON. Make sure you import a valid cockpit export file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        counts={counts}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-zinc-100"
            >
              <Menu size={20} />
            </button>
            <Header activeSection={activeSection} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToJSON(store.fullState)}
              title="Export all data as JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded font-medium transition-colors"
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={() => setShowImport(v => !v)}
              title="Import JSON data"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded font-medium transition-colors"
            >
              <Upload size={13} />
              Import
            </button>
            <button
              onClick={() => { if (confirm('Reset to seed data? All changes will be lost.')) store.resetToSeed(); }}
              title="Reset to seed data"
              className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 text-xs rounded font-medium transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Import bar */}
        {showImport && (
          <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3">
            <span className="text-xs text-zinc-400">Import JSON export file:</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="text-xs text-zinc-300 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-200 hover:file:bg-zinc-600"
            />
            {importError && <span className="text-xs text-red-400">{importError}</span>}
            <button onClick={() => { setShowImport(false); setImportError(''); }} className="text-xs text-zinc-500 hover:text-zinc-300 ml-auto">
              Cancel
            </button>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-5 py-6">
          <div className="max-w-4xl mx-auto">
            {activeSection === 'overview' && (
              <Overview
                insights={store.insights}
                opportunities={store.opportunities}
                experiments={store.experiments}
                decisionLog={store.decisionLog}
                onNavigate={setActiveSection}
              />
            )}
            {activeSection === 'insights' && (
              <InsightList
                insights={store.insights}
                onAdd={store.addInsight}
                onUpdate={store.updateInsight}
                onDelete={store.deleteInsight}
                onPromote={store.promoteInsightToOpportunity}
                scoringWeights={store.scoringWeights}
              />
            )}
            {activeSection === 'opportunities' && (
              <OpportunityList
                opportunities={store.opportunities}
                scoringWeights={store.scoringWeights}
                onAdd={store.addOpportunity}
                onUpdate={store.updateOpportunity}
                onReject={store.rejectOpportunity}
                onUpdateWeights={store.updateScoringWeights}
                onAddExperiment={store.addExperiment}
              />
            )}
            {activeSection === 'experiments' && (
              <ExperimentList
                experiments={store.experiments}
                opportunities={store.opportunities}
                onAdd={store.addExperiment}
                onUpdate={store.updateExperiment}
              />
            )}
            {activeSection === 'discovery' && (
              <DiscoveryMode
                insights={store.insights}
                opportunities={store.opportunities}
                experiments={store.experiments}
              />
            )}
            {activeSection === 'patterns' && (
              <Patterns
                insights={store.insights}
                opportunities={store.opportunities}
              />
            )}
            {activeSection === 'blind-spots' && (
              <BlindSpots
                insights={store.insights}
                opportunities={store.opportunities}
                decisionLog={store.decisionLog}
              />
            )}
            {activeSection === 'decision-log' && (
              <DecisionLog
                entries={store.decisionLog}
                onAddEntry={store.addDecisionEntry}
              />
            )}
            {activeSection === 'source-trace' && (
              <SourceTrace
                insights={store.insights}
                opportunities={store.opportunities}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
