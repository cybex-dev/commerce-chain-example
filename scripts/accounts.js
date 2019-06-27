const _app_config = "../app_config";
const _config = require('../app_config');
const _input = require('./input');
const _io = require('./fileio');
const _web3Helper = require('./web3-helper');
const web3 = _web3Helper.getWeb3Instance();

/**
 * [Async] Create a new account/wallet address
 * @param callback() callback after the new account is created
 */
function createNewAccount(callback) {
    _input.getPassword("Enter Password for Wallet: ", "Confirm Password: ", (valid, password) => {
        createAccountSync(valid, password, callback);
    });
}

/**
 * Creates a private key for a new account/wallet using the password provided. This account should still be imported onto the blockchain after it has been created
 * @param validPassword is a valid password
 * @param password password
 * @param callback() callback is optional
 * @private
 */
function createAccountSync(validPassword, password, callback) {
    if (!validPassword) {
        throw "Invalid password";
    }

    let account = web3.eth.accounts.create(password);
    _config.secret.private_key = account.privateKey.substring(2);
    _config.secret.password = password;
    _config.wallet.address = account.address;
    _io.saveJSonSync(require('path').resolve(__dirname, _app_config), _config, true);

    if (callback) {
        callback();
    }
}

/**
 * [Async] checking if an account/wallet exists on the provider
 * @param accountAddress account/wallet public address
 * @param callback(bool) callback accepting a boolean indicating the account existence, true if it exists;
 */
function exists(accountAddress, callback) {
    web3.eth.getAccounts((error, accounts) => {

        if (error) {
            console.error(error);
            callback(false);
            return;
        }

        if (accounts.length === 0) {
            console.log("No accounts on blockchain");
            callback(false);
            return;
        }

        let found = false;
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].toLowerCase() === accountAddress.toLowerCase()) {
                found = true;
                break;
            }
        }

        callback(found);
    });
}

/**
 * [Async] Import account into Web3 provider (import into blockchain)
 * @param password password of account/wallet
 * @param privateKey private key of account/wallet
 * @param callback() callback after account/wallet has been imported
 */
function importAccount(privateKey, password, callback) {
    web3.eth.personal.importRawKey('0x' + privateKey, password)
        .then(value => {
            _config.wallet.address = value;
            _io.saveJSonSync(require('path').resolve(__dirname, _app_config), _config, true);
            callback();
        }, reason => {
            console.error("Import Wallet rejected reason: \n" + reason);
        });
}

/**
 * [Async] Get balance of wallet
 * @param account wallet address
 * @param callback(weiBalance) taking in the wei balance of the wallet
 */
const getBalance = (account, callback) => {
    web3.eth.getBalance(account)
        .then(value => {
                if (value) {
                    callback(value);
                }
            }, reason => {
                if (reason) {
                    console.error(reason);
                }
            }
        );
};

/**
 * Unlocks a wallet to call transactions on this account
 * @param walletAddress address of wallet
 * @param password password of wallet
 * @param callback(bool) callback with parameter true if account is unlocked, or false if still locked;
 */
function unlockAccount(walletAddress, password, callback){
    web3.eth.personal.unlockAccount(walletAddress, password, _config.wallet.unlockDuration)
        .then(value => {
            if (value){
                callback(true);
            }
        }, reason => {
            if (reason) {
                console.error(reason);
                callback(false);
            }
        });
}

/**
 * Locks a wallet to prevent any furthers transactions on this account
 * @param walletAddress address of wallet
 * @param callback callback to perform an action when wallet is locked
 */
function lockAccount(walletAddress, callback){
    web3.eth.personal.lockAccount(walletAddress)
        .then(value => {
            if (value){
                if (callback)
                    callback();
            }
        }, reason => {
            if (reason) {
                console.error("Unable to lock wallet!\n" + reason);
            }
        });
}

module.exports = {
    unlockAccount,
    lockAccount,
    getBalance,
    exists,
    createNewAccount,
    createAccountSync,
    importAccount
};