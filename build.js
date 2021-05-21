const Fs = require("fs");
const Path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");
var UglifyJS = require("uglify-js");

const src = Path.join(__dirname, "/src/");
const build = Path.join(__dirname, "/dist/");

readDirectory(src); // Start reading with src directory.

function readDirectory(dirPath) {
  Fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error("Could not list directory.", err);
      process.exit(1);
    }

    files.forEach(
      (
        file,
        index // loop through every file
      ) => {
        let path = Path.join(dirPath, file);
        if (path.split("/node_modules/").length == 1 && path.split("/.git/").length == 1) {
          Fs.stat(path, (err, stat) => {
            if (err) {
              console.log("error in stating file.", err);
              return;
            }

            if (stat.isFile()) {
              const newPath = path.replace(src, build); // Replace src path with build path.
              Fs.copyFileSync(path, newPath); // Copy file from old path in src to new path in build.
              if (newPath.endsWith(".js")) {
                // Check if it is javascript file.
                obfuscate(newPath); // Obfuscate copied file in build folder.
              }
            } else if (stat.isDirectory()) {
              var newDir = path.replace(src, build); // Replace src path with build path.
              if (!Fs.existsSync(newDir)) {
                // Check if directory exists or not.
                Fs.mkdirSync(newDir); // Create new directory.
              }
              readDirectory(path); // Further read the folder.
            }
          });
        }
      }
    );
  });
}

function obfuscate(filePath) {
  
  try {
    // Read the files content.
    const content = Fs.readFileSync(filePath).toString();
    var result_UglifyJS = UglifyJS.minify(content);
    var result = JavaScriptObfuscator.obfuscate(result_UglifyJS.code, {
      // Config for obfuscation
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      debugProtection: true,
      debugProtectionInterval: true,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: true,
      shuffleStringArray: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 5,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayIndexShift: true,
      stringArrayWrappersCount: 5,
      stringArrayWrappersChainedCalls: true,    
      stringArrayWrappersParametersMaxCount: 5,
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 1,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
      //High obfuscation, low performance
      //Preset Options in https://obfuscator.io/
    }); // Generated minified and obfuscated code
    Fs.writeFileSync(filePath, result.getObfuscatedCode());
  } catch (error) {
    console.log(error);
  }

  // Fs.writeFileSync(filePath, result.getObfuscatedCode()); // Write obfuscted and minified code generated back to file.
}
