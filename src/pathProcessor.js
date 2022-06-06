import * as path from 'path';
import { DirectoryProcessor } from './directoryProcessor.js';

export class PathProcessor extends DirectoryProcessor {
    async getFileNameToPath(currentDir, filePath, command) {
        const filePathSplitted = filePath.split('/');
        let fileDir = null;
        let newFilePath = '';
        if (filePathSplitted[0] == '.' && filePathSplitted.length == 2) {
            newFilePath = path.join(currentDir, filePathSplitted[1]);
        } else {
            fileDir = await this.changeDirectory(
                currentDir,
                filePathSplitted.slice(0, -1).join('/'),
                false,
                command,
            );
            if (!fileDir.error) {
                newFilePath = path.join(fileDir.dir, filePathSplitted[filePathSplitted.length - 1]);
            } else return null;
        }
        return {
            filePath: newFilePath,
            fileDir: fileDir,
            fileName: filePathSplitted[filePathSplitted.length - 1],
        };
    }

    async getPathNameToPath(currentDir, filePath, command) {
        const filePathSplitted = filePath.split('/');
        let fileDir = null;
        let newFilePath = '';
        if (filePathSplitted[0] == '.' && filePathSplitted.length == 2) {
            fileDir = path.join(currentDir, filePathSplitted[1]);
        } else {
            fileDir = await this.changeDirectory(
                currentDir,
                filePath,
                false,
                command,
            );
            if (fileDir.error) return null;
        }
        return {
            filePath: newFilePath,
            fileDir: fileDir,
            fileName: filePathSplitted[filePathSplitted.length - 1],
        };
    }
}
