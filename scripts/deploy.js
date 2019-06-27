const _io = require('./fileio');
const _app_config = '../app_config';
const _config = require(_app_config);
const _web3helper = require('./web3-helper');
const _account = require('./accounts');
const _transfer = require('./transfer');
const web3 = _web3helper.getWeb3Instance();
let jsonContract = null;

/**
 * Loads the compiled contract into the jsonContract field. During compile time, this may not be available, thus having a separate loading method.
 * @param contractName name of contract
 */
function requireCompiledContract(contractName) {
    jsonContract = require('../build/' + contractName);
}

/**
 * Loads the Smart Contract ABI into the Web3 contract data structure and returns the contract
 * @returns {web3.eth.Contract}
 */
function getContractWithABI() {
    if (jsonContract === null) {
        console.error("Cannot get ABI from JSON contract");
        return;
    }

    return new web3.eth.Contract(jsonContract.abi);
}

/**
 * Gets the contract at a specific address. This assumes the contract exists at the address.
 * @param abi json abi of contract
 * @param address address of contract
 * @param gasLimit gas used to deploy contract
 * @param byteCode bytecode of contract
 * @param callback(contract) optional callback containing the contract from the address
 */
function getContractAtAddress(abi, address, gasLimit, byteCode, callback) {
    let contract = new web3.eth.Contract(abi, address, {
        data: '0x' + byteCode,
        gas: gasLimit
    });
    if (callback) {
        callback(contract);
    }

    return contract;
}

/**
 * [Async] Check if contract exists at an address on the current provider blockchain
 * @param address address of contract
 * @param callback(bool) callback with true if contract exists
 */
function exists(address, callback) {
    web3.eth.getCode(address, (error, value) => {
        if (error) {
            console.error("Error checking if contract exists: \n" + error);
            callback(false);
        }

        // contract does not exist if code == '0x'
        callback(value !== "0x");
    });
}

/**
 * [Async] Deploy contract to blockchain if web3 is connected. We also unlock the wallet and check if there is enough funds to deploy contract.
 * @param walletAddress address of wallet to unlock the account
 * @param password password of account (for accessing funds in account to deploy account)
 * @param contractName name of contract
 * @param gasLimit gas used to deploy contract
 * @param byteCode bytecode of contract
 * @param callback(contract) callback called after contract deployed, returning the new contract as parameter
 */
function deployContract(walletAddress, password, contractName, gasLimit, byteCode, callback) {
    _web3helper.isConnected((connected) => {
        if (connected) {
            _account.unlockAccount(walletAddress, password, (unlocked) => {
                if (!unlocked) {
                    throw "Invalid Password or Account not found";
                }
                _account.getBalance(walletAddress, (balance) => {
                    if (!_web3helper.hasEnoughFunds(balance, gasLimit)) {
                        console.error("Insufficient funds to perform transaction, attempting transfer from top-up account");
                        if (_transfer.canTopUp()) {
                            _account.getBalance(_config.topUp.address, (amount) => {
                                const etherBalance = Number(_web3helper.weiToEther(amount));
                                if (_web3helper.hasEnoughFunds(etherBalance, Number(_config.topUp.amount))) {
                                    _transfer.topUp((success) => {
                                        if (!success) {
                                            console.error("Unable to perform top-up on wallet address.");
                                            return;
                                        }

                                        // continue to deploy contract
                                        _deployContract(contractName, walletAddress, gasLimit, byteCode, (contract) => {
                                            // before continuing, we need to lock the account again. This does not need to occur immediately, but we have to do it
                                            _account.lockAccount(walletAddress);

                                            // continue with callback
                                            callback(contract);
                                        });
                                    })
                                } else {
                                    console.error("Insufficient funds in top-up account.");
                                }
                            });
                        } else {
                            console.error("Is top-up enabled or is a wallet or wallet password defined?");
                        }
                    } else {

                        // continue to deploy contract
                        _deployContract(contractName, walletAddress, gasLimit, byteCode, (contract) => {
                            // before continuing, we need to lock the account again. This does not need to occur immediately, but we have to do it
                            _account.lockAccount(walletAddress);

                            // continue with callback
                            callback(contract);
                        });
                    }
                });
            })
        } else {
            console.error("Unable to deploy contract, web3 not connected");
        }
    });
}

/**
 * [Async] Deploys contract to blockchain
 * Assumes the calling contract has balance enough and is unlocked.
 * @param contractName name of contract to deploy
 * @param fromAddress wallet address which is owner of contract
 * @param gasLimit gas used to deploy contract
 * @param byteCode bytecode of contract
 * @param callback(contract) callback called after contract deployed, returning the new contract as parameter
 * @private
 */
function _deployContract(contractName, fromAddress, gasLimit, byteCode, callback) {
    requireCompiledContract(contractName);
    // get contract
    let contract = getContractWithABI();

    // deploy contract
    contract.deploy({
        data: '0x' + byteCode
    }).send({
        from: fromAddress,
        gas: gasLimit
    }).on('error', (error) => {
        if (error) {
            console.error(error)
        }
    }).on('transactionHash', (transactionHash) => {
        if (transactionHash) {
            console.log("Contract deployment completed [" + transactionHash + "]")
        }
    }).then(_newContract => {
        if (_newContract) {
            _config.contract.deployAddress = _newContract._address;
            _io.saveJSonSync(require('path').resolve(__dirname, _app_config), _config, true);
            callback(_newContract);
        }
    }, reason => {
        if (reason) {
            console.error(reason);
        }
    });
}

module.exports = {
    jsonContract,
    deployContract,
    exists,
    getContractAtAddress
};