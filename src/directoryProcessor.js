import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { DefaultProcessor } from './defaultProcessor.js';

export class DirectoryProcessor extends DefaultProcessor {
    capitalFirstLetter(word) {
        return word ? word[0].toUpperCase() + word.slice(1) : '';
    }

    directoryLevelUp(dir) {
        const root = this.getRootDir();
        if (dir === root) {
            console.log('You are in a root dir');
            this.standartOutput(dir);
            return root;
        }

        const newPath = path.join(dir, '..');
        this.standartOutput(newPath);
        return newPath;
    }

    async checkDirExistance(dir) {
        try {
            const stat = await fsPromises.stat(dir);
            return !stat.isDirectory();
        } catch {
            return true;
        }
    }

    async getDirResult(currentDir, newDir, cb = false, command = '') {
        const dirErr = await this.checkDirExistance(newDir);

        if (dirErr) {
            this.invalidErrorOutput(currentDir, command);
            return {
                dir: currentDir,
                error: true,
            };
        } else {
            cb ? this.standartOutput(newDir) : null;
            return {
                dir: newDir,
                error: false,
            };
        }
    }

    getUpperDir(currentPath, newPath) {
        const splitted = newPath.split('/');
        if (splitted[0] == '..') {
            currentPath = path.join(currentPath, '..');
            return this.getUpperDir(currentPath, splitted.slice(1).join('/'));
        } else {
            for (let i = 0; i < splitted.length; i++) {
                currentPath = path.join(currentPath, this.capitalFirstLetter(splitted[i]));
            }

            return currentPath;
        }
    }

    async changeDirectory(currentDir, requestedPath, cb = false, command = '') {
        const splitted = requestedPath.split('/');
        if (splitted[0] == '.') {
            let newPath = currentDir;
            for (let i = 1; i < splitted.length; i++) {
                newPath = path.join(newPath, this.capitalFirstLetter(splitted[i]));
            }
            return await this.getDirResult(currentDir, newPath, cb, command);
        }
        if (splitted[0] == '..') {
            return await this.getDirResult(
                currentDir,
                this.getUpperDir(currentDir, requestedPath),
                cb,
                command,
            );
        }
        if (splitted[0].match(/^[A-Za-z]:$/)) {
            return await this.getDirResult(currentDir, requestedPath, cb, command);
        }

        let newPath = currentDir;
        for (let i = 0; i < splitted.length; i++) {
            newPath = path.join(newPath, this.capitalFirstLetter(splitted[i]));
        }
        return await this.getDirResult(currentDir, newPath, cb, command);
    }

    getRootDir() {
        return path.parse(process.cwd()).root;
    }

    async dirList(dir) {
        try {
            const files = await fsPromises.readdir(dir);
            for (const file of files) console.log(file);
            this.standartOutput(dir);
        } catch (err) {
            this.failedErrorOutput(dir)
        }
    }
}
