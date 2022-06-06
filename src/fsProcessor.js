import * as fsPromises from 'fs/promises';
import fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { PathProcessor } from './pathProcessor.js';

export class FSProcessor extends PathProcessor {
    async readFile(currentDir, requestedPath, cb = false, command = '') {
        const fileData = await this.getFileNameToPath(currentDir, requestedPath, command);

        if (!fileData) return;

        const readableStream = fs.createReadStream(fileData.filePath, 'utf8');

        readableStream.on('error', (error) => {
            this.failedErrorOutput(currentDir);
        });

        readableStream.on('data', (chunk) => {
            console.log(chunk);
        });

        readableStream.on('end', () => {
            cb ? this.standartOutput(currentDir) : null;
        });
    }

    async createFile(currentDir, fileName) {
        const filePath = path.join(currentDir, fileName);
        const writableStream = fs.createWriteStream(filePath);

        writableStream.on('error', (error) => {
            this.failedErrorOutput(currentDir);
        });
        writableStream.on('close', () => {
            writableStream.end();
        });

        this.standartOutput(currentDir);
        writableStream.close();
    }

    async renameFile(currentDir, filePath, newFileName, cb = false, command = '') {
        const fileData = await this.getFileNameToPath(currentDir, filePath, command);
        if (!fileData) return;
        if (fileData.fileName == newFileName) {
            this.invalidErrorOutput(currentDir, command);
            return;
        }

        try {
            const oldFileStat = await fsPromises.stat(fileData.filePath);
            if (!oldFileStat.isFile()) throw Error;
            const readableStream = fs.createReadStream(fileData.filePath, 'utf8');

            readableStream.on('error', (error) => {
                console.log(error);
                this.failedErrorOutput(currentDir);
                return;
            });

            readableStream.on('end', () => {});

            const renameFilePath = path.join(fileData.fileDir.dir, newFileName);

            const writableStream = fs.createWriteStream(renameFilePath);

            writableStream.on('error', (error) => {
                return;
            });
            writableStream.on('close', async () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                await fsPromises.rm(fileData.filePath);
                cb ? this.standartOutput(currentDir) : null;
            });

            readableStream.pipe(writableStream);
        } catch (error) {
            this.failedErrorOutput(currentDir);
        }
    }

    async deleteFile(currentDir, requestedPath, cb = false, command = '') {
        const fileData = await this.getFileNameToPath(currentDir, requestedPath);

        if (!fileData) return;

        const readableStream = fs.createReadStream(fileData.filePath, 'utf8');

        readableStream.on('error', (error) => {
            this.operationFailed();
        });

        readableStream.on('close', async () => {
            await fsPromises.rm(fileData.filePath).catch(() => {
                return;
            });
            cb ? this.standartOutput(currentDir) : null;
        });

        readableStream.close();
    }

    async copyFile(currentDir, filePath, copyFilePath, cb = false, command = '') {
        const fileData = await this.getFileNameToPath(currentDir, filePath, command);

        if (!fileData) return;

        const fileCopyData = await this.getFileNameToPath(currentDir, copyFilePath, command);

        if (!fileCopyData) return;

        try {
            const oldFileStat = await fsPromises.stat(fileData.filePath);
            if (!oldFileStat.isFile()) throw Error;
            const readableStream = fs.createReadStream(fileData.filePath, 'utf8');

            readableStream.on('error', (error) => {
                this.failedErrorOutput(currentDir);
            });

            const copyPath = path.join(fileCopyData.filePath, fileData.fileName);
            const writableStream = fs.createWriteStream(copyPath);

            writableStream.on('error', (error) => {
                this.operationFailed();
            });
            writableStream.on('close', () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                cb ? this.standartOutput(currentDir) : null;
            });

            readableStream.pipe(writableStream);
        } catch (error) {
            this.failedErrorOutput(currentDir);
        }
    }

    async moveFile(currentDir, filePath, copyFilePath, cb = false, command = '') {
        const fileData = await this.getFileNameToPath(currentDir, filePath);

        if (!fileData) return;

        const fileCopyData = await this.getFileNameToPath(currentDir, copyFilePath);

        if (!fileCopyData) return;

        try {
            const oldFileStat = await fsPromises.stat(fileData.filePath);
            if (!oldFileStat.isFile()) throw Error;
            const readableStream = fs.createReadStream(fileData.filePath, 'utf8');

            readableStream.on('error', (error) => {
                console.log('READ');
                this.failedErrorOutput(currentDir);
            });

            const copyPath = path.join(fileCopyData.filePath, fileData.fileName);
            const writableStream = fs.createWriteStream(copyPath);

            writableStream.on('error', (error) => {
                this.operationFailed();
            });
            writableStream.on('finish', async () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                await fsPromises.rm(fileData.filePath);
            });
            writableStream.on('close', () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                cb ? this.standartOutput(currentDir) : null;
            });

            readableStream.pipe(writableStream);
        } catch (error) {
            this.failedErrorOutput(currentDir);
        }
    }

    async getFileHash(currentDir, filePath, cb = false, command = '') {
        const fileData = await this.getFileNameToPath(currentDir, filePath, command);

        if (!fileData) return;

        try {
            const fileStat = await fsPromises.stat(fileData.filePath);
            if (!fileStat.isFile()) throw Error;

            const readableStream = fs.createReadStream(fileData.filePath, 'utf8');

            readableStream.on('error', (error) => {
                this.failedErrorOutput(currentDir);
            });

            readableStream.on('data', (data) => {
                const algorithm = 'sha256';

                const cripted = crypto.createHash(algorithm).update(data).digest('hex');

                console.log('\nFile hash: ', cripted);
            });

            readableStream.on('end', () => {
                cb ? this.standartOutput(currentDir) : null;
            });
        } catch (error) {
            this.failedErrorOutput(currentDir);
        }
    }

    async compressFile(currentDir, filePath, archiveFilePath, cb = false, command = '') {
        const fileData = await this.getFileNameToPath(currentDir, filePath);

        if (!fileData) return;

        const fileArchData = await this.getFileNameToPath(currentDir, archiveFilePath);

        if (!fileArchData) return;

        try {
            const fileStat = await fsPromises.stat(fileData.filePath);
            if (!fileStat.isFile()) throw Error;

            const readableStream = fs.createReadStream(fileData.filePath);

            readableStream.on('error', (error) => {
                this.failedErrorOutput(currentDir);
            });

            const copyPath = path.join(fileArchData.filePath, 'archive.gz');

            const writableStream = fs.createWriteStream(copyPath);
            writableStream.on('error', (error) => {
                this.operationFailed();
            });
            writableStream.on('close', () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                cb ? this.standartOutput(currentDir) : null;
            });

            await pipeline(readableStream, zlib.createBrotliCompress(), writableStream);
        } catch (error) {
            console.log(error);
            this.failedErrorOutput(currentDir);
        }
    }

    async decompressFile(currentDir, filePath, archiveFilePath, cb = false, command = '') {
        const fileArchData = await this.getFileNameToPath(currentDir, filePath);

        if (!fileArchData) return;

        const fileData = await this.getFileNameToPath(currentDir, archiveFilePath);

        if (!fileData) return;

        try {
            const fileStat = await fsPromises.stat(fileArchData.filePath);
            if (!fileStat.isFile()) throw Error;

            const readableStream = fs.createReadStream(fileArchData.filePath);

            readableStream.on('error', (error) => {
                this.failedErrorOutput(currentDir);
            });

            const copyPath = path.join(fileData.filePath, 'decompressed.txt');

            const writableStream = fs.createWriteStream(copyPath);
            
            writableStream.on('error', (error) => {
                this.operationFailed();
            });
            
            writableStream.on('close', () => {
                writableStream.end();
                readableStream.unpipe();
                readableStream.close();
                cb ? this.standartOutput(currentDir) : null;
            });

            await pipeline(readableStream, zlib.createBrotliDecompress(), writableStream);

            writableStream.close();
        } catch (error) {
            this.failedErrorOutput(currentDir);
        }
    }

    async output(request, dir) {
        const command = request.split(' ');

        switch (command[0]) {
            case 'ls':
                await this.dirList(dir);
                break;
            case 'up':
                return this.directoryLevelUp(dir);
            case 'cd':
                if (!command[1]) {
                    this.invalidErrorOutput(dir, 'cd');
                    return null;
                }
                return this.changeDirectory(dir, command[1], true, 'cd');
            case 'cat':
                if (!command[1]) {
                    this.invalidErrorOutput(dir, 'cat');
                    return null;
                }
                await this.readFile(dir, command[1], true, 'cat');
                break;
            case 'add':
                if (!command[1]) {
                    this.invalidErrorOutput(dir, 'add');
                    return null;
                }
                await this.createFile(dir, command[1]);
                break;
            case 'rn':
                if (!command[1] || !command[2]) {
                    this.invalidErrorOutput(dir, 'rn');
                    return null;
                }
                await this.renameFile(dir, command[1], command[2], true, 'rn');
                break;
            case 'rm':
                if (!command[1]) {
                    this.invalidErrorOutput(dir, 'rm');
                    return null;
                }
                await this.deleteFile(dir, command[1], true, 'rm');
                break;
            case 'cp':
                if (!command[1] || !command[2]) {
                    this.invalidErrorOutput(dir, 'cp');
                    return null;
                }
                await this.copyFile(dir, command[1], command[2], true, 'cp');
                break;
            case 'mv':
                if (!command[1] || !command[2]) {
                    this.invalidErrorOutput(dir, 'mv');
                    return null;
                }
                await this.moveFile(dir, command[1], command[2], true, 'mv');
                break;
            case 'hash':
                if (!command[1]) {
                    this.invalidErrorOutput(dir, 'hash');
                    return null;
                }
                await this.getFileHash(dir, command[1], true, 'hash');
                break;
            case 'compress':
                if (!command[1] || !command[2]) {
                    this.invalidErrorOutput(dir, 'compress');
                    return null;
                }
                await this.compressFile(dir, command[1], command[2], true, 'compress');
                break;
            case 'decompress':
                if (!command[1] || !command[2]) {
                    this.invalidErrorOutput(dir, 'decompress');
                    return null;
                }
                await this.decompressFile(dir, command[1], command[2], true, 'decompress');
                break;
            default:
                break;
        }
    }
}

export const fsProcessor = new FSProcessor();
