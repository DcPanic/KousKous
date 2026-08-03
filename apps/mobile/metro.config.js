// Metro configuration for a npm-workspaces monorepo.
// Without this, Metro only watches apps/mobile and cannot resolve
// @kouskous/shared or the dependencies hoisted to the workspace root.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Resolve strictly from the paths above so a stray nested copy of React
// cannot shadow the hoisted one and trigger duplicate-renderer errors.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
