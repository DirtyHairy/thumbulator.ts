#!/usr/bin/env node

const shell = require('shelljs');
const { join } = require('path');

shell.config.verbose = true;

const local = name => join(__dirname, '..', 'node_modules', '.bin', name),
    root = join(__dirname, '..');
buildDir = join(root, 'build_test');

shell.rm('-fr', buildDir);
shell.exec(
    `${local('tslint')} -c ${join(root, 'tslint.json')} -p ${join(
        root,
        'tsconfig.test.json'
    )} 'src/**/*.ts test/**/*.ts'`
);
shell.exec(`${local('tsc')} -p "${join(root, 'tsconfig.test.json')}"`);
shell.mkdir(join(buildDir, 'src', 'native'));
shell.cp(join(root, 'native', 'thumbulator.js'), join(buildDir, 'src', 'native'));
