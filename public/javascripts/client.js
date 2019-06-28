let _ws = new WebSocket("ws://localhost:8443");
let eventTextBox = null;

function buildValue(value, format) {
    return (format)
        ? {value: value, format: format}
        : {value: value};

}

_ws.onopen = () => {
    console.log("Connected to ws://localhost:8443");
    // store reference to connected websocket

    _ws.onmessage = (e) => {
        var message = e.data;
        if (message === 'undefined') {
            console.log("Invalid Message received");
        } else {
            // on fail
            /*
            Format
            {
                "status": "error|*",
                "message":"Some error message here"
            }*/
            let m = JSON.parse(message);
            if (m.status.toUpperCase() === "ERROR") {
                console.log("An error occurred");
                console.log(m.message);
                alert("Server Error Message:\n" + m.message);
                return;
            }

            if (m.status.toUpperCase() !== "OK") {
                alert("Invalid server response: \n" + m.status + "\n\nData:" + m.message);
                console.error("Invalid status message");
                console.log(JSON.stringify(message, undefined, 4));
                return;
            }

            // on success
            /*
            Format
            {
                "status": "OK",
                "payload": (payload)
            }*/
            // Get payload
            m = m.payload;
            if (!m){
                console.log("Message with no payload");
                return;
            }
            /*
            Format
            {
                key: "someKey"
                value: (payload_data)
            }*/

            let key = m.key;
            let payloadData = m.payload_data;
            // Handle status OK
            switch (key) {
                case "event" : {
                    /*payload_data
                    {
                        "event":"eventName",
                        "data":"1234"
                    }
                    */
                    console.log("New Event [" + payloadData.event + "] received");
                    eventTextBox.value = eventTextBox.value + "\n" +
                        "Event [" + payloadData.event + "] - " + JSON.stringify(payloadData.payload,undefined, 4) + "\n" +
                        "\n ==========================================" + "\n";

                    // lets update both transaction lists
                    _ws.send(JSON.stringify({ key: "UPDATE_TRANSACTION_LIST" }));
                    _ws.send(JSON.stringify({ key: "UPDATE_TRANSACTION_LIST_OBFUSCATED" }));
                    break;
                }

                case "transactions" : {
                    /*payload
                    {
                        "obfuscated":"true|false",
                        "transactions":[ {}, {}, {}, ...]
                    }
                    */
                    if (!payloadData.obfuscated) {
                        console.log("Obfuscated Transaction List Update");
                        document.getElementById("transactionBox").value = JSON.stringify(payloadData.transactions,undefined, 4);
                    } else {
                        console.log("Transaction List Update");
                        document.getElementById("transactionBoxOutside").value = JSON.stringify(payloadData.transactions,undefined, 4);
                    }
                    break;
                }

                case "GET_PURCHASE": {
                    console.log("Received Purchase Response");
                    document.getElementById("purchDivResult").value = JSON.stringify(payloadData,undefined, 4);
                    break;
                }

                case "GET_SUPPLIER": {
                    console.log("Received Supplier Response");
                    document.getElementById("supDivResult").value = JSON.stringify(payloadData,undefined, 4);
                    break;
                }

                case "GET_TRANSACTION": {
                    console.log("Received Transaction Response");
                    document.getElementById("txDivResult").value = JSON.stringify(payloadData,undefined, 4);
                    break;
                }

                case "GET_PRODUCT": {
                    console.log("Received Product Response");
                    document.getElementById("prodDivResult").value = JSON.stringify(payloadData,undefined, 4);
                    break;
                }

                case "GET_CATEGORY": {
                    console.log("Received Category Response");
                    document.getElementById("catDivResult").value = JSON.stringify(payloadData,undefined, 4);
                    break;
                }

                case "LENGTH": {
                    alert( payloadData.type + ": " + payloadData.length);
                    console.log( payloadData.type + ": " + payloadData.length);
                    break;
                }

                case "ALL": {
                    switch (payloadData.type) {
                        case "products":{
                            document.getElementById("prodDivResult").value = JSON.stringify(payloadData.array,undefined, 4);
                            break;
                        }
                        case "transactions":{
                            document.getElementById("txDivResult").value = JSON.stringify(payloadData.array,undefined, 4);
                            break;
                        }
                        case "categories":{
                            document.getElementById("catDivResult").value = JSON.stringify(payloadData.array,undefined, 4);
                            break;
                        }
                        case "suppliers":{
                            document.getElementById("supDivResult").value = JSON.stringify(payloadData.array,undefined, 4);
                            break;
                        }
                        default:{
                            console.log("Unknown type for displaying all [" + payloadData.type + "]");
                            break;
                        }
                    }
                    break;
                }

                default: {
                    console.log("Unknown Response: " + message);
                    alert("Unknown Response");
                    break;
                }
            }
        }
    };
    _ws.onclose = function () {
        alert("Disconnected from server");
        console.log("Disconnected from server" );
    };
    _ws.onerror = function (e) {
        alert("Websocket Error:\n" + e.data);
        console.log("Websocket Error:\n" + e.data)
    }
};

