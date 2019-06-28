const config = require('../app_config');
const _accounts = require("./accounts");
const _web3Helper = require('./web3-helper');
const _ = require('lodash');

const subscribedEvents = {};
let contract = null;

/**
 * Retrieve all transaction from objects stored on the blockchain
 * @param callback(array) array of transaction stored on the blockchain
 */
function getAllTransactions(callback) {
    getTransactionIndex((array) => {
        const items = [];
        for (let i = 0; i < array.length; i++) {
            const arrayKey = array[i];
            getTransaction(arrayKey, (transaction) => {
                items.push(transaction);
                if (array.length === items.length) {
                    callback(items);
                }
            });
        }
        if (array.length === 0) {
            callback(array);
        }
    });
}

/**
 * Retrieve all purchases from objects stored on the blockchain
 * @param transactionId transactionId to query
 * @param callback(array) array of purchases stored on the blockchain
 */
function getAllPurchases(transactionId, callback) {
    getPurchasesIndex(transactionId, (array) => {
        const items = [];
        for (let i = 0; i < array.length; i++) {
            const arrayKey = array[i];
            getPurchase(transactionId, arrayKey, (transaction) => {
                items.push(transaction);
                if (array.length === items.length) {
                    callback(items);
                }
            });
        }
        if (array.length === 0) {
            callback(array);
        }
    });
}

/**
 * Retrieve all products from objects stored on the blockchain
 * @param callback(array) array of products stored on the blockchain
 */
function getAllProducts(callback) {
    getProductIndex((array) => {
        const items = [];
        for (let i = 0; i < array.length; i++) {
            const arrayKey = array[i];
            getProduct(arrayKey, (product) => {
                items.push(product);
                if (array.length === items.length) {
                    callback(items);
                }
            });
        }
        if (array.length === 0) {
            callback(array);
        }
    });
}

/**
 * Retrieve all supplier from objects stored on the blockchain
 * @param callback(array) array of supplier stored on the blockchain
 */
function getAllSuppliers(callback) {
    getSuppliersIndex((array) => {
        const items = [];
        for (let i = 0; i < array.length; i++) {
            const arrayKey = array[i];
            getSupplier(arrayKey, (supplier) => {
                items.push(supplier);
                if (array.length === items.length) {
                    callback(items);
                }
            });
        }
        if (array.length === 0) {
            callback(array);
        }
    });
}

/**
 * Retrieve all category from objects stored on the blockchain
 * @param callback(array) array of categories stored on the blockchain
 */
function getAllCategories(callback) {
    getCategoryIndex((array) => {
        const items = [];
        for (let i = 0; i < array.length; i++) {
            const arrayKey = array[i];
            getCategory(arrayKey, (category) => {
                items.push(category);
                if (array.length === items.length) {
                    callback(items);
                }
            });
        }
        if (array.length === 0) {
            callback(array);
        }
    });
}

/**
 * Checks if a with the specified ID exists, returning true if it exists
 * @param id id to check if it exists
 * @param callback(bool) callback invoked with boolean, true indicating the entry with id exists
 */
function checkTransactionExists(id, callback) {
    getTransactionIndex((array) => {
        callback(array.filter(x => x === id).length === 1);
    });
}

/**
 * Checks if a with the specified ID exists, returning true if it exists
 * @param transactionId transaction ID of purchase
 * @param id id to check if it exists
 * @param callback(bool) callback invoked with boolean, true indicating the entry with id exists
 */
function checkPurchaseExists(transactionId, id, callback) {
    getPurchasesIndex(transactionId, (array) => {
        callback(array.filter(x => x === id).length === 1);
    });
}

/**
 * Checks if a with the specified ID exists, returning true if it exists
 * @param id id to check if it exists
 * @param callback(bool) callback invoked with boolean, true indicating the entry with id exists
 */
function checkProductExists(id, callback) {
    getProductIndex((array) => {
        callback(array.filter(x => x === id).length === 1);
    });
}

/**
 * Checks if a with the specified ID exists, returning true if it exists
 * @param id id to check if it exists
 * @param callback(bool) callback invoked with boolean, true indicating the entry with id exists
 */
function checkSupplierExists(id, callback) {
    getSuppliersIndex((array) => {
        callback(array.filter(x => x === id).length === 1);
    });
}

