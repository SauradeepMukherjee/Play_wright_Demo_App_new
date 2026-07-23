const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dashboard = __dirname;
const sources = [
  { path: path.join(root, '.claude', 'agents'), type: 'Agent' },
  { path: path.join(root, '.claude', 'skills'), type: 'Skill' }
];

function frontmatter(text) {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  return Object.fromEntries(match[1].split(/\r?\n/).map((line) => {
    const index = line.indexOf(':');
    return index < 0 ? [] : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }).filter(([key]) => key));
}
async function files(folder) {
  const entries = await fs.readdir(folder, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map(async (entry) => {
    const item = path.join(folder, entry.name);
    return entry.isDirectory() ? files(item) : entry.isFile() && entry.name.endsWith('.md') ? [item] : [];
  }))).flat();
}
async function components() {
  const list = (await Promise.all(sources.map(async (source) => (await files(source.path)).map((file) => ({ ...source, file }))))).flat();
  return Promise.all(list.map(async ({ file, type }) => {
    const meta = frontmatter(await fs.readFile(file, 'utf8'));
    return {
      type,
      name: meta.name || path.basename(file, '.md'),
      description: meta.description || 'No frontmatter description available.',
      stage: meta.flow_stage || 'Unassigned',
      order: Number(meta.flow_order) || 999,
      input: meta.input || 'Not specified',
      output: meta.output || 'Not specified',
      file: path.relative(root, file).replace(/\\/g, '/')
    };
  })).then((items) => items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)));
}
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
async function status() {
  return JSON.parse(await fs.readFile(path.join(dashboard, 'status.json'), 'utf8').catch(() => '{}'));
}
http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/api/components') {
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return response.end(JSON.stringify(await components()));
  }
  if (url.pathname === '/api/status') {
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return response.end(JSON.stringify(await status()));
  }
  const file = path.resolve(dashboard, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
  if (!file.startsWith(dashboard + path.sep)) { response.writeHead(403); return response.end('Forbidden'); }
  try { response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); response.end(await fs.readFile(file)); }
  catch { response.writeHead(404); response.end('Not found'); }
}).listen(4173, () => console.log('QA Workflow Dashboard: http://localhost:4173'));
