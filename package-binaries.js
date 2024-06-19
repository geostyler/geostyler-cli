/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');


// Define the folder path and the list of file names
const folderPath = './binaries/';
const fileNames = ['geostyler-cli-win.exe', 'geostyler-cli-linux', 'geostyler-cli-macos'];

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
      const renamedFilePath = folderPath + fileName.replace('-cli-win', '').replace('-cli-macos', '').replace('-cli-linux', '');

      // Rename the file
      await renameFile(filePath, renamedFilePath);

      // Zip the file
      const outputZipFilePath = filePath + '.zip';
      const zip = new AdmZip();
      zip.addLocalFile(renamedFilePath);

      // Save the zip archive
      zip.writeZip(outputZipFilePath);

      // Rename the zipped file back to its original name
      await renameFile(renamedFilePath, filePath);
      console.log(`Processed file: ${fileName}`);
    }

    console.log('All files processed successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

processFiles();