/**
 * Checks if a with the specified ID exists, returning true if it exists
 * @param id id to check if it exists
 * @param callback(bool) callback invoked with boolean, true indicating the entry with id exists
 */
function checkCategoryExists(id, callback) {
    getCategoryIndex((array) => {
        callback(array.filter(x => x === id).length === 1);
    });
}

/**
 * Gets an array of all indexes or IDs of a specific transaction stored in the blockchain
 * @param transactionId transaction to query purchases
 * @param callback(array) callback accepting an array of id's
 */
function getPurchasesIndex(transactionId, callback) {
    _getPurchasesAtIndex(transactionId, (array) => {
        callback(array);
    });
}

/**
 * Gets an array of all indexes or IDs of transactions stored in the blockchain
 * @param callback(array) callback accepting an array of id's
 */
function getTransactionIndex(callback) {
    getTransactionLength((length) => {
        const array = [];
        for (let i = 0; i < length; i++) {
            _getTransactionAtIndex(i, (id) => {
                array.push(id);

                if (array.length === Number(length)) {
                    callback(array);
                }
            });
        }
        if (length === "0"){
            callback([]);
        }
    });
}

/**
 * Gets an array of all indexes or IDs of products stored in the blockchain
 * @param callback(array) callback accepting an array of id's
 */
function getProductIndex(callback) {
    getProductsLength((length) => {
        const array = [];
        for (let i = 0; i < length; i++) {
            _getProductAtIndex(i, (id) => {
                array.push(id);

                if (array.length === Number(length)) {
                    callback(array);
                }
            });
        }
        if (length === "0"){
            callback([]);
        }
    });
}

/**
 * Gets an array of all indexes or IDs of suppliers stored in the blockchain
 * @param callback(array) callback accepting an array of id's
 */
function getSuppliersIndex(callback) {
    getSuppliersLength((length) => {
        const array = [];
        for (let i = 0; i < length; i++) {
            _getSuppliersAtIndex(i, (id) => {
                array.push(id);

                if (array.length === Number(length)) {
                    callback(array);
                }
            })
        }
        if (length === "0"){
            callback([]);
        }
    });
}

/**
 * Gets an array of all indexes or IDs of categories stored in the blockchain
 * @param callback(array) callback accepting an array of id's
 */
function getCategoryIndex(callback) {
    getCategoryLength((length) => {
        const array = [];
        for (let i = 0; i < length; i++) {
            _getCategoryAtIndex(i, (id) => {
                array.push(id);

                if (array.length === Number(length)) {
                    callback(array);
                }
            })
        }
        if (length === "0"){
            callback([]);
        }
    });
}

/**
 * Gets an array of all keys of transactions in blockchain
 * @param index get transaction item at index
 * @param callback callback when transaction completed
 * @private
 */
function _getTransactionAtIndex(index, callback) {
    callMethod(contract.methods.transactionIndex(index), true, true, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(value);
    });
}

/**
 * Gets an array of all keys of transactions in blockchain
 * @param callback callback when transaction completed
 */
function getTransactionLength(callback) {
    callMethod(contract.methods.getTransactionLength(), true, true, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(value);
    });
}

/**
 * Gets an array of all keys of purchases in a specific transaction

 * @param transactionId id of transaction
 * @param callback callback when transaction completed
 */
function getPurchasesLength(transactionId, callback) {
    callMethod(contract.methods.getPurchasesLength(transactionId), true, false, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(value);
    });
}

/**
 * Gets an array of all keys of purchases in a specific transaction
 * @param transactionId id of transaction
 * @param callback callback when transaction completed
 * @private
 */
function _getPurchasesAtIndex(transactionId, callback) {
    callMethod(contract.methods.getPurchasesIndex(transactionId), true, false, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(value);
    });
}

/**
 * Gets an array of all keys of products in the blockchain
 * @param index index of product to get
 * @param callback callback when transaction completed
 * @private
 */
function _getProductAtIndex(index, callback) {
    callMethod(contract.methods.productIndex(index), true, true, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(value);
    });
}

/**
 * Gets an array of all keys of products in the blockchain
 * @param callback callback when transaction completed
 */
function getProductsLength(callback) {
    callMethod(contract.methods.getProductsLength(), true, true, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(value);
    });
}

