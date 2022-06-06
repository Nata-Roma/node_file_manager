import os from 'os';
import { DefaultProcessor } from './defaultProcessor.js';

export class OSProcessor extends DefaultProcessor {
    getHomeDir() {
        return os.homedir();
    }

    homeDir() {
        console.log('Home directory: ', this.getHomeDir());
    }

    username() {
        const user = os.userInfo();
        console.log('User name: ', user.username);
    }

    eol() {
        console.log('End-Of-Line: ', os.EOL.replace('\r', '\\r').replace('\n', '\\n'));
    }

    cpus() {
        const cpus = os.cpus();
        const arr = cpus.map((cpu) => ({
            model: cpu.model,
            'clock rate': `${cpu.speed / 1000}GHz`,
        }));
        console.log('Overall amount of CPUS: ', cpus.length);
        for (const cpu of arr) {
            console.log(cpu);
        }
    }

    architecture() {
        console.log('CPU architecture: ', os.arch());
    }

    output(key, currentPath) {
        switch (key) {
            case '--homedir': {
                this.homeDir();
                break;
            }
            case '--username': {
                this.username();
                break;
            }
            case '--EOL': {
                this.eol();
                break;
            }
            case '--cpus': {
                this.cpus();
                break;
            }
            case '--architecture': {
                this.architecture();
                break;
            }

            default:
                this.invalidErrorOutput(currentPath, 'os');
                return;
        }
        this.standartOutput(currentPath);
    }
}
