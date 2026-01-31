const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ensure React resolves from example's node_modules first
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'node_modules'),
        'node_modules',
      ];
      
      // Force webpack to prefer 'module' field over 'main' for ES modules
      webpackConfig.resolve.mainFields = ['module', 'main'];
      
      // Remove ModuleScopePlugin to allow imports from outside src/
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );
      
      // Find and modify babel-loader rules to exclude dist folder
      const modifyBabelRules = (rules) => {
        rules.forEach((rule) => {
          if (rule.oneOf) {
            modifyBabelRules(rule.oneOf);
          } else if (rule.test && rule.test.toString().includes('js') && !rule.test.toString().includes('mjs')) {
            const exclude = Array.isArray(rule.exclude) 
              ? rule.exclude 
              : rule.exclude 
                ? [rule.exclude] 
                : [];
            rule.exclude = [
              ...exclude,
              path.resolve(__dirname, '../dist'),
            ];
          }
        });
      };
      modifyBabelRules(webpackConfig.module.rules);
      
      // Force webpack to use ES module version via alias
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'use-eth-price': path.resolve(__dirname, '../dist/index.es.js'),
      };
      
      return webpackConfig;
    },
  },
};