/**
 * Gets an array of all keys of suppliers in the blockchain
 * @param index index of supplier item to get
 * @param callback callback when transaction completed
 * @private
 */
function _getSuppliersAtIndex(index, callback) {
    callMethod(contract.methods.supplierIndex(index), true, true, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(_web3Helper.bytes32ToUTF8(value));
    });
}

/**
 * Gets the number of all categories on the blockchain
 * @param callback callback when transaction completed
 */
function getSuppliersLength(callback) {
    callMethod(contract.methods.getSuppliersLength(), true, true, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(value);
    });
}

/**
 * Gets an array of all keys of categories stored in the blockchain
 * @param index index of item to get
 * @param callback callback when transaction completed
 * @private
 */
function _getCategoryAtIndex(index, callback) {
    callMethod(contract.methods.categoryIndex(index), true, true, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(_web3Helper.bytes32ToUTF8(value));
    });
}

/**
 * Gets the number of all categories on the blockchain
 * @param callback callback when transaction completed
 */
function getCategoryLength(callback) {
    callMethod(contract.methods.getCategoryLength(), true, true, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        callback(value);
    });
}

/**
 * Gets a given transaction details

 * @param txID transaction ID
 * @param callback callback when transaction completed
 */
function getTransaction(txID, callback) {
    callMethod(contract.methods.getTransaction(txID), true, false, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        let transaction = {
            id: value.id,
            purchasesIndex: value.purchasesIndex,
            timestamp: value.timestamp,
            status: _web3Helper.bytes32ToUTF8(value.status),
            totalAmount: _web3Helper.floatToUint(value.totalAmount),
            discountPerc: _web3Helper.floatToUint(value.discountPerc),
            refunded: value.refunded,
            refundedAmount: _web3Helper.floatToUint(value.refundedAmount)
        };
        getAllPurchases(txID, (array) => {
            transaction.purchasesIndex = array;
            callback(transaction);
        })
    });
}

/**
 * Gets a purchase details from a given purchase Id and transaction ID

 * @param txID transaction ID
 * @param pchsID purchase ID
 * @param callback callback when transaction completed
 */
function getPurchase(txID, pchsID, callback) {
    callMethod(contract.methods.getPurchase(txID, pchsID), true, false, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        let purchase = {
            id: value.id,
            productID: _web3Helper.bytes32ToUTF8(value.productID),
            quantity: value.quantity,
            onSale: value.onSale,
            itemsReturned: value.itemsReturned,
            discountPerc: _web3Helper.floatToUint(value.discountPerc),
            amount: _web3Helper.floatToUint(value.amount),
            returnsAmount: _web3Helper.floatToUint(value.returnsAmount)
        };
        callback(purchase);
    });
}

/**
 * Gets a product details from a given product Id

 * @param prodID product ID
 * @param callback callback when transaction completed
 */
function getProduct(prodID, callback) {
    if (!_web3Helper.isHex(prodID)) {
        prodID = _web3Helper.utf8ToBytes32(prodID);
    }
    callMethod(contract.methods.getProduct(prodID), true, false, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        let purchase = {
            id: _web3Helper.bytes32ToUTF8(value.id),
            name: value.name,
            description: value.description,
            supplierId: _web3Helper.bytes32ToUTF8(value.supplierId),
            categoryId: _web3Helper.bytes32ToUTF8(value.categoryId),
            price: _web3Helper.floatToUint(value.price)
        };
        callback(purchase);
    });
}

/**
 * Gets a supplier details from a given supplier Id

 * @param suppID supplier ID
 * @param callback callback when transaction completed
 */
function getSupplier(suppID, callback) {
    if (!_web3Helper.isHex(suppID)) {
        suppID = _web3Helper.utf8ToBytes32(suppID);
    }
    callMethod(contract.methods.getSupplier(suppID), true, false, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        let supplier = {
            id: _web3Helper.bytes32ToUTF8(value.id),
            name: value.name,
            memberType: _web3Helper.bytes32ToUTF8(value.memberType),
            ckNumber: _web3Helper.bytes32ToUTF8(value.ckNumber),
            mobile: _web3Helper.bytes32ToUTF8(value.mobile),
            telephone: _web3Helper.bytes32ToUTF8(value.telephone),
            slogan: value.slogan,
            instagram: _web3Helper.bytes32ToUTF8(value.instagram),
            facebook: _web3Helper.bytes32ToUTF8(value.facebook),
            twitter: _web3Helper.bytes32ToUTF8(value.twitter)
        };
        callback(supplier);
    });
}

