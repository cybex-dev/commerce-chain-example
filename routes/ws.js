let _http = require('http');
let _ws = require('ws');
let wss = null;
let config = require('../app_config');

function getAllTransactions(contractInterface, obfuscate, callback) {
    contractInterface.getAllProducts(products => {
        // Build transaction list
        contractInterface.getAllSuppliers(suppliers => {
            // Stored list of suppliers, process transaction list
            contractInterface.getAllTransactions(txs => {

                var transactionObjects = {};
                // Process each transaction
                txs.forEach(tx => {
                    // get supplier Id from purchase list
                    Promise.all(new Promise(function (resolve) {
                        contractInterface.getAllPurchases(tx.id, function (purchases) {
                            // local store
                            let productID = purchases[0].productID;

                            // get supplier ID
                            let supplierId = products.filter(prod => prod.id === productID)[0].supplierId;

                            // check if we have to obfuscate
                            if (!obfuscate) {
                                supplierId = suppliers.filter(sup => sup.id === supplierId)[0].name
                            }

                            // process purchases
                            let purchaseList = purchases.map(p => {
                                var product = products.filter(prod => prod.id === p.id)[0];
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

                            // create transaction object here
                            resolve({supplierId, purchaseList});
                        });
                    })).then(value => {
                        transactionObjects.push({
                            transactionId: tx.id,
                            date: tx.timestamp,
                            status: tx.status,
                            amount: tx.totalAmount,
                            supplier: value[0],
                            purchases: value[1]
                        });
                    });
                });
                callback(transactionObjects);
            });
        });
    });
}

function parseMessage(contractInterface, wss, key, message) {
    switch (key) {
        case "UPDATE_TRANSACTION_LIST": {
            getAllTransactions(contractInterface, true, function (txs) {
                console.log("Sending All Transactions (Obfuscated) [" + txs.length + "]");
                wss.send(JSON.stringify(txs));
            });
            break;
        }

        case "UPDATE_TRANSACTION_LIST_OBFUSCATED": {
            getAllTransactions(contractInterface, true, function (txs) {
                console.log("Sending All Transactions (Obfuscated) [" + txs.length + "]");
                wss.send(JSON.stringify(txs));
            });
            break;
        }

        case "ADD_PURCHASE": {
            contractInterface.addPurchase(message.id, message.txId, message.productId, message.quantity, message.onSale, message.itemsReturned, message.discountPerc, message.amount, message.returnsAmount, function () {
                wss.send(JSON.stringify({status: "OK"}));
            });
            break;
        }

        case "ADD_SUPPLIER": {
            contractInterface.addSupplier(message.id, message.name, message.memberType, message.ckNumber, message.mobile, message.telephone, message.slogan, message.instagram, message.facebook, message.twitter, function () {
                wss.send(JSON.stringify({status: "OK"}));
            });

            break;
        }

        case "ADD_TRANSACTION": {
            contractInterface.addTransaction(message.id, message.timestamp, message.status, message.totalAmount, message.discountPerc, message.refunded, message.refundedAmount, function () {
                wss.send(JSON.stringify({status: "OK"}));
            });
            break;
        }

        case "ADD_PRODUCT": {
            contractInterface.addProduct(message.id, message.timestamp, message.status, message.totalAmount, message.discountPerc, message.refunded, message.refundedAmount, function () {
                wss.send(JSON.stringify({status: "OK"}));
            });
            break;
        }

        case "ADD_CATEGORY": {
            contractInterface.addCategory(message.id, message.timestamp, message.status, message.totalAmount, message.discountPerc, message.refunded, message.refundedAmount, function () {
                wss.send(JSON.stringify({status: "OK"}));
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
    wss.send(JSON.stringify({event: eventName.toString(), payload: result}));
}

//
// initialize blockchain interface
// contractInterface.init((contract) => {

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
                parseMessage(contractInterface, wss, m.request, m.payload);
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