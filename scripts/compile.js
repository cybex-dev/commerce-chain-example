const _path = require('path');
const _fs = require('fs');
const _solc = require('solc');

let contractSourcesDir = "contracts";
let contractBuildDir = "build";

const contractSourcesFolder = _path.resolve( contractSourcesDir);
const buildPath = _path.resolve(contractBuildDir);
const createBuildFolder = () => {
    if (!_fs.existsSync(buildPath)) {
        console.log("Creating Build Directory: " + contractBuildDir);
        _fs.mkdirSync(buildPath);
    }
};

const buildSource = () => {
    const sources = {};
    const contractFiles = _fs.readdirSync(contractSourcesFolder);
    contractFiles.forEach(value => {
        const contractFullPath = _path.resolve(contractSourcesFolder, value);
        sources[value] = {
            content: _fs.readFileSync(contractFullPath, 'utf8')
        };
    });

    return sources;
};

const input = {
    language: 'Solidity',
    sources: buildSource(),
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        }
    }
};

const compileContracts = () => {
    console.log("Compiling Contracts");
    const compiledContracts = JSON.parse(_solc.compile(JSON.stringify(input))).contracts;

    for (let contract in compiledContracts) {
        if (!compiledContracts.hasOwnProperty(contract)) {
            console.error("hasOwnProperty Failed");
            return;
        }
        for (let contractName in compiledContracts[contract]) {
            if (!compiledContracts[contract].hasOwnProperty(contractName)) {
                console.error("hasOwnProperty Failed");
                return;
            }

            const contractFile = _path.resolve(buildPath + "/" + contractName + '.json');
            if (_fs.existsSync(contractFile)) {
                console.log("Removing " + buildPath + "/" + contractName + ".json");
                _fs.unlink(contractFile, err => {
                    if (err){
                        console.error(err);
                    }

                    console.log("Creating contract: " + contractFile);
                    _fs.writeFileSync(
                        contractFile,
                        JSON.stringify(compiledContracts[contract][contractName])
                    );
                });
            } else  {
                console.log("Creating contract: " + contractFile);
                _fs.writeFileSync(
                    contractFile,
                    JSON.stringify(compiledContracts[contract][contractName])
                );
            }
        }
    }
};

const compileContract = () => {
    console.log('Compiling Contracts from Sources');
    createBuildFolder();
    compileContracts();
};

module.exports = {
  compileContract
};