/**
 * Gets a category details from a given supplier Id

 * @param catID category ID
 * @param callback callback when transaction completed
 */
function getCategory(catID, callback) {
    if (!_web3Helper.isHex(catID)) {
        catID = _web3Helper.utf8ToBytes32(catID);
    }
    callMethod(contract.methods.getCategory(catID), true, false, (value) => {
        if (value === undefined) {
            callback();
            return;
        }
        let category = {
            id: _web3Helper.bytes32ToUTF8(value.id),
            name: value.name,
            description: value.description
        };
        callback(category);
    });
}

/**
 * Updated a transaction on the blockchain given the following details

 * @param id(int) transaction ID
 * @param _timestamp(int) time of transaction
 * @param _status(string/int) status of transaction
 * @param _totalAmount(float) amount of transaction
 * @param _discountPerc(float) percentage discount given
 * @param _refunded(bool) is refunded
 * @param _refundedAmount(float) refund amount
 * @param callback callback when transaction completed
 */
function setTransaction(id, _timestamp, _status, _totalAmount, _discountPerc, _refunded, _refundedAmount, callback) {
    _status = _web3Helper.utf8ToBytes32(_status);
    _totalAmount = _web3Helper.floatToUint(_totalAmount);
    _discountPerc = _web3Helper.floatToUint(_discountPerc);
    _refundedAmount = _web3Helper.floatToUint(_refundedAmount);
    callMethod(contract.methods.setTransaction(id, _timestamp, _status, _totalAmount, _discountPerc, _refunded, _refundedAmount), false, false, callback);
}

/**
 * Updated a purchase on the blockchain given the following details

 * @param id(int) purchase ID
 * @param transactionId(int) transaction ID
 * @param _productID(string) product id
 * @param _quantity(int) quantity of items
 * @param _onSale(bool) was on sale
 * @param _itemsReturned(int) number of items returned
 * @param _discountPerc(float/int) percentage discount
 * @param _amount(float/int) amount of purchase
 * @param _returnsAmount(float/int) amount of money returned
 * @param callback callback when transaction completed
 */
function setPurchase(id, transactionId, _productID, _quantity, _onSale, _itemsReturned, _discountPerc, _amount, _returnsAmount, callback) {
    _productID = _web3Helper.utf8ToBytes32(_productID)
    _discountPerc = _web3Helper.floatToUint(_discountPerc);
    _amount = _web3Helper.floatToUint(_amount);
    _returnsAmount = _web3Helper.floatToUint(_returnsAmount);
    callMethod(contract.methods.setPurchase(id, transactionId, _productID, _quantity, _onSale, _itemsReturned, _discountPerc, _amount, _returnsAmount), false, false, callback);
}

/**
 * Updated a product details on the blockchain given the following details

 * @param id(string) purchase ID
 * @param _name(string) name of product
 * @param _description(string) product description
 * @param _supplierId(bytes32) supplier ID
 * @param _categoryId(bytes32) category ID
 * @param _price(int) price of item
 * @param callback callback when transaction completed
 */
function setProduct(id, _name, _description, _supplierId, _categoryId, _price, callback) {
    id = _web3Helper.utf8ToBytes32(id);
    _supplierId = _web3Helper.utf8ToBytes32(_supplierId);
    _categoryId = _web3Helper.utf8ToBytes32(_categoryId);
    _price = _web3Helper.floatToUint(_price);
    callMethod(contract.methods.setProduct(id, _name, _description, _supplierId, _categoryId, _price), false, false, callback);
}

/**
 * Updated a supplier details on the blockchain given the following details

 * @param id(string) supplier ID
 * @param name(string) supplier name
 * @param _memberType(string) supplier member type
 * @param _ckNumber(string) supplier ck number
 * @param _mobile(string) supplier mobile number
 * @param _telephone(string) supplier telephone number
 * @param _slogan(string) slogan
 * @param _instagram(string) instagram account
 * @param _facebook(string) facebook link
 * @param _twitter(string) twitter handle
 * @param callback callback when transaction completed
 */
