const { withAppBuildGradle } = require('@expo/config-plugins');

function withFixGradlePackaging(config) {
  return withAppBuildGradle(config, (config) => {
    const exclusionRule = `
    packaging {
        resources {
            excludes += [
                'META-INF/versions/9/OSGI-INF/MANIFEST.MF',
                'META-INF/MANIFEST.MF',
                'META-INF/LICENSE',
                'META-INF/LICENSE.txt',
                'META-INF/NOTICE',
                'META-INF/NOTICE.txt',
                'META-INF/*.kotlin_module'
            ]
        }
    }`;
    
    // Inject the rule inside the existing android { } block
    if (config.modResults.contents.includes('android {')) {
      config.modResults.contents = config.modResults.contents.replace(
        'android {',
        `android {${exclusionRule}`
      );
    }
    
    return config;
  });
}

module.exports = withFixGradlePackaging;