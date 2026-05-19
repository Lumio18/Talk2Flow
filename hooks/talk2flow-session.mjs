#!/usr/bin/env node
/**
 * Talk2Flow SessionStart Hook
 *
 * Fires once at session start (and on resume/clear/compact).
 * Reads the plugin version from .claude-plugin/plugin.json and injects
 * a brief orientation into the model's context.
 *
 * Hook event: SessionStart
 * Stdin: JSON with session_id, cwd, env_file (we ignore most of it)
 * Stdout: JSON with hookSpecificOutput.additionalContext
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || resolve(__dirname, '..');

let version = 'unknown';
const manifestPath = join(pluginRoot, '.claude-plugin', 'plugin.json');
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    version = manifest.version || version;
  } catch {
    /* ignore — keep "unknown" */
  }
}

const context = [
  `Talk2Flow v${version} loaded.`,
  '',
  'To start: paste a meeting transcript or describe a daily routine.',
  'The pipeline scans for coverage gaps, extracts processes, identifies opportunities with ROI, profiles the stack, produces a universal automation spec, and generates an importable n8n workflow.',
  '',
  'Reference demo: demos/pme-order-management/'
].join('\n');

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: context
  }
}));
