import { MainProcessor } from './mainProcessor.js';

const main = new MainProcessor();

process.stdin.on('data', async (data) => {
    const input = data.toString('utf8').trim();
    const command = input.split(' ');

    command[0] == '.exit' ? main.goodbye() : await main.onInput(data);
});

process.on('exit', () => {
    console.log('The program is finished. The end.\n');
});

process.on('SIGINT', function () {
    main.goodbye();
});
