const _contractInterface = require('./interface');
const _web3Helper = require('./web3-helper');

console.log("Init Contract Interface");
_contractInterface.init(() => {
    console.log("Contract ready");

    // Add event listeners (included is the unsubscribe events
    _contractInterface.getContractInterface().checkPurchaseExists("111111111", "1", (exists) => {
        if (!exists) {
            registerPurchaseEvent();
            registerCategoryEvent();
            registerSupplierEvent();
            registerTransactionEvent();
            registerProductEvent();

            // Add to blockchain. Within are methods to get various other items/arrays from the blockchain
            addSupplier1();
            addCategory1();
            addProduct1();
            addTransaction1();
            addTransaction2();
        } else {
            _contractInterface.getContractInterface().getAllCategories((categories) => {
               console.log(categories);
            });

            _contractInterface.getContractInterface().getAllTransactions((transactions) => {
                console.log(transactions);
            });

            _contractInterface.getContractInterface().getAllPurchases("111111111", (purchases) => {
                console.log(purchases);
            });
        }
    });
    // registerCategoryEvent();
    // registerSupplierEvent();
    // registerTransactionEvent();
    // registerPurchaseEvent();
    //
    // // Add to blockchain. Within are methods to get various other items/arrays from the blockchain
    // addSupplier1();
    // addCategory1();
    // addProduct1();
    // addTransaction1();
    // addTransaction2();

});

const registerTransactionEvent = () => {
    _contractInterface.subscribeToEvent(_contractInterface.EventType.eventNewTransaction, (eventObj) => {
        const tId = eventObj.transactionId;
        console.log("Transaction ID added: " + tId);
        // get supplier details
        _contractInterface.getContractInterface().getTransaction(tId, (result) => {
            if (result === undefined) {
                console.error("Call failed. Does the item exist?");
                return;
            }
            console.log(result);
        });
    });
};

const registerProductEvent = () => {
    _contractInterface.subscribeToEvent(_contractInterface.EventType.eventNewProduct, (eventObj) => {
        const prodId =  _web3Helper.bytes32ToUTF8(eventObj.productId);
        console.log("Product ID added: " + prodId);
        // get supplier details
        _contractInterface.getContractInterface().getProduct(prodId, (result) => {
            if (result === undefined) {
                console.error("Call failed. Does the item exist?");
                return;
            }
            console.log(result);
            console.log("Unsubscribing from NewProduct event");
            _contractInterface.unsubscribeFromEvent(_contractInterface.EventType.eventNewProduct);
        });
    });
};

const registerSupplierEvent = () => {
    _contractInterface.subscribeToEvent(_contractInterface.EventType.eventNewSupplier, (eventObj) => {
        const supId = _web3Helper.bytes32ToUTF8(eventObj.supplierId);
        console.log("Supplier ID added: " + supId);
        // get supplier details
        _contractInterface.getContractInterface().getSupplier(supId, (result) => {
            if (result === undefined) {
                console.error("Call failed. Does the item exist?");
                return;
            }
            console.log(result);
            console.log("Unsubscribing from NewSupplier event");
            _contractInterface.unsubscribeFromEvent(_contractInterface.EventType.eventNewSupplier);
        });
    });
};

const registerCategoryEvent = () => {
    _contractInterface.subscribeToEvent(_contractInterface.EventType.eventNewCategory, (eventObj) => {
        const catId =  _web3Helper.bytes32ToUTF8(eventObj.categoryId);
        console.log("Category ID added: " + catId);
        // get supplier details
        _contractInterface.getContractInterface().getCategory(catId, (result) => {
            if (result === undefined) {
                console.error("Call failed. Does the item exist?");
                return;
            }
            console.log(result);
            console.log("Unsubscribing from NewCategory event");
            _contractInterface.unsubscribeFromEvent(_contractInterface.EventType.eventNewCategory);
        });
    });
};

const registerPurchaseEvent = () => {
    _contractInterface.subscribeToEvent(_contractInterface.EventType.eventNewPurchase, (eventObj) => {
        const purchaseId =  eventObj.purchaseId;
        console.log("Purchase ID added: " + purchaseId);
        // get supplier details
        _contractInterface.getContractInterface().getPurchase("111111111", purchaseId, (result) => {
            if (result === undefined) {
                console.error("Call failed. Does the item exist?");
                return;
            }
            console.log(result);
        });
    });
};