function setSupplier(id, name, _memberType, _ckNumber, _mobile, _telephone, _slogan, _instagram, _facebook, _twitter, callback) {
    id = _web3Helper.utf8ToBytes32(id);
    _memberType = _web3Helper.utf8ToBytes32(_memberType);
    _ckNumber = _web3Helper.utf8ToBytes32(_ckNumber);
    _mobile = _web3Helper.utf8ToBytes32(_mobile);
    _telephone = _web3Helper.utf8ToBytes32(_telephone);
    _instagram = _web3Helper.utf8ToBytes32(_instagram);
    _facebook = _web3Helper.utf8ToBytes32(_facebook);
    _twitter = _web3Helper.utf8ToBytes32(_twitter);
    callMethod(contract.methods.setSupplier(id, name, _memberType, _ckNumber, _mobile, _telephone, _slogan, _instagram, _facebook, _twitter), false, false, callback);
}

/**
 * Updated a category details on the blockchain given the following details

 * @param id(string) category ID
 * @param _name(string) category name
 * @param _description(string) description of category
 * @param callback callback when transaction completed
 */
function setCategory(id, _name, _description, callback) {
    id = _web3Helper.utf8ToBytes32(id);
    callMethod(contract.methods.setCategory(id, _name, _description), false, false, callback);
}

/**
 * Add a new transaction on to the blockchain given the following details

 * @param id(int) transaction ID
 * @param _timestamp(int) time of transaction
 * @param _status(string/int) status of transaction
 * @param _totalAmount(float) amount of transaction
 * @param _discountPerc(float) percentage discount given
 * @param _refunded(bool) is refunded
 * @param _refundedAmount(float) refund amount
 * @param callback callback when transaction completed
 */
function addTransaction(id, _timestamp, _status, _totalAmount, _discountPerc, _refunded, _refundedAmount, callback) {
    _status = _web3Helper.utf8ToBytes32(_status);
    _totalAmount = _web3Helper.floatToUint(_totalAmount);
    _discountPerc = _web3Helper.floatToUint(_discountPerc);
    _refundedAmount = _web3Helper.floatToUint(_refundedAmount);
    callMethod(contract.methods.addTransaction(id, _timestamp, _status, _totalAmount, _discountPerc, _refunded, _refundedAmount), false, false, callback);
}

/**
 * Add a new purchase on to the blockchain given the following details

 * @param id(int) purchase ID
 * @param transactionId(int) transaction ID
 * @param _productID(string) product id
 * @param _quantity(int) quantity of items
 * @param _onSale(bool) was on sale
 * @param _itemsReturned(int) number of items returned
 * @param _discountPerc(float/int) percentage discount
 * @param _amount(float/int) amount of purchase
 * @param _returnsAmount(float/int) amount of money returned
 * @param callback callback when transaction completed
 */
function addPurchase(id, transactionId, _productID, _quantity, _onSale, _itemsReturned, _discountPerc, _amount, _returnsAmount, callback) {
    _productID = _web3Helper.utf8ToBytes32(_productID)
    _discountPerc = _web3Helper.floatToUint(_discountPerc);
    _amount = _web3Helper.floatToUint(_amount);
    _returnsAmount = _web3Helper.floatToUint(_returnsAmount);
    callMethod(contract.methods.addPurchase(id, transactionId, _productID, _quantity, _onSale, _itemsReturned, _discountPerc, _amount, _returnsAmount), false, false, callback);
}

/**
 * Add a new product on to the blockchain given the following details

 * @param id(string) purchase ID
 * @param _name(string) name of product
 * @param _description(string) product description
 * @param _supplierId(bytes32) supplier ID
 * @param _categoryId(bytes32) category ID
 * @param _price(int) price of item
 * @param callback callback when transaction completed
 */
function addProduct(id, _name, _description, _supplierId, _categoryId, _price, callback) {
    id = _web3Helper.utf8ToBytes32(id);
    _supplierId = _web3Helper.utf8ToBytes32(_supplierId);
    _categoryId = _web3Helper.utf8ToBytes32(_categoryId);
    _price = _web3Helper.floatToUint(_price);
    callMethod(contract.methods.addProduct(id, _name, _description, _supplierId, _categoryId, _price), false, false, callback);
}

