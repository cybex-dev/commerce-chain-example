let _http = require('http');
let _ws = require('ws');
let wss = null;
let config = require('../app_config');
let web3Helper = require('../scripts/web3-helper');

function getAllTransactions(contractInterface, obfuscate, callback) {
    contractInterface.getAllProducts(products => {
        // Build transaction list
        contractInterface.getAllSuppliers(suppliers => {
            // Stored list of suppliers, process transaction list
            contractInterface.getAllTransactions(txs => {

                var transactionObjects = [];

                if (txs.length === 0) {
                    callback([]);
                } else {
                    // Process each transaction
                    txs.forEach(tx => {
                        // get supplier Id from purchase list
                        let promises = [
                            new Promise(function (resolve) {
                                contractInterface.getAllPurchases(tx.id, function (purchases) {
                                    // local store
                                    let productID = "-1";

                                    // get supplier ID
                                    let supplierId = "n/a";

                                    let purchaseList = [];

                                    if (purchases.length > 0) {

                                        productID = purchases[0].productID;
                                        supplierId = products.filter(prod => prod.id === productID)[0].supplierId;

                                        // check if we have to obfuscate
                                        if (obfuscate) {
                                            supplierId = web3Helper.obfuscatedAddress(supplierId)
                                        } else {
                                            let filteredSuppliers = suppliers.filter(sup => sup.id === supplierId);
                                            if (filteredSuppliers.length === 0) {
                                                supplierId = "Supplier " + supplierId + " not found!";
                                            } else {
                                                supplierId = filteredSuppliers[0].name
                                            }
                                        }


                                        // process purchases
                                        purchaseList = purchases.map(p => {
                                            var product = products.filter(prod => prod.id === p.productID)[0];
                                            var prodAmount = product.price;
                                            var prodName = product.name;
                                            return {
                                                id: p.id,
                                                name: prodName,
                                                quantity: p.quantity,
                                                unitPrice: prodAmount,
                                                amount: p.amount
                                            }
                                        });
                                    }
                                    // create transaction object here
                                    var t = {supplierId: supplierId, purchaseList: purchaseList};
                                    resolve(t);
                                });
                            })
                        ];
                        Promise.all(promises).then(value => {

                            transactionObjects.push({
                                transactionId: tx.id,
                                date: tx.timestamp,
                                status: tx.status,
                                amount: tx.totalAmount,
                                supplier: value[0].supplierId,
                                purchases: value[0].purchaseList
                            });

                        }).then(value => {
                            callback(transactionObjects);
                        });
                    });
                }
            });
        });
    });
}

