import { ErrorHandler } from './errorHandler.js';

export class DefaultProcessor extends ErrorHandler {
    askForEnter() {
        console.log(`Please enter a command. Type "exit" to quit \n`);
    }

    printCurrentPath(path) {
        console.log(`You are currently in ${path}`);
    }

    showCommandLine(path) {
        process.stdout.write(`CLI ${path}> `);
    }

    standartOutput(currentDir) {
        //this.printCurrentPath(currentDir);
        console.log('\n');
        //this.askForEnter();
        this.showCommandLine(currentDir);
    }

    invalidErrorOutput(currentDir, command = '') {
        this.invalidInput(command);
        //this.askForEnter();
        this.showCommandLine(currentDir);
    }

    failedErrorOutput(currentDir) {
        this.operationFailed();
        //this.askForEnter();
        this.showCommandLine(currentDir);
    }
}
