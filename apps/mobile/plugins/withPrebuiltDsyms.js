const { withXcodeProject } = require('@expo/config-plugins');

const withPrebuiltDsyms = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const buildPhaseName = 'Generate Prebuilt Framework dSYMs';

    // Check if the build phase already exists to maintain idempotency
    const buildPhases = xcodeProject.hash.project.objects['PBXShellScriptBuildPhase'] || {};
    const existingPhase = Object.values(buildPhases).find(
      (phase) => phase.name === `"${buildPhaseName}"` || phase.name === buildPhaseName
    );

    if (!existingPhase) {
      const script = `
set -e
if [ -n "$DWARF_DSYM_FOLDER_PATH" ]; then
  mkdir -p "$DWARF_DSYM_FOLDER_PATH"
  
  echo "Generating dSYMs for prebuilt React Native frameworks..."
  
  # 1. Hermes
  HERMES_FRAMEWORK="\${PODS_ROOT}/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64/hermes.framework"
  HERMES_DSYM="\${DWARF_DSYM_FOLDER_PATH}/hermes.framework.dSYM"
  if [ -d "\$HERMES_FRAMEWORK" ] && [ ! -d "\$HERMES_DSYM" ]; then
    echo "Generating dSYM for hermes.framework..."
    dsymutil "\$HERMES_FRAMEWORK/hermes" -o "$HERMES_DSYM"
  fi

  # 2. React
  REACT_FRAMEWORK="\${PODS_ROOT}/React-Core-prebuilt/React.xcframework/ios-arm64/React.framework"
  REACT_DSYM="\${DWARF_DSYM_FOLDER_PATH}/React.framework.dSYM"
  if [ -d "\$REACT_FRAMEWORK" ] && [ ! -d "\$REACT_DSYM" ]; then
    echo "Generating dSYM for React.framework..."
    dsymutil "\$REACT_FRAMEWORK/React" -o "$REACT_DSYM"
  fi

  # 3. ReactNativeDependencies
  RNDEP_FRAMEWORK="\${PODS_ROOT}/ReactNativeDependencies/framework/packages/react-native/ReactNativeDependencies.xcframework/ios-arm64/ReactNativeDependencies.framework"
  RNDEP_DSYM="\${DWARF_DSYM_FOLDER_PATH}/ReactNativeDependencies.framework.dSYM"
  if [ -d "\$RNDEP_FRAMEWORK" ] && [ ! -d "\$RNDEP_DSYM" ]; then
    echo "Generating dSYM for ReactNativeDependencies.framework..."
    dsymutil "\$RNDEP_FRAMEWORK/ReactNativeDependencies" -o "$RNDEP_DSYM"
  fi
fi
`;

      xcodeProject.addBuildPhase(
        [],
        'PBXShellScriptBuildPhase',
        buildPhaseName,
        null, // first target
        {
          shellPath: '/bin/sh',
          shellScript: script,
        }
      );
      console.log(`Added build phase: ${buildPhaseName}`);
    } else {
      console.log(`Build phase already exists: ${buildPhaseName}`);
    }

    return config;
  });
};

module.exports = withPrebuiltDsyms;