function parseMessage(contractInterface, wss, key, message) {
    switch (key) {
        case "UPDATE_TRANSACTION_LIST": {
            getAllTransactions(contractInterface, false, function (txs) {
                console.log("Sending All Transactions (Obfuscated) [" + txs.length + "]");
                var payload = {
                    status: "OK",
                    payload: {key: "transactions", payload_data: {obfuscated: false, transactions: txs}}
                };
                wss.send(JSON.stringify(payload));
            });
            break;
        }

        case "UPDATE_TRANSACTION_LIST_OBFUSCATED": {
            getAllTransactions(contractInterface, true, function (txs) {
                console.log("Sending All Transactions (Obfuscated) [" + txs.length + "]");
                var payload = {
                    status: "OK",
                    payload: {key: "transactions", payload_data: {obfuscated: true, transactions: txs}}
                };
                wss.send(JSON.stringify(payload));
            });
            break;
        }

        case "ADD_PURCHASE": {
            contractInterface.addPurchase(message.id, message.txId, message.productId, message.quantity, message.onSale, message.itemsReturned, message.discountPerc, message.amount, message.returnsAmount, function () {
                wss.send(JSON.stringify({status: "OK"}));
            });
            break;
        }

        case "PRODUCTS_ALL": {
            contractInterface.getAllProducts(function (array) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {key: "ALL", payload_data: {type: "products", array: array}}
                }));
            });
            break;
        }

        case "TRANSACTIONS_ALL": {
            contractInterface.getAllTransactions(function (array) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {key: "ALL", payload_data: {type: "transactions", array: array}}
                }));
            });
            break;
        }

        case "SUPPLIERS_ALL": {
            contractInterface.getAllSuppliers(function (array) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {key: "ALL", payload_data: {type: "suppliers", array: array}}
                }));
            });
            break;
        }

        case "CATEGORIES_ALL": {
            contractInterface.getAllCategories(function (array) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {key: "ALL", payload_data: {type: "categories", array: array}}
                }));
            });
            break;
        }

        case "PRODUCTS_LENGTH": {
            contractInterface.getProductsLength(function (length) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {key: "LENGTH", payload_data: {type: "products", length: length}}
                }));
            });
            break;
        }

        case "CATEGORIES_LENGTH": {
            contractInterface.getCategoryLength(function (length) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {key: "LENGTH", payload_data: {type: "categories", length: length}}
                }));
            });
            break;
        }

        case "SUPPLIERS_LENGTH": {
            contractInterface.getSuppliersLength(function (length) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {key: "LENGTH", payload_data: {type: "suppliers", length: length}}
                }));
            });
            break;
        }

        case "TRANSACTION_LENGTH": {
            contractInterface.getTransactionLength(function (length) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {key: "LENGTH", payload_data: {type: "transactions", length: length}}
                }));
            });
            break;
        }

        case "ADD_PURCHASE": {
            contractInterface.addPurchase(message.id, message.txId, message.productId, message.quantity, message.onSale, message.itemsReturned, message.discountPerc, message.amount, message.returnsAmount, function (result) {
                if (result.error) {
                    wss.send(JSON.stringify({status: "ERROR", message: result.error.message}));
                } else {
                    wss.send(JSON.stringify({status: "OK"}));
                }
            });
            break;
        }

        case "ADD_SUPPLIER": {
            contractInterface.addSupplier(message.id, message.name, message.memberType, message.ckNumber, message.mobile, message.telephone, message.slogan, message.instagram, message.facebook, message.twitter, function (result) {
                if (result.error) {
                    wss.send(JSON.stringify({status: "ERROR", message: result.error.message}));
                } else {
                    wss.send(JSON.stringify({status: "OK"}));
                }
            });

            break;
        }

        case "ADD_TRANSACTION": {
            contractInterface.addTransaction(message.id, message.timestamp, message.status, message.totalAmount, message.discountPerc, message.refunded, message.refundedAmount, function (result) {
                if (result.error) {
                    wss.send(JSON.stringify({status: "ERROR", message: result.error.message}));
                } else {
                    wss.send(JSON.stringify({status: "OK"}));
                }
            });
            break;
        }

        case "ADD_PRODUCT": {
            contractInterface.addProduct(message.id, message.name, message.description, message.supplierId, message.categoryId, message.price, function (result) {
                if (result.error) {
                    wss.send(JSON.stringify({status: "ERROR", message: result.error.message}));
                } else {
                    wss.send(JSON.stringify({status: "OK"}));
                }
            });
            break;
        }

        case "ADD_CATEGORY": {
            contractInterface.addCategory(message.id, message.name, message.description, function (result) {
                if (result.error) {
                    wss.send(JSON.stringify({status: "ERROR", message: result.error.message}));
                } else {
                    wss.send(JSON.stringify({status: "OK"}));
                }
            });
            break;
        }

        case "GET_PURCHASE": {
            contractInterface.getPurchase(message.transactionId, message.purchaseId, function (v) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {
                        key: "GET_PURCHASE",
                        payload_data: v
                    }
                }));
            });
            break;
        }

        case "GET_SUPPLIER": {
            contractInterface.getSupplier(message.supplierId, function (v) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {
                        key: "GET_SUPPLIER",
                        payload_data: v
                    }
                }));
            });
            break;
        }

        case "GET_TRANSACTION": {
            contractInterface.getTransaction(message.transactionId, function (v) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {
                        key: "GET_TRANSACTION",
                        payload_data: v
                    }
                }));
            });
            break;
        }

        case "GET_PRODUCT": {
            contractInterface.getProduct(message.productId, function (v) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {
                        key: "GET_PRODUCT",
                        payload_data: v
                    }
                }));
            });
            break;
        }

        case "GET_CATEGORY": {
            contractInterface.getCategory(message.categoryId, function (v) {
                wss.send(JSON.stringify({
                    status: "OK",
                    payload: {
                        key: "GET_CATEGORY",
                        payload_data: v
                    }
                }));
            });
            break;
        }

        default: {
            console.log("Key in Message not recognized: \'" + message + "\'");
            wss.send(JSON.stringify({"error": "Unrecognized Key in Message! " + message}));
            break;
        }
    }
}

