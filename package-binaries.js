const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Define the folder path and the list of file names
const folderPath = './binaries/';
const fileNames = ['geostyler-cli-win.exe', 'geostyler-cli-linux', 'geostyler-cli-macos'];

function zipFile(filePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    const gzip = zlib.createGzip();
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outputFilePath);
    input.pipe(gzip).pipe(output);

    output.on('finish', () => {
      resolve();
    });

    output.on('error', (error) => {
      reject(error);
    });
  });
}

function renameFile(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Function to execute the renaming and zipping process
async function processFiles() {
  try {
    for (const fileName of fileNames) {
      const filePath = folderPath + fileName;
      const renamedFilePath = folderPath + fileName.replace('-win', '').replace('-macos', '').replace('-linux', '');

      // Rename the file
      await renameFile(filePath, renamedFilePath);

      // Zip the file
      const outputZipFilePath = filePath + '.zip';
      await zipFile(renamedFilePath, outputZipFilePath);
      // Rename the zipped file back to its original name
      await renameFile(outputZipFilePath, filePath);

      console.log(`Processed file: ${fileName}`);
    }

    console.log('All files processed successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

processFiles();
