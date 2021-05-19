const fileBaseDir = "/files";
const imagesBaseDir = "./files/images";
const usersImagesBaseDir = "./files/images/users";
const fs = require('fs');

/**
     * Removes all files whose path is not in files param from the dirPath directory
     * @param {*} dirPath 
     * @param {*} filesToMantain 
     */
    async function clearImagesDirectory(dirPath, filesToMantain) {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(dirPath)) {
                fs.readdir(dirPath, (err, files) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        files.forEach(file => {
                            const fileDir = dirPath + "/" + file;
                    
                            if (!filesToMantain.includes(fileDir.replace("./", "/"))) {
                                fs.unlinkSync(fileDir);
                            }
                        });
                    }
                    resolve('success');
                });
            }
        })
    }

module.exports = {
    fileBaseDir,
    imagesBaseDir,
    usersImagesBaseDir,
    clearImagesDirectory
}