#!/usr/bin/env node

const shell = require('shelljs');
const { join } = require('path');

shell.config.verbose = true;

const local = name => join(__dirname, '..', 'node_modules', '.bin', name),
    root = join(__dirname, '..');
buildDir = join(root, 'lib');

shell.rm('-fr', buildDir);
shell.exec(
    `${local('tslint')} -c ${join(root, 'tslint.json')} -p ${join(root, 'tsconfig.json')} 'src/**/*.ts test/**/*.ts'`
);
shell.exec(local('tsc'));
shell.mkdir(join(buildDir, 'native'));
shell.cp(join(root, 'native', 'thumbulator.js'), join(buildDir, 'native'));
