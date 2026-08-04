/**
 * Extends app.json.
 *
 * GitHub Pages serves a project site from a sub-path (/KousKous), so the
 * web export needs a matching base URL. It is read from the environment
 * rather than hard-coded, because setting it permanently would break
 * `npm run mobile:web`, which serves from the root.
 */
module.exports = ({ config }) => {
  const baseUrl = process.env.KOUSKOUS_BASE_URL;

  if (!baseUrl) return config;

  return {
    ...config,
    experiments: { ...config.experiments, baseUrl },
  };
};