/**
 * Add a new supplier on to the blockchain given the following details

 * @param id(string) supplier ID
 * @param name(string) supplier name
 * @param _memberType(string) supplier member type
 * @param _ckNumber(string) supplier ck number
 * @param _mobile(string) supplier mobile number
 * @param _telephone(string) supplier telephone number
 * @param _slogan(string) slogan
 * @param _instagram(string) instagram account
 * @param _facebook(string) facebook link
 * @param _twitter(string) twitter handle
 * @param callback callback when transaction completed
 */
function addSupplier(id, name, _memberType, _ckNumber, _mobile, _telephone, _slogan, _instagram, _facebook, _twitter, callback) {
    id = _web3Helper.utf8ToBytes32(id);
    _memberType = _web3Helper.utf8ToBytes32(_memberType);
    _ckNumber = _web3Helper.utf8ToBytes32(_ckNumber);
    _mobile = _web3Helper.utf8ToBytes32(_mobile);
    _telephone = _web3Helper.utf8ToBytes32(_telephone);
    _instagram = _web3Helper.utf8ToBytes32(_instagram);
    _facebook = _web3Helper.utf8ToBytes32(_facebook);
    _twitter = _web3Helper.utf8ToBytes32(_twitter);
    callMethod(contract.methods.addSupplier(id, name, _memberType, _ckNumber, _mobile, _telephone, _slogan, _instagram, _facebook, _twitter), false, false, callback);
}

/**
 * Add a new category to the blockchain given the following details

 * @param id(string) category ID
 * @param _name(string) category name
 * @param _description(string) description of category
 * @param callback callback when transaction completed
 */
function addCategory(id, _name, _description, callback) {
    id = _web3Helper.utf8ToBytes32(id);
    callMethod(contract.methods.addCategory(id, _name, _description), false, false, callback);
}

/**
 * Update transaction status

 * @param tID transaction ID
 * @param newStatus(bytes32) new status
 * @param callback callback when transaction completed
 */
function updateTransactionStatus(tID, newStatus, callback) {
    callMethod(contract.methods.updateTransactionStatus(tID, newStatus), false, false, callback);
}

/**
 * Refund a given transaction with an amount

 * @param tID transaction ID
 * @param amount(uint) amount to refund
 * @param callback callback when transaction completed
 */
function refundTransaction(tID, amount, callback) {
    callMethod(contract.methods.refundTransaction(tID, amount), false, false, callback);
}

/**
 * Refund a purchase or purchases items and have an amount refunded

 * @param tID transaction ID
 * @param pchsID(uint) purchase ID
 * @param refundAmount amount to refund
 * @param numItemsReturned number of items returned
 * @param callback callback when transaction completed
 */
function returnedPurchase(tID, pchsID, refundAmount, numItemsReturned, callback) {
    callMethod(contract.methods.returnedPurchase(tID, pchsID, refundAmount, numItemsReturned), false, false, callback);
}

/**
 * Enable/Disable ability for suppliers to view all transaction on the blockchain

 * @param enable(bool) status true/false
 * @param callback callback when transaction completed
 */
function setEnableSupplierViewAllTransactions(enable, callback) {
    callMethod(contract.methods.setEnableSupplierViewAllTransactions(enable), false, false, callback);
}

/**
 * Unsubscribe from event based on event name
 * @param eventType event name
 */
function eventUnsubscriber(eventType) {
    let eventName = eventType.toString();
    subscribedEvents[eventName].unsubscribe((error, value) => {
        if (error) {
            console.error("Error while unsubscribing from " + eventName + "!\n" + error);
        }
        if (!value) {
            console.log("Cannot unsubscribe from " + eventName);
        }
        subscribedEvents[eventName] = null;
    });
}

/**
 * Subscribe to a contract event
 * @param eventType eventName
 * @param callback(eventObj) callback when event is triggered, passing along the event object
 */
function eventSubscriber(eventType, callback) {
    const web3 = _web3Helper.getWeb3Instance();
    const eventName = eventType.toString();
    let eventJsonInterface = _.find(contract._jsonInterface, o => o.name === eventName && o.type === 'event');
    if (eventJsonInterface === null) {
        console.error("Event not found");
        return;
    }
    subscribedEvents[eventName] = web3.eth.subscribe('logs', {
        address: config.contract.deployAddress,
        topics: [eventJsonInterface.signature]
    }, (error, result) => {
        if (error) {
            console.error("Subscription Error: " + error);
        }
        if (result) {
            const eventObj = web3.eth.abi.decodeLog(eventJsonInterface.inputs, result.data, result.topics.slice(1));
            const value = web3.utils.isHex(eventObj) ? _web3Helper.bytes32ToUTF8(eventObj) : eventObj;
            callback(value);
        }
    });

}

