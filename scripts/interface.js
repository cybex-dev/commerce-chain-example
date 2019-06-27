const _config = require("../app_config");
const _deploy = require("./deploy");
const _accounts = require("./accounts");
const _compile = require("./compile");
const _contract = require("./contract");
const _web3Helper = require('./web3-helper');

const EventType = {
    eventNewTransaction: "onNewTransaction",
    eventUpdatedTransaction: "onUpdatedTransaction",
    eventNewPurchase: "onNewPurchase",
    eventUpdatedPurchase: "onUpdatedPurchase",
    eventNewProduct: "onNewProduct",
    eventUpdatedProduct: "onUpdatedProduct",
    eventNewCategory: "onNewCategory",
    eventUpdatedCategory: "onUpdatedCategory",
    eventNewSupplier: "onNewSupplier",
    eventUpdatedSupplier: "onUpdatedSupplier",
    eventTransactionStatusUpdate: "onTransactionStatusUpdate",
    eventTransactionRefunded: "onTransactionRefunded",
    eventPurchaseReturned: "onPurchaseReturned"
};

/**
 * Compiles all contracts in the contracts folder to .json contracts stored in build folder
 */
function compileContract() {
    _compile.compileContract();
}

/**
 * Loads the wallet stored in the application config file. If no private key is found, then a new account is created. If a password is found, then the user will not be polled for a password, else the user will be required to enter a password.
 * Else, if the wallet address if already found on the blockchain, then the callback method is initiated.
 * @param callback(contract) callback method which is run after the wallet has been loaded accepting a contract as a parameter
 */
function loadWallet(callback) {
    if (_config.secret.private_key === "") {
        if (_config.secret.password === "") {
            _accounts.createNewAccount(() => {
                importAccount(callback);
            });
        } else {
            _accounts.createAccountSync(true, _config.secret.password, () => {
                importAccount(callback);
            });
        }
    } else {
        _accounts.exists(_config.wallet.address, (exists) => {
            if (!exists) {
                if (_config.secret.password === "") {
                    _accounts.createNewAccount(() => {
                        importAccount(callback);
                    });
                } else {
                    importAccount(callback);
                }
            } else {
                callback();
            }
        });
    }
}

/**
 * Imports an account into the blockchain and fires the callback method when completed
 * @param callback callback method
 */
function importAccount(callback) {
    _accounts.importAccount(_config.secret.private_key, _config.secret.password, callback);
}

/**
 * Wrapper for deploying a contract. Initially we check if the contract deployAddress is empty. If so then we deploy a new contract, else we check if a contract already exists in the blockchain via its deploy address. If the contract exists, then we get the contract at the address, else we create a new contract.
 * @param callback(contract) callback should accept a parameter for the contract that will be deployed or retrieved from the blockchain
 */
function getContract(callback) {
    let jsonContract = require('../build/' + _config.contract.contractName);
    if (_config.contract.deployAddress === "") {
        //deploy new contract
        _deploy.deployContract(_config.wallet.address, _config.secret.password, _config.contract.contractName, _config.contract.deployGas, jsonContract.evm.bytecode.object, callback);
    } else {
        _deploy.exists(_config.contract.deployAddress, (exists) => {
            if (exists) {
                // getContractAdAddress
                _deploy.getContractAtAddress(jsonContract.abi, _config.contract.deployAddress, _config.contract.deployGas, jsonContract.evm.bytecode.object, callback);
            } else {
                // deploy new contract
                _deploy.deployContract(_config.wallet.address, _config.secret.password, _config.contract.contractName, _config.contract.deployGas, jsonContract.evm.bytecode.object, callback);
            }
        });
    }
}

/**
 * A method reference for Contract.js eventSubscriber(EventType, Callback)
 * Method subscribes a callback to a corresponding EventType
 * @type {eventSubscriber}
 */
const subscribeToEvent = _contract.eventSubscriber;

/**
 * A method reference for Contract.js eventUnsubscriber(EventType)
 * Method unsubscribes the event listener for the EventType
 * @type {eventSubscriber}
 */
const unsubscribeFromEvent = _contract.eventUnsubscriber;

/**
 * Initialize the setup and instantiation of the blockchain contract and related functions.
 * <ul>
 *     <li>Compiles the latest version of the contract</li>
 *     <li>loads the corresponding account found  in 'app_config.json'</li>
 *     <li>Attempts to find a contract on the blockchain at the contract deploy address, else deploys a new contract</li>
 * </ul>
 *
 * @param callback(contract) the callback serves as the entrance point for the application logic. Until this point is reached, the blockchain cannot perform any tasks. The callback recieves as a parameter the contract containing methods, etc of the compiled and deployed contract. A reference to this contract is kept in the '_contract' (contract.js) constant,
 */
function init(callback) {
    // Compile the latest contract(s) in the contracts folder
    compileContract();

    // First check if we are connected
    _web3Helper.isConnected((connected) => {
        if (connected) {
            // load account/wallet from the config file
            loadWallet(() => {

                // once account is loaded, we try and get a contract (via deploying a new one or getting an existing one from the blockchain)
                getContract((contract) => {

                    console.log("Contract is at address [" + contract._address + "]");
                    // once the contract has been instantiated, we save a copy to the _contract object for use when calling contract functions
                    _contract.setContract(contract);
                    // we also pass the contract to the callback for any further processing
                    callback(contract);
                });
            });
        } else {
            throw "No connection to Web3 Provider";
        }
    });
}

/**
 * Is the interface to call contract functions from.
 * @returns {{setTransaction, addSupplier, addProduct, updateSupplierMemberType, updateSupplierName, addCategory, returnedPurchase, updateSupplierFacebook, getPurchasesIndex, setContract, getProductsIndex, addPurchase, setCategory, updateSupplierMobile, addTransaction, getTransaction, getSuppliersIndex, setSupplier, setProduct, getProduct, getCategoryIndex, getCategory, updateSupplierTwitter, updateSupplierCKNumber, refundTransaction, eventUnsubscriber, eventSubscriber, getPurchase, getSupplier, updateSupplierTelephone, setPurchase, updateSupplierSlogan, getTransactionIndex, updateTransactionStatus, setEnableSupplierViewAllTransactions, updateSupplierInstagram}|*}
 */
function getContractInterface(){
    return _contract;
}

module.exports = {
    init,
    EventType,
    compileContract,
    subscribeToEvent,
    unsubscribeFromEvent,
    getContractInterface
};