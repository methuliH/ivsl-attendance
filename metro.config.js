const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// expo-linking's package.json has an "exports" map that only lists ".".
// Metro 0.83 with package exports enabled cannot follow the relative
// "./Schemes" import inside Linking.js. Intercept it directly.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === './Schemes' &&
    context.originModulePath.includes(path.join('expo-linking', 'build'))
  ) {
    return {
      filePath: path.join(
        path.dirname(context.originModulePath),
        'Schemes.js'
      ),
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