//wss.send(JSON.stringify({event: eventName.toString(), payload: result}));
function processEvent(contractInterface, wss, eventName, result) {
    console.log("Sending Event Trigger [" + eventName + "] to client");

    // Specific event processing
    // switch (eventName) {
    //     case contractInterface.EventType.eventNewProduct: {
    //         wss.send(JSON.stringify({event: eventName.toString(), productId: result}));
    //         break;
    //     }
    //     case contractInterface.EventType.eventNewCategory: {
    //         wss.send(JSON.stringify({event: eventName.toString(), categoryId: result}));
    //         break;
    //     }
    //     case contractInterface.EventType.eventNewPurchase: {
    //         wss.send(JSON.stringify({event: eventName.toString(), purchaseId: result}));
    //         break;
    //     }
    //     case contractInterface.EventType.eventNewSupplier: {
    //         wss.send(JSON.stringify({event: eventName.toString(), supplierId: result}));
    //         break;
    //     }
    //     case contractInterface.EventType.eventNewTransaction: {
    //         wss.send(JSON.stringify({event: eventName.toString(), transactionId: result}));
    //         break;
    //     }
    // }

    // Generic Event processing - note each client will receive this.
    // Ideally, we would like to server/client side filtering (prefer server-side) i.e. does username match some ID (supplier ID, etc) then show only events relating to that supplier
    var payload = {status: "OK", payload: {key: "event", payload_data: {event: eventName.toString(), payload: result}}};
    wss.send(JSON.stringify(payload));
}

//
// initialize blockchain interface
// contractInterface.init((contract) => {

function normalizeData(payload) {
    var newPayload = {};
    for (let itemName in payload) {
        if (payload.hasOwnProperty(itemName)) {

            let data = payload[itemName];
            let p = data.value;
            // check if we have a format component
            if (data.format) {
                switch (data.format) {
                    case "Bytes32": {
                        // not needed in current revision.
                        // p = web3Helper.utf8ToBytes32(data.value);
                        break;
                    }

                    default: {
                        console.error("Error normalizing data: " + value.value + " [ format: " + value.format + "]");
                        break;
                    }
                }
            }
            newPayload[itemName] = p;
        }
    }

    return newPayload;
}

const init = function (app, web3Interface) {
    //initialize a simple http server
    const server = _http.createServer(app);

    //initialize the WebSocket server instance
    const wss = new _ws.Server({server});

    const web3Init = web3Interface;

    // Setup Web Socket
    wss.on('connection', (wss) => {
        const contractInterface = web3Interface.getContractInterface();

        // establish event callback to client
        wss.on('message', (message) => {
            if (message === "undefined") {
                console.log("Invalid Message received: \'" + message + "\'");
                wss.send({"error": "Invalid Message! " + message});
            } else {
                let m = JSON.parse(message);
                let payload = normalizeData(m.payload);
                parseMessage(contractInterface, wss, m.key, payload);
            }
        });

        // Connect all events, handle events here
        for (let key in web3Init.EventType) {
            if (web3Init.EventType.hasOwnProperty(key)) {
                // get event name
                const eventName = web3Init.EventType[key];

                console.log("Subscribing to event: " + eventName.toString());

                // subscribe to each event
                web3Init.subscribeToEvent(eventName, function (result) {
                    // process event occurrence
                    console.log("Event: " + eventName.toString());
                    console.log("Event Payload: " + result);
                    processEvent(web3Init, wss, eventName, result);
                });
            }
        }
    });

    //start our websocket server
    server.listen(config.websocket.port, () => {
        console.log(`WebSocket started on port ${server.address().port} :)`);
    });
};

module.exports = {
    init
};