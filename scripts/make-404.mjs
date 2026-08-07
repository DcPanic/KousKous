/**
 * Builds docs/404.html from the exported index.html.
 *
 * GitHub Pages serves 404.html for any path it has no file for, which is
 * every dynamic route — the export writes those as literal "[id].html",
 * which no real URL matches. Loading the app there lets the router take
 * over and render the requested screen.
 *
 * The prerendered markup is stripped first: it describes the home screen,
 * so keeping it would make React hydrate against the wrong page and warn.
 * An empty root renders cleanly from scratch instead.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const docs = join(process.cwd(), 'docs');
const html = readFileSync(join(docs, 'index.html'), 'utf8');

const emptied = html.replace(
  /(<div id="root"[^>]*>)[\s\S]*?(<\/div>)(?=\s*<script)/,
  (_match, open, close) => `${open}${close}`,
);

if (emptied === html) {
  throw new Error('Could not empty #root — the export layout changed, update this script');
}

writeFileSync(join(docs, '404.html'), emptied);
console.log('Wrote docs/404.html');
