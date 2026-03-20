import { SectionId } from './Sidebar';

interface HeaderProps {
  activeSection: SectionId;
}

const sectionTitles: Record<SectionId, string> = {
  overview: 'Overview',
  insights: 'Insights',
  opportunities: 'Opportunities',
  experiments: 'Experiments',
  discovery: 'Discovery Mode',
  patterns: 'Patterns',
  'blind-spots': 'Blind Spots',
  'decision-log': 'Decision Log',
  'source-trace': 'Source Trace',
};

const sectionSubtitles: Record<SectionId, string> = {
  overview: 'Your microentrepreneurship cockpit at a glance',
  insights: 'Raw observations, signals and research notes',
  opportunities: 'Scored and prioritized business opportunities',
  experiments: 'Running hypotheses and validation tests',
  discovery: 'Rule-based pattern discovery and hypothesis generation',
  patterns: 'Tag clusters and cross-cutting themes',
  'blind-spots': 'Gaps, neglected items, and unanswered questions',
  'decision-log': 'Strategic decisions and their rationale',
  'source-trace': 'All sources referenced across your knowledge base',
};

export function Header({ activeSection }: HeaderProps) {
  return (
    <div>
      <h1 className="text-sm font-semibold text-zinc-100 leading-none">
        {sectionTitles[activeSection]}
      </h1>
      <p className="text-xs text-zinc-500 mt-0.5 hidden sm:block">
        {sectionSubtitles[activeSection]}
      </p>
    </div>
  );
}
