const fs = require("fs");
const path = require("path");

const folder = process.argv[2];
const PROJECT_FOLDER = path.join(process.cwd(), folder);

const MainApplicationFile = path.join(
  PROJECT_FOLDER,
  `android/app/src/main/java/com/${folder}/MainApplication.java`
);
const AndroidBuildGradleFile = path.join(
  PROJECT_FOLDER,
  `android/build.gradle`
);
const AndroidAppBuildGradleFile = path.join(
  PROJECT_FOLDER,
  `android/app/build.gradle`
);
const LocalPropertiesFile = path.join(
  PROJECT_FOLDER,
  `android/local.properties`
);

function pathFile(file, cb) {
  fs.writeFileSync(file, cb(fs.readFileSync(file).toString()));
}

function pathMainApplication(javaCode) {
  if (!javaCode.includes("com.ammarahmed.mmkv.RNMMKVJSIModulePackage")) {
    javaCode = javaCode.replace(
      "import com.facebook.react.ReactPackage;",
      `import com.facebook.react.ReactPackage;\nimport com.ammarahmed.mmkv.RNMMKVJSIModulePackage;\nimport com.facebook.react.bridge.JSIModulePackage;`
    );
  }

  if (!javaCode.includes("getJSIModulePackage")) {
    javaCode = javaCode.replace(
      "protected List<ReactPackage> getPackages() {",
      `protected JSIModulePackage getJSIModulePackage() {
            return new RNMMKVJSIModulePackage();
        }

        @Override
        protected List<ReactPackage> getPackages() {`
    );
  }

  return javaCode;
}

function pathAndroidBuildGradle(gradleCode) {
  // add ndkVersion for react-native@0.63 and below
  if (!gradleCode.includes("ndkVersion")) {
    gradleCode = gradleCode.replace(
      "targetSdkVersion",
      `ndkVersion = "21.1.6352462"\n        targetSdkVersion`
    );
  }

  if (
    [
      'classpath("com.android.tools.build:gradle:3.5.2")',
      'classpath("com.android.tools.build:gradle:3.5.3")',
    ].some((ver) => gradleCode.includes(ver))
  ) {
    [
      'classpath("com.android.tools.build:gradle:3.5.2")',
      'classpath("com.android.tools.build:gradle:3.5.3")',
    ].forEach((ver) => {
      gradleCode = gradleCode.replace(
        ver,
        `classpath("com.android.tools.build:gradle:4.1.0")`
      );
    });
  }

  return gradleCode;
}

function pathAndroid_App_BuildGradle(gradleCode) {
  // add ndkVersion for react-native@0.63 and below
  if (!gradleCode.includes("rootProject.ext.ndkVersion")) {
    gradleCode = gradleCode.replace(
      "android {",
      "android {\n    ndkVersion rootProject.ext.ndkVersion"
    );
  }

  return gradleCode;
}

pathFile(MainApplicationFile, pathMainApplication);
fs.writeFileSync(LocalPropertiesFile,`
cmake.dir=/usr/local/lib/android/sdk/cmake/3.10.2.4988404
`);

// pathFile(AndroidBuildGradleFile, pathAndroidBuildGradle);
// pathFile(AndroidAppBuildGradleFile, pathAndroid_App_BuildGradle);