const addSupplier1 = () => {
    console.log("Adding New Supplier (expect events to fire)");
    _contractInterface.getContractInterface().addSupplier("supElec1041234", "AllStarElectronics","standard", "123456789", "0811234567","0123456789", "slogan words go here ok blah", "@twitterHandle", "facebookHere", "instagramHere", (hash) => {
        if (hash === undefined) {
            console.error("Transaction failed. Entry already exists?");
            return;
        }
        console.log("Added Supplier [" + hash + "]");
        console.log("Awaiting event firing...");

        _contractInterface.getContractInterface().getSuppliersLength((length) => {
            console.log("Supplier length = " + length);
        })
    });
};

const addCategory1 = () => {
    console.log("Adding New Category (expect events to fire)");
    _contractInterface.getContractInterface().addCategory("elec031243", "Electronics", "All Electronics and Computer Appliances", (hash) => {
        if (hash === undefined) {
            console.error("Transaction failed. Entry already exists?");
            return;
        }
        console.log("Added Category [" + hash + "]");
        console.log("Awaiting event firing...");

        _contractInterface.getContractInterface().getCategoryLength((length) => {
            console.log("Transaction length = " + length);
        });
    });
};

const addProduct1 = () => {
    console.log("Adding New Product (expect events to fire)");
    _contractInterface.getContractInterface().addProduct("prod41234", "Laptop", "Asus Rog FX504GE", "supElec101","elec", "14899.99", (hash) => {
        if (hash === undefined) {
            console.error("Transaction failed. Entry already exists?");
            return;
        }
        console.log("Added Product [" + hash + "]");
        console.log("Awaiting event firing...");

        _contractInterface.getContractInterface().getProductIndex((map) => {
            console.log("Product Map\n" + map);
        });
    });
};

const addTransaction1 = () => {
    console.log("Adding New Transaction (expect events to fire)");
    _contractInterface.getContractInterface().addTransaction("111111111", "000000000000","Completed",  "8978.32", "0", false,  "0", (hash) => {
        if (hash === undefined) {
            console.error("Transaction failed. Entry already exists?");
            return;
        }
        console.log("Added Transaction1 [" + hash + "]");
        console.log("Awaiting event firing...");

        addPurchase1();
        addPurchase2();
    });
};

const addTransaction2 = () => {
    console.log("Adding New Transaction (expect events to fire)");
    _contractInterface.getContractInterface().addTransaction("1111111112", "101010100000","Incomplete", "123.45", "0", false,  "0", (hash) => {
        if (hash === undefined) {
            console.error("Transaction failed. Entry already exists?");
            return;
        }
        console.log("Added Transaction2 [" + hash + "]");
        console.log("Awaiting event firing...");

        _contractInterface.getContractInterface().getTransactionLength((length) => {
            console.log("Transaction length = " + length);
        });
    });
};

const addPurchase1 = () => {
    console.log("Adding New Purchase for transaction (expect events to fire)");
    _contractInterface.getContractInterface().addPurchase("1", "111111111", "prod4", 2, false,  0, "0",  "553.78", "0", (hash) => {
        if (hash === undefined) {
            console.error("Transaction failed. Entry already exists?");
            return;
        }
        console.log("Added Purchase1 [" + hash + "]");
        console.log("Awaiting event firing...");

        _contractInterface.getContractInterface().getPurchasesLength("111111111", (length) => {
            console.log("Purchases length = " + length);
        });
    });
};

const addPurchase2 = () => {
    console.log("Adding New Purchase for transaction (expect events to fire)");
    _contractInterface.getContractInterface().addPurchase("2", "111111111", "prod4", 5, false,  0, "0", "11.78", "0", (hash) => {
        if (hash === undefined) {
            console.error("Transaction failed. Entry already exists?");
            return;
        }
        console.log("Added Purchase2 [" + hash + "]");
        console.log("Awaiting event firing...");

        _contractInterface.getContractInterface().getPurchasesLength("111111111", (length) => {
            console.log("Purchases length = " + length);

            _contractInterface.getContractInterface().getTransaction("111111111", (idArray) => {
                console.log(idArray);
            });
        });
    });
};



