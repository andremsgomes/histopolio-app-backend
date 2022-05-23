const fs = require("fs");

function readJSONFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function writeJSONFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  } catch (error) {
    console.log(error);
  }
}

function getFilesFromDir(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files;
  } catch (error) {
    console.log(error);
    return [];
  }
}

function fileExists(filePath) {
  try {
    const exists = fs.existsSync(filePath);
    return exists;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  readJSONFile,
  writeJSONFile,
  getFilesFromDir,
  fileExists,
};