// On document load
window.onload = function () {

    eventTextBox = document.getElementById("eventsTextArea");

    // Adders
    document.getElementById("btnAddCat").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        // create payload
        var payload = {
            id: buildValue(document.getElementById("cat_id").value, "Bytes32"),
            name: buildValue(document.getElementById("cat_name").value),
            description: buildValue(document.getElementById("cat_desc").value)
        };

        // Send payload
        _ws.send(JSON.stringify({
            key: "ADD_CATEGORY",
            payload: payload
        }));
    });
    document.getElementById("btnAddProd").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        // create payload
        var payload = {
            id: buildValue(document.getElementById("prod_id").value, "Bytes32"),
            name: buildValue(document.getElementById("prod_name").value),
            description: buildValue(document.getElementById("prod_desc").value),
            supplierId: buildValue(document.getElementById("prod_sup_id").value, "Bytes32"),
            categoryId: buildValue(document.getElementById("prod_cat_id").value, "Bytes32"),
            price: buildValue(Number(document.getElementById("prod_price").value))
        };

        // Send payload
        _ws.send(JSON.stringify({
            key: "ADD_PRODUCT",
            payload: payload
        }));
    });
    document.getElementById("btnAddSupplier").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        // create payload
        var payload = {
            id: buildValue(document.getElementById("sup_id").value, "Bytes32"),
            name: buildValue(document.getElementById("sup_name").value),
            slogan: buildValue(document.getElementById("sup_slogan").value),
            memberType: buildValue(document.getElementById("sup_memberType").value, "Bytes32"),
            ckNumber: buildValue(document.getElementById("sup_ckNumber").value, "Bytes32"),
            mobile: buildValue(document.getElementById("sup_mobile").value, "Bytes32"),
            telephone: buildValue(document.getElementById("sup_telephone").value, "Bytes32"),
            instagram: buildValue(document.getElementById("sup_insta").value, "Bytes32"),
            facebook: buildValue(document.getElementById("sup_fb").value, "Bytes32"),
            twitter: buildValue(document.getElementById("sup_twitter").value, "Bytes32")
        };

        // Send payload
        _ws.send(JSON.stringify({
            key: "ADD_SUPPLIER",
            payload: payload
        }));
    });
    document.getElementById("btnAddTransaction").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        // create payload
        var payload = {
            id: buildValue(document.getElementById("tx_id").value, "Bytes32"),
            timestamp: buildValue(Math.round((new Date()).getTime() / 1000)),
            status: buildValue(document.getElementById("tx_status").value, "Bytes32"),
            totalAmount: buildValue(document.getElementById("tx_total_amount").value),
            discountPerc: buildValue(document.getElementById("tx_discount_perc").value),
            refunded: buildValue(document.getElementById("tx_refunded").checked),
            refundedAmount: buildValue(document.getElementById("tx_refunded_mount").value)
        };

        // Send payload
        _ws.send(JSON.stringify({
            key: "ADD_TRANSACTION",
            payload: payload
        }));
    });
    document.getElementById("btnAddPurchase").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        // create payload
        var payload = {
            id: buildValue(document.getElementById("purch_id").value),
            txId: buildValue(document.getElementById("purch_txId").value),
            productId: buildValue(document.getElementById("purch_productId").value, "Bytes32"),
            quantity: buildValue(document.getElementById("purch_quantity").value),
            onSale: buildValue(document.getElementById("purch_onSale").checked),
            itemsReturned: buildValue(document.getElementById("purch_itemsReturned").value),
            discountPerc: buildValue(document.getElementById("purch_discountPerc").value),
            amount: buildValue(document.getElementById("purch_amount").value),
            returnsAmount: buildValue(document.getElementById("purch_returns").value)
        };

        // Send payload
        _ws.send(JSON.stringify({
            key: "ADD_PURCHASE",
            payload: payload
        }));
    });

// Getters
    document.getElementById("btnGetCat").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }
        _ws.send(JSON.stringify({
            key: "GET_CATEGORY",
            payload: {
                categoryId: buildValue(document.getElementById("cat_id_get").value, "Bytes32")
            }
        }));
    });
    document.getElementById("btnGetSupplier").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "GET_SUPPLIER",
            payload: {
                supplierId: buildValue(document.getElementById("sup_id_get").value, "Bytes32")
            }
        }));
    });
    document.getElementById("btnGetProd").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "GET_PRODUCT",
            payload: {
                categoryId: buildValue(document.getElementById("prod_id_get").value, "Bytes32")
            }
        }));
    });
    document.getElementById("btnGetPurchase").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "GET_PURCHASE",
            payload: {
                purchaseId: buildValue(document.getElementById("purch_id_get").value),
                transactionId: buildValue(document.getElementById("purch_tx_id_get").value)
            }
        }));
    });
    document.getElementById("btnGetTransaction").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "GET_TRANSACTION",
            payload: {
                transactionId: buildValue(document.getElementById("tx_id_get").value)
            }
        }));
    });

    // Length Getters
    document.getElementById("categoriesCount").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "CATEGORIES_LENGTH"
        }));
    });
    document.getElementById("suppliersCount").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "SUPPLIERS_LENGTH"
        }));
    });
    document.getElementById("productsCount").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "PRODUCTS_LENGTH"
        }));
    });
    document.getElementById("txsCount").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "TRANSACTION_LENGTH"
        }));
    });

    // Display all of X
    document.getElementById("btnGetTransactionAll").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "TRANSACTIONS_ALL"
        }));
    });
    document.getElementById("btnGetSupplierAll").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "SUPPLIERS_ALL"
        }));
    });
    document.getElementById("btnGetProdAll").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "PRODUCTS_ALL"
        }));
    });
    document.getElementById("btnGetCatAll").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "CATEGORIES_ALL"
        }));
    });
    document.getElementById("btnUpdateTransactions").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "UPDATE_TRANSACTION_LIST"
        }));
    });
    document.getElementById("btnUpdateTransactionsOutside").addEventListener("click", function () {
        if (_ws == null) {
            alert("Websocket not connected");
            console.error("Websocket not connected");
            return;
        }

        _ws.send(JSON.stringify({
            key: "UPDATE_TRANSACTION_LIST_OBFUSCATED"
        }));
    });
};