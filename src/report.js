import { CATEGORY_LABELS } from './rules.js';

const STATUS_LABELS = {
  fail: 'FAIL',
  'not-applicable': 'N/A',
  pass: 'PASS',
  warning: 'WARNING'
};

function cleanInline(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function formatScore(value, coverage) {
  return value === null ? `N/A (${coverage}% coverage)` : `${value} / 100 (${coverage}% coverage)`;
}

export function renderMarkdown(report) {
  const lines = [
    '# Launch Check',
    '',
    `- Site: ${report.audit.siteUrl}`,
    `- Audited: ${report.audit.startedAt}`,
    `- Tool version: ${report.tool.version}`,
    `- Ruleset version: ${report.tool.rulesetVersion}`,
    `- Rendering: ${report.rendering.mode} (${report.rendering.status})`,
    '',
    '## Scores',
    '',
    `- Discoverability: **${formatScore(report.scores.discoverability, report.coverage.discoverability)}**`,
    `- Local relevance: **${formatScore(report.scores.localRelevance, report.coverage.localRelevance)}**`,
    `- Conversion readiness: **${formatScore(report.scores.conversionReadiness, report.coverage.conversionReadiness)}**`,
    '',
    '## Top actions',
    ''
  ];

  if (report.topActions.length === 0) {
    lines.push('No failed or warning checks were found.', '');
  } else {
    report.topActions.forEach((action, index) => {
      lines.push(
        `### ${index + 1}. ${action.title}`,
        '',
        `- Status: **${STATUS_LABELS[action.status]}**`,
        `- Evidence: ${cleanInline(action.evidence)}`,
        `- Why it matters: ${cleanInline(action.explanation)}`,
        `- Next step: ${cleanInline(action.recommendation)}`,
        ''
      );
    });
  }

  lines.push('## All findings', '');
  for (const [category, label] of Object.entries(CATEGORY_LABELS)) {
    lines.push(`### ${label}`, '');
    for (const item of report.findings.filter((finding) => finding.category === category)) {
      lines.push(
        `#### [${STATUS_LABELS[item.status]}] ${item.title}`,
        '',
        `- Rule: \`${item.id}\``,
        `- Evidence: ${cleanInline(item.evidence)}`,
        `- Recommendation: ${cleanInline(item.recommendation)}`,
        ''
      );
    }
  }

  lines.push('## Inspected resources', '');
  for (const resource of report.inspectedResources) {
    lines.push(`- ${resource.url} — ${resource.error ? `Error: ${resource.error}` : `HTTP ${resource.status}`}`);
  }

  lines.push('', '## Limitations', '');
  for (const limitation of report.limitations) lines.push(`- ${limitation}`);

  return lines.join('\n').trim();
}

export function renderJson(report) {
  return JSON.stringify(report, null, 2);
}
