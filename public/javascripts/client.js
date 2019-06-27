let _ws = new WebSocket("_ws://localhost:8443");
let wss = null;
let eventTextBox = document.getElementById("eventsTextArea");

function buildValue(value, format) {
    return (format)
        ? {value: value, format: format}
        : {value: value};

}

_ws.on('connection', (_wss) => {
    console.log("Connected to _ws://localhost:8443");
    // store reference to connected websocket
    wss = _wss;

    _wss.on('message', (message) => {
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
            if (m.status !== "ok") {
                console.log("An error occurred");
                console.log(m.message);
                alert("Error:\n" + m.message);
                return;
            }

            // on success
            /*
            Format
            {
                "status": "ok",
                "payload": (payload)
            }*/
            // Get payload
            m = m.payload;

            /*
            Format
            {
                key: "someKey"
                value: (payload_data)
            }*/

            let key = m.key;
            let payloadData = m.payload_data;
            // Handle status ok
            switch (key) {
                case "event" : {
                    /*payload_data
                    {
                        "event":"eventName",
                        "data":"1234"
                    }
                    */
                    console.log("New Event [" + payloadData.event + "] received");
                    eventTextBox.innerHTML += "<p>" + payloadData.event + "</p>" +
                        "<p>" + payloadData.data + "</p>";
                    break;
                }

                case "transactions" : {
                    /*payload
                    {
                        "obfuscated":"true|false",
                        "transactions":[ {}, {}, {}, ...]
                    }
                    */
                    if (payloadData.obfuscated) {
                        console.log("Obfuscated Transaction List Update");
                        document.getElementById("transactionBox").value = JSON.stringify(payloadData.transactions);
                    } else {
                        console.log("Transaction List Update");
                        document.getElementById("transactionBoxOutside").value = JSON.stringify(payloadData.transactions);
                    }
                    break;
                }

                case "GET_PURCHASE": {
                    console.log("Received Purchase Response");
                    document.getElementById("purchDivResult").value = JSON.parse(payloadData);
                    break;
                }

                case "GET_SUPPLIER": {
                    console.log("Received Supplier Response");
                    document.getElementById("supDivResult").value = JSON.parse(payloadData);
                    break;
                }

                case "GET_TRANSACTION": {
                    console.log("Received Transaction Response");
                    document.getElementById("txDivResult").value = JSON.parse(payloadData);
                    break;
                }

                case "GET_PRODUCT": {
                    console.log("Received Product Response");
                    document.getElementById("prodDivResult").value = JSON.parse(payloadData);
                    break;
                }

                case "GET_CATEGORY": {
                    console.log("Received Category Response");
                    document.getElementById("catDivResult").value = JSON.parse(payloadData);
                    break;
                }

                default: {
                    console.log("Unknown Response: " + message);
                    alert("Unknown Response");
                    break;
                }
            }
        }
    });

    _ws.on('close', function () {
        console.log("Disconnected from server");
    })
});

// Adders
document.getElementById("btnAddCat").addEventListener("click", function () {
    if (wss == null) {
        alert("Websocket not connected");
        console.error("Websocket not connected");
        return;
    }

    // create payload
    var payload = {
        cat_id: buildValue(document.getElementById("cat_id").value, "Bytes32"),
        cat_name: buildValue(document.getElementById("cat_name").value),
        cat_desc: buildValue(document.getElementById("cat_desc").value)
    };

    // Send payload
    wss.send(JSON.stringify({
        key: "ADD_CATEGORY",
        payload: payload
    }));
});
document.getElementById("btnAddProd").addEventListener("click", function () {
    if (wss == null) {
        alert("Websocket not connected");
        console.error("Websocket not connected");
        return;
    }

    // create payload
    var payload = {
        prod_id: buildValue(document.getElementById("prod_id").value, "Bytes32"),
        prod_name: buildValue(document.getElementById("prod_name").value),
        prod_desc: buildValue(document.getElementById("prod_desc").value),
        prod_sup_id: buildValue(document.getElementById("prod_sup_id").value, "Bytes32"),
        prod_cat_id: buildValue(document.getElementById("prod_cat_id").value, "Bytes32"),
        prod_price: buildValue(Number(document.getElementById("prod_price").value))
    };

    // Send payload
    wss.send(JSON.stringify({
        key: "ADD_PRODUCT",
        payload: payload
    }));
});
document.getElementById("btnAddSupplier").addEventListener("click", function () {
    if (wss == null) {
        alert("Websocket not connected");
        console.error("Websocket not connected");
        return;
    }

    // create payload
    var payload = {
        sup_id: buildValue(document.getElementById("sup_id").value, "Bytes32"),
        sup_name: buildValue(document.getElementById("sup_name").value),
        sup_slogan: buildValue(document.getElementById("sup_slogan").value),
        sup_memberType: buildValue(document.getElementById("sup_memberType").value, "Bytes32"),
        sup_ckNumber: buildValue(document.getElementById("sup_ckNumber").value, "Bytes32"),
        sup_mobile: buildValue(document.getElementById("sup_mobile").value, "Bytes32"),
        sup_telephone: buildValue(document.getElementById("sup_telephone").value, "Bytes32"),
        sup_insta: buildValue(document.getElementById("sup_insta").value, "Bytes32"),
        sup_fb: buildValue(document.getElementById("sup_fb").value, "Bytes32"),
        sup_twitter: buildValue(document.getElementById("sup_twitter").value, "Bytes32")
    };

    // Send payload
    wss.send(JSON.stringify({
        key: "ADD_SUPPLIER",
        payload: payload
    }));
});

// Getters
document.getElementById("btnGetCat").addEventListener("click", function () {
    if (wss == null) {
        alert("Websocket not connected");
        console.error("Websocket not connected");
        return;
    }
    wss.send(JSON.stringify({
        key: "GET_CATEGORY",
        payload: {
            categoryId: buildValue(document.getElementById("cat_id_get").value, "Bytes32")
        }
    }));
});
document.getElementById("btnGetSupplier").addEventListener("click", function () {
    if (wss == null) {
        alert("Websocket not connected");
        console.error("Websocket not connected");
        return;
    }

    wss.send(JSON.stringify({
        key: "GET_SUPPLIER",
        payload: {
            supplierId: buildValue(document.getElementById("sup_id_get").value, "Bytes32")
        }
    }));
});
document.getElementById("btnGetProd").addEventListener("click", function () {
    if (wss == null) {
        alert("Websocket not connected");
        console.error("Websocket not connected");
        return;
    }

    wss.send(JSON.stringify({
        key: "GET_PRODUCT",
        payload: {
            categoryId: buildValue(document.getElementById("prod_id_get").value, "Bytes32")
        }
    }));
});

