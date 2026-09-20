import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { auditSite } from './audit.js';
import { renderJson, renderMarkdown } from './report.js';

const HELP = `AutoCoder Local Growth Copilot

Run a read-only Launch Check for a public local business website.

Usage:
  autocoder-growth <url> [options]

Options:
  --business <name>    Public business name
  --service <service>  Primary service to look for
  --location <place>   Primary city or service area to look for
  --goal <goal>        call, booking, contact, quote, or visit
  --profile <file>     Load business context from a JSON file
  --format <format>    markdown (default) or json
  --output <file>      Write the report to a file instead of stdout
  --help               Show this help
  --version            Show the package version

Examples:
  autocoder-growth https://example.com --service plumbing --location Buffalo
  autocoder-growth https://example.com --profile examples/buffalo-plumber-profile.json
  autocoder-growth https://example.com --format json --output launch-check.json
`;

const VALUE_OPTIONS = new Set([
  '--business',
  '--service',
  '--location',
  '--goal',
  '--profile',
  '--format',
  '--output'
]);

function parseArguments(argv) {
  const options = { format: 'markdown' };
  let url;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '--version') {
      options[argument.slice(2)] = true;
      continue;
    }

    if (VALUE_OPTIONS.has(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a value.`);
      }
      options[argument.slice(2)] = value;
      index += 1;
      continue;
    }

    if (argument.startsWith('--')) {
      throw new Error(`Unknown option: ${argument}`);
    }

    if (url) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    url = argument;
  }

  return { options, url };
}

async function loadProfile(filePath) {
  const absolutePath = resolve(filePath);
  let source;

  try {
    source = await readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read profile ${absolutePath}: ${error.message}`);
  }

  try {
    const profile = JSON.parse(source);
    if (!profile || Array.isArray(profile) || typeof profile !== 'object') {
      throw new Error('the JSON root must be an object');
    }
    return profile;
  } catch (error) {
    throw new Error(`Invalid profile JSON in ${absolutePath}: ${error.message}`);
  }
}

function validateGoal(goal) {
  const supportedGoals = new Set(['call', 'booking', 'contact', 'quote', 'visit']);
  if (goal && !supportedGoals.has(goal)) {
    throw new Error(`Unsupported goal "${goal}". Use call, booking, contact, quote, or visit.`);
  }
}

export async function runCli(argv) {
  const { options, url } = parseArguments(argv);

  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  if (options.version) {
    process.stdout.write('0.1.0\n');
    return;
  }

  if (!url) {
    throw new Error('A public website URL is required. Run with --help for usage.');
  }

  if (!['markdown', 'json'].includes(options.format)) {
    throw new Error('--format must be markdown or json.');
  }

  const fileProfile = options.profile ? await loadProfile(options.profile) : {};
  const context = {
    ...fileProfile,
    businessName: options.business ?? fileProfile.businessName,
    service: options.service ?? fileProfile.service,
    location: options.location ?? fileProfile.location,
    goal: options.goal ?? fileProfile.goal
  };

  validateGoal(context.goal);

  const report = await auditSite(url, { context });
  const rendered = options.format === 'json' ? renderJson(report) : renderMarkdown(report);

  if (options.output) {
    const outputPath = resolve(options.output);
    await writeFile(outputPath, `${rendered}\n`, 'utf8');
    process.stdout.write(`Report written to ${outputPath}\n`);
    return;
  }

  process.stdout.write(`${rendered}\n`);
}

export { HELP, parseArguments };