/**
 * Set the contract used by the JS object
 * @param _contract
 */
function setContract(_contract) {
    contract = _contract;
}

/**
 * [Async] Sends a call or transaction to the blockchain on the specified contract (in the contract variable)
 * @param method function on blockchain to invoke
 * @param isPure(bool) true if the function is a getter, else false to send (and alter) the blockchain
 * @param publicAccess(bool) true if you are accessing a public variable of the blockchain. This skips the gas estimate as it is not necessary.
 * @param callback callback when transaction has completed
 */
function callMethod(method, isPure, publicAccess, callback) {
    if (publicAccess) {
        _callFunction(method, callback);
    } else {
        method.estimateGas({
            from: config.wallet.address,
            gas: config.contract.transactionGas
        }).then(amount => {
            _accounts.getBalance(config.wallet.address, (balance) => {
                if (!_web3Helper.hasEnoughFunds(balance, amount)) {
                    console.error("Insufficient gas to process transaction, have " + balance + " and need " + amount);
                    return;
                }

                console.info("Account balance: " + balance);

                // send or call
                if (isPure) {
                    // process transaction
                    _callFunction(method, callback);
                } else {
                    // process transaction
                    _sendTransaction(method, callback);
                }
            })
        }, reason => {
            if (reason) {
                console.error("An error occurred while estimating transaction gas!");
            }

            // send or call
            if (isPure) {
                // process transaction
                _callFunction(method, callback);
            } else {
                // process transaction
                _sendTransaction(method, callback);
            }
        });
    }
}

/**
 * [Async] Sends a transaction from a given address with parameters to a function call on the specified contract (in the contract variable)
 * Assumes sufficient balance to pay for gas
 * @param transaction transaction object
 * @param callback callback when transaction has completed
 */
function _sendTransaction(transaction, callback) {
    _accounts.unlockAccount(config.wallet.address, config.secret.password, (unlocked) => {
        if (!unlocked) {
            console.error("Unable to unlock account. Cannot process transaction");
            return;
        }

        transaction.send({
            from: config.wallet.address,
            gas: config.contract.transactionGas
        }).then(value => {
            if (value) {
                _accounts.lockAccount(config.wallet.address);
                callback(JSON.stringify({value: value}));
            }
        }, reason => {
            if (reason) {
                console.error(reason.message);
            }
            callback(({error: reason}));
        });
    });
}

/**
 * [Async] Calls a function on the blockchain without altering the state of the blockchain
 * @param method method to invoke on blockchain
 * @param callback(result) callback to invoke with result
 * @private
 */
function _callFunction(method, callback) {
    method.call({
        from: config.wallet.address,
        gas: config.contract.transactionGas
    }).then(value => {
        if (value) {
            callback(value);
        }
    }, reason => {
        if (reason) {
            console.error(reason.message);
        }
        callback();
    });
}

module.exports = {
    eventSubscriber,
    eventUnsubscriber,
    setContract,
    getCategoryLength,
    getProductsLength,
    getTransactionLength,
    getSuppliersLength,
    getPurchasesLength,
    getPurchasesIndex,
    getTransactionIndex,
    getProductIndex,
    getSuppliersIndex,
    getCategoryIndex,
    getTransaction,
    getPurchase,
    getProduct,
    getSupplier,
    getCategory,
    checkTransactionExists,
    checkPurchaseExists,
    checkProductExists,
    checkSupplierExists,
    checkCategoryExists,
    getAllTransactions,
    getAllPurchases,
    getAllProducts,
    getAllSuppliers,
    getAllCategories,
    setTransaction,
    setPurchase,
    setProduct,
    setSupplier,
    setCategory,
    addTransaction,
    addPurchase,
    addProduct,
    addSupplier,
    addCategory,
    updateTransactionStatus,
    refundTransaction,
    returnedPurchase,
    setEnableSupplierViewAllTransactions
};