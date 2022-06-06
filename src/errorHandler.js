const comandHelp = [
    {
        name: 'os',
        payload: '<os> <--homedir>',
    },
    {
        name: 'cd',
        payload: '<cd> <path_to_directory>',
    },
    {
        name: 'cat',
        payload: '<cat> <path_to_file>',
    },
    {
        name: 'add',
        payload: '<add> <new_filename>',
    },
    {
        name: 'rn',
        payload: '<rn> <path_to_file> <new_filename>',
    },
    {
        name: 'cp',
        payload: '<cp> <path_to_file> <new_filename>',
    },
    {
        name: 'mv',
        payload: '<mv> <path_to_file> <path_to_new_file_directory>',
    },
    {
        name: 'rm',
        payload: '<rm> <path_to_file>',
    },
    {
        name: 'hash',
        payload: '<hash> <path_to_file>',
    },
    {
        name: 'compress',
        payload: '<compress> <path_to_file> <path_to_destination>',
    },
    {
        name: 'decompress',
        payload: '<decompress> <path_to_file> <path_to_destination>',
    },
];

export class ErrorHandler {
    invalidInput(command) {
        const found = comandHelp.find((comm) => comm.name === command);
        console.log('\nError: Invalid input');
        found ? console.log(`${found.payload}\n`) : console.log(`\n`);
    }

    operationFailed() {
        console.log('\nError: Operation failed\n');
    }
}
