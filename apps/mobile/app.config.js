/**
 * Extends app.json.
 *
 * GitHub Pages serves a project site from a sub-path (/KousKous), so the
 * web export needs a matching base URL. It is read from the environment
 * rather than hard-coded, because setting it permanently would break
 * `npm run mobile:web`, which serves from the root.
 */
module.exports = ({ config }) => {
  const baseUrl = process.env.KOUSKOUS_BASE_URL ?? '';

  return {
    ...config,
    // Also exposed through `extra` so runtime code can build shareable
    // links: expo-router does not publish the base URL to the bundle, and
    // a link built without it 404s on GitHub Pages.
    extra: { ...config.extra, baseUrl },
    ...(baseUrl ? { experiments: { ...config.experiments, baseUrl } } : {}),
  };
};
