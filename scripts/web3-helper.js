const _config = require("../app_config");
const _Web3 = require('web3');
const url = _config.provider.protocol + "://" + _config.provider.address + (_config.provider.port === "" ? "" : ":" + _config.provider.port) + (_config.provider.method === "" ? "" : _config.provider.method);
const provider = _config.provider.usesWebsocket === "true" ? new _Web3.providers.WebsocketProvider(url) : new _Web3.providers.HttpProvider(url);
const web3 = new _Web3(provider);

function getWeb3Instance(){
    return web3;
}

/**
 * Converts a float value to uint value
 * @param value float value
 * @returns {number}
 */
function floatToUint(value) {
    return Number(value) * 100;
}

/**
 * Converts a uint value to float
 * @param value uint value
 * @return {number}
 */
function UIntToFloat(value) {
    return Number(value) / 100;
}

/**
 * [Async] Checks if Web3 provider has an active connection. If not and web3 is accessed, many errors will occur
 * @param callback(bool) callback containing boolean status, true if connected
 */
function isConnected(callback) {
    web3.eth.net.isListening()
        .then(async value => {
            if (value) {
                callback(value);
            }
        }, reason => {
            if (reason) {
                callback(false);
            }
        });
}

/**
 * Obfuscate a value into a valid ethereum address
 * @param input
 * @returns {string}
 */
function obfuscatedAddress(input) {
    return web3.utils.toChecksumAddress(web3.utils.sha3(input).substr(2, 40))
}

/**
 * Converts a given input to hex form, is then converted to hex form. Integers, etc are treated as strings UTF8.
 * @param input input text/numbers
 * @returns {*} hex representation of input
 */
function utf8ToBytes32(input) {
    if (input.length >= 32) {
        throw "String to long. Must be equal to or shorter than 32 chars";
    }
    return web3.utils.utf8ToHex(input.toString());
}

/**
 * Returns true if the input value is already a hex value
 * @param input
 */
function isHex(input) {
    return web3.utils.isHexStrict(input);
}

/**
 * Returns true if the input value is an address
 * @param input
 */
function isAddress(input) {
    return web3.utils.isAddress(input);
}

/**
 * Converts a given hex UTF8 input to the corresponding readable text value
 * @param input hex input
 * @returns {*} text (UTF8)
 */
function bytes32ToUTF8(input) {
    return web3.utils.hexToUtf8(input);
}

/**
 * Function accepts 2 wei values and ensures that there is enough weu.
 * @param weiBalance current account balance
 * @param weiNeeded wei needed to perform action
 * @returns {boolean} true if the balance exceeds the amount needed, false if more wei is needed than the balance has
 */
function hasEnoughFunds(weiBalance, weiNeeded) {
    if (weiNeeded === 'infinite') {
        return true;
    }
    return (Number(weiBalance) > Number(weiNeeded));
}

/**
 * Converts wei to ether value
 * @param weiValue wei value
 * @returns {*}
 */
function weiToEther(weiValue) {
    return web3.utils.fromWei(weiValue.toString(), 'ether');
}

/**
 * Converts ehter to wei value
 * @param ether ether value
 * @returns {*}
 */
function etherToWei( ether) {
    return web3.utils.toWei(ether, 'ether');
}

module.exports = {
    getWeb3Instance,
    isConnected,
    hasEnoughFunds,
    bytes32ToUTF8,
    utf8ToBytes32,
    weiToEther,
    UIntToFloat,
    floatToUint,
    etherToWei,
    isHex,
    isAddress,
    obfuscatedAddress
};
