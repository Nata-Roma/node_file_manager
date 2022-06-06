import { DefaultProcessor } from './defaultProcessor.js';
import { FSProcessor } from './fsProcessor.js';
import { OSProcessor } from './osProcessor.js';

export class MainProcessor extends DefaultProcessor {
    constructor() {
        super();
        this.fsProcessor = new FSProcessor();
        this.osProcessor = new OSProcessor();
        this.currentDir = this.osProcessor.getHomeDir();
        this.user = '';
        this.welcome();
    }

    welcome() {
        const args = process.argv;
        this.user = args[2] ? args[2].split('=')[1] : 'Username';
        console.log(`Welcome to the File Manager, ${this.user}!\n`);
        this.showCommandLine(this.currentDir);
    }

    goodbye() {
        console.log(`\n\nThank you for using File Manager, ${this.user}!`);
        process.exit();
    }

    async onInput(data) {
        const input = data.toString('utf8').trim();
        const command = input.split(' ');

        switch (command[0]) {
            case 'os':
                this.osProcessor.output(command[1], this.currentDir);
                break;
            case 'ls':
                await this.fsProcessor.output(input, this.currentDir, this.standartOutput);
                break;
            case 'up':
                this.currentDir = await this.fsProcessor.output(
                    input,
                    this.currentDir,
                    this.standartOutput,
                );
                break;
            case 'cd':
                const dir = await this.fsProcessor.output(
                    input,
                    this.currentDir,
                    this.standartOutput,
                );
                this.currentDir = dir?.dir;
                break;
            case 'cat':
            case 'add':
            case 'rn':
            case 'rm':
            case 'cp':
            case 'mv':
            case 'hash':
            case 'compress':
            case 'decompress':
                await this.fsProcessor.output(input, this.currentDir, this.standartOutput);
                break;
            default:
                this.invalidErrorOutput(this.currentDir);
                break;
        }
    }
}
