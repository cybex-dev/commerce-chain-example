const _config = require('../app_config');
const _web3helper = require('./web3-helper');
const _accounts = require('./accounts');
const web3 = _web3helper.getWeb3Instance();

/**
 * Transfer a ether amount from one wallet to another wallet. When completed, a callback is called with a boolean indicating the transfer has completed.
 * @param fromAddress source of funds
 * @param password password of sending wallet/address
 * @param toAddress receiver wallet of funds
 * @param ether ether amount
 * @param callback(bool) callback when transfer has completed with bool parameter true indicating the transfer has completed successfully, else false if incomplete.
 */
function transfer(ether, fromAddress, password, toAddress, callback) {
    // Check if we are connected
    _web3helper.isConnected((connected) => {
            if (!connected) {
                // Show appropriate message
                console.error("Not connected to Web3 provider");
                return;
            }

            // Check if the account is unlocked
            _accounts.unlockAccount(fromAddress, password, (unlocked) => {
                if (!unlocked) {
                    // Show appropriate message
                    console.error("Could not unlock account");
                    return;
                }

                web3.eth.sendTransaction({
                    from: fromAddress,
                    to: toAddress,
                    value: _web3helper.etherToWei(ether.toString())
                }).on('error', (error) => {
                    if (error) {
                        console.error(error)
                    }
                }).on('transactionHash', (transactionHash) => {
                    if (transactionHash) {
                        console.log("Transfer completed [" + transactionHash + "]")
                    }
                }).then(_newContract => {
                    if (_newContract) {
                        callback(_newContract);
                    }
                }, reason => {
                    if (reason) {
                        console.error(reason);
                    }
                });
            });
        }
    );
}

/**
 * Checks if auto top-up of funds is enabled. Ensures top-up wallet, password and top-up field is valid.
 * @returns {boolean} true if auto top can be completed.
 */
function canTopUp() {
    return (_config.topUp.address !== '' && _config.topUp.enable === 'true');
}

/**
 *
 * @param callback(bool) callback with bool parameter indicating true if the top-up operation completed successfully, false if not. Callback is fired when top-up operation completed successfully.
 */
function topUp(callback) {
    transfer(_config.topUp.amount, _config.topUp.address, _config.topUp.password, _config.wallet.address, callback);
}

module.exports = {
    canTopUp,
    topUp,
    transfer
};