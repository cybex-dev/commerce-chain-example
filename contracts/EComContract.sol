pragma solidity ^0.5.8;

contract CommerceChain {

    // ------------------------------------------------------
    // generic object events
    event onNewTransaction(uint transactionId);
    event onUpdatedTransaction(uint transactionId);
    event onNewPurchase(uint purchaseId);
    event onUpdatedPurchase(uint purchaseId);
    event onNewProduct(bytes32 productId);
    event onUpdatedProduct(bytes32 productId);
    event onNewCategory(bytes32 categoryId);
    event onUpdatedCategory(bytes32 categoryId);
    event onNewSupplier(bytes32 supplierId);
    event onUpdatedSupplier(bytes32 supplierId);
    event onTransactionStatusUpdate(uint transactionId, bytes32 oldStatus, bytes32 newStatus);
    event onTransactionRefunded(uint transactionId, uint amount);
    event onPurchaseReturned(uint purchaseId, uint transactionId, uint numItemsReturned, uint refundAmount);

    // ------------------------------------------------------
    // Blockchain variables
    address owner;
    bool enableSupplierViewAllTransactions;

    mapping (bytes32 => Category) categoryMapping;
    bytes32[] public categoryIndex;
    mapping (bytes32 => Supplier) supplierMapping;
    bytes32[] public supplierIndex;
    mapping (bytes32 => Product) productMapping;
    bytes32[] public productIndex;
    mapping (uint => Transaction) transactionMapping;
    uint[] public transactionIndex;

    // ------------------------------------------------------
    // Object structures
    struct Supplier {
        bytes32 id;
        string name;
        bytes32 memberType;
        bytes32 ckNumber;
        bytes32 mobile;
        bytes32 telephone;
        string slogan;
        bytes32 instagram;
        bytes32 facebook;
        bytes32 twitter;
    }

    struct Product {
        bytes32 id;
        string name;
        string description;
        bytes32 supplierId;
        bytes32 categoryId;
        uint price;
    }

    struct Purchase {
        uint id;
        bytes32 productID;
        uint quantity;
        bool onSale;
        uint itemsReturned;
        uint discountPerc;
        uint amount;
        uint returnsAmount;
    }

    struct Category {
        bytes32 id;
        string name;
        string description;
    }

    struct Transaction {
        uint id;
        mapping(uint => Purchase) purchasesMapping;
        uint[] purchasesIndex;
        uint timestamp;
        bytes32 status;
        uint totalAmount;
        uint discountPerc;
        bool refunded;
        uint refundedAmount;
    }


    // ------------------------------------------------------
    // Function modifier
    modifier isOwner(){
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier existsTransaction(uint id) {
        require(transactionMapping[id].id == id, "Transaction doesn't exist");
        _;
    }

    modifier existsPurchase(uint transactionId, uint purchaseId) {
        require(transactionMapping[transactionId].purchasesMapping[purchaseId].id == purchaseId, "Purchase doesn't exist");
        _;

    }

    modifier existsSupplier(bytes32 id) {
        require(supplierMapping[id].id == id, "Supplier doesn't exist");
        _;

    }

    modifier existsCategory(bytes32 id) {
        require(categoryMapping[id].id == id, "Category doesn't exist");
        _;

    }

    modifier existsProduct(bytes32 id) {
        require(productMapping[id].id == id, "Product doesn't exist");
        _;

    }

    modifier notExistsTransaction(uint id) {
        require(transactionMapping[id].id != id, "Transaction already exists");
        _;
    }

    modifier notExistsPurchase(uint transactionId, uint purchaseId) {
        require(transactionMapping[transactionId].purchasesMapping[purchaseId].id != purchaseId, "Purchase already exists");
        _;

    }

    modifier notExistsSupplier(bytes32 id) {
        require(supplierMapping[id].id != id, "Supplier already exists");
        _;

    }

    modifier notExistsCategory(bytes32 id) {
        require(categoryMapping[id].id != id, "Category already exists");
        _;

    }

    modifier notExistsProduct(bytes32 id) {
        require(productMapping[id].id != id, "Product already exists");
        _;

    }


    modifier canSupplierView(bytes32 supplierId, uint transactionId) {
        bool exists = false;
        if(enableSupplierViewAllTransactions) {
            _;
        } else {
            for(uint i = 0; i < transactionMapping[transactionId].purchasesIndex.length; i++) {
                if (getTransactionPurchaseSupplier(transactionId, transactionMapping[transactionId].purchasesIndex[i]) == supplierId) {
                    exists = true;
                    break;
                }
            }

            require(exists, "Not allowed to view transaction");
        }

    }

    // ------------------------------------------------------
    // Modifier assisting functions
    function getTransactionPurchaseSupplier(uint transactionId, uint purchaseId) view internal existsTransaction(transactionId) existsPurchase(transactionId, purchaseId) returns (bytes32 supplierId) {
        return productMapping[transactionMapping[transactionId].purchasesMapping[purchaseId].productID].supplierId;
    }

    // ------------------------------------------------------
    // Default methods
    constructor() public payable {
        owner = msg.sender;
    }

    function() external payable {

    }

    // ------------------------------------------------------
    // Get array lengths
    function getTransactionLength() isOwner public view returns (uint){
        return transactionIndex.length;
    }

    function getPurchasesLength(uint transactionId) isOwner public view returns (uint){
        return transactionMapping[transactionId].purchasesIndex.length;
    }

    function getPurchasesIndex(uint transactionId) isOwner public view returns (uint[] memory purchasesIndex){
        return transactionMapping[transactionId].purchasesIndex;
    }

    function getProductsLength() isOwner public view returns (uint){
        return productIndex.length;
    }

    function getSuppliersLength() isOwner public view returns (uint){
        return supplierIndex.length;
    }

    function getCategoryLength() isOwner public view returns (uint){
        return categoryIndex.length;
    }

    // ------------------------------------------------------
    // Get Objects
    function getTransaction(uint transactionId) public isOwner existsTransaction(transactionId) view returns(uint id, uint[] memory purchasesIndex, uint timestamp, bytes32 status, uint totalAmount, uint discountPerc, bool refunded, uint refundedAmount) {
        Transaction storage transaction = transactionMapping[transactionId];
        return (
        transaction.id,
        transaction.purchasesIndex,
        transaction.timestamp,
        transaction.status,
        transaction.totalAmount,
        transaction.discountPerc,
        transaction.refunded,
        transaction.refundedAmount
        );
    }

    function getPurchase(uint transactionId, uint purchaseId) public isOwner existsPurchase(transactionId, purchaseId) view returns(uint id, bytes32 productID, uint quantity, bool onSale, uint itemsReturned, uint discountPerc, uint amount, uint returnsAmount) {
        Purchase storage purchase = transactionMapping[transactionId].purchasesMapping[purchaseId];
        return (
        purchase.id,
        purchase.productID,
        purchase.quantity,
        purchase.onSale,
        purchase.itemsReturned,
        purchase.discountPerc,
        purchase.amount,
        purchase.returnsAmount
        );
    }

    function getProduct(bytes32 productId) public existsProduct(productId) isOwner view returns(bytes32 id, string memory name, string memory description, bytes32 supplierId, bytes32 categoryId, uint price) {
        Product storage product = productMapping[productId];
        return (
        product.id,
        product.name,
        product.description,
        product.supplierId,
        product.categoryId,
        product.price
        );
    }

    function getSupplier(bytes32 supplierId) public existsSupplier(supplierId) isOwner view returns(bytes32 id, string memory name, bytes32 memberType, bytes32 ckNumber, bytes32 mobile, bytes32 telephone, string memory slogan, bytes32 instagram, bytes32 facebook, bytes32 twitter) {
        Supplier storage supplier = supplierMapping[supplierId];
        return (
        supplier.id,
        supplier.name,
        supplier.memberType,
        supplier.ckNumber,
        supplier.mobile,
        supplier.telephone,
        supplier.slogan,
        supplier.instagram,
        supplier.facebook,
        supplier.twitter
        );
    }

    function getCategory(bytes32 categoryId) public existsCategory(categoryId) isOwner view returns(bytes32 id, string memory name, string memory description) {
        return (
        categoryMapping[categoryId].id,
        categoryMapping[categoryId].name,
        categoryMapping[categoryId].description
        );
    }

    // ------------------------------------------------------
    // Set/Update Objects

    function setTransaction(uint id, uint _timestamp, bytes32 _status, uint _totalAmount, uint _discountPerc, bool _refunded, uint _refundedAmount) public isOwner existsTransaction(id) {
        transactionMapping[id].timestamp = _timestamp;
        transactionMapping[id].status = _status;
        transactionMapping[id].totalAmount = _totalAmount;
        transactionMapping[id].discountPerc = _discountPerc;
        transactionMapping[id].refunded = _refunded;
        transactionMapping[id].refundedAmount = _refundedAmount;
        emit onUpdatedTransaction(id);
    }

    function setPurchase(uint id, uint transactionId, bytes32 _productID, uint _quantity, bool _onSale, uint _itemsReturned, uint _discountPerc, uint _amount, uint _returnsAmount) public isOwner existsPurchase(transactionId, id) {
        transactionMapping[transactionId].purchasesMapping[id].productID = _productID;
        transactionMapping[transactionId].purchasesMapping[id].quantity = _quantity;
        transactionMapping[transactionId].purchasesMapping[id].onSale = _onSale;
        transactionMapping[transactionId].purchasesMapping[id].itemsReturned = _itemsReturned;
        transactionMapping[transactionId].purchasesMapping[id].discountPerc = _discountPerc;
        transactionMapping[transactionId].purchasesMapping[id].amount = _amount;
        transactionMapping[transactionId].purchasesMapping[id].returnsAmount = _returnsAmount;
        emit onUpdatedPurchase(id);
    }

    function setProduct(bytes32 id, string memory _name, string memory _description, bytes32 _supplierId, bytes32 _categoryId, uint _price) public isOwner existsProduct(id) {
        productMapping[id].name = _name;
        productMapping[id].description = _description;
        productMapping[id].categoryId = _categoryId;
        productMapping[id].supplierId = _supplierId;
        productMapping[id].price = _price;
        emit onUpdatedProduct(id);
    }

    function setSupplier(bytes32 id, string memory _name, bytes32 _memberType, bytes32 _ckNumber, bytes32 _mobile, bytes32 _telephone, string memory _slogan, bytes32 _instagram, bytes32 _facebook, bytes32 _twitter) public isOwner existsSupplier(id) {
        supplierMapping[id].name = _name;
        supplierMapping[id].memberType = _memberType;
        supplierMapping[id].ckNumber = _ckNumber;
        supplierMapping[id].mobile = _mobile;
        supplierMapping[id].telephone = _telephone;
        supplierMapping[id].slogan = _slogan;
        supplierMapping[id].instagram = _instagram;
        supplierMapping[id].facebook = _facebook;
        supplierMapping[id].twitter = _twitter;
        emit onUpdatedSupplier(id);
    }

    function setCategory(bytes32 id, string memory _name, string memory _description) public isOwner existsCategory(id) {
        categoryMapping[id].name = _name;
        categoryMapping[id].description = _description;
        emit onUpdatedCategory(id);
    }

    // ------------------------------------------------------
    // Add Objects
    function addTransaction(uint id, uint _timestamp, bytes32 _status, uint _totalAmount, uint _discountPerc, bool _refunded, uint _refundedAmount) public isOwner notExistsTransaction(id) {
        transactionMapping[id] = Transaction(id, new uint[](0), _timestamp, _status, _totalAmount, _discountPerc, _refunded, _refundedAmount);
        transactionIndex.push(id);
        emit onNewTransaction(id);
    }

    function addPurchase(uint id, uint transactionId, bytes32 _productID, uint _quantity, bool _onSale, uint _itemsReturned, uint _discountPerc, uint _amount, uint _returnsAmount) public isOwner existsTransaction(transactionId) notExistsPurchase(transactionId, id) {
        transactionMapping[transactionId].purchasesIndex.push(id);
        transactionMapping[transactionId].purchasesMapping[id] = Purchase(id, _productID, _quantity, _onSale, _itemsReturned, _discountPerc, _amount, _returnsAmount);
        emit onNewPurchase(id);
    }

    function addProduct(bytes32 id, string memory _name, string memory _description, bytes32 _supplierId, bytes32 _categoryId, uint _price) public isOwner notExistsProduct(id) {
        productIndex.push(id);
        productMapping[id] = Product(id, _name, _description, _supplierId, _categoryId, _price);
        emit onNewProduct(id);
    }

    function addSupplier(bytes32 id, string memory _name, bytes32 _memberType, bytes32 _ckNumber, bytes32 _mobile, bytes32 _telephone, string memory _slogan, bytes32 _instagram, bytes32 _facebook, bytes32 _twitter) public isOwner notExistsSupplier(id) {
        supplierIndex.push(id);
        supplierMapping[id] = Supplier(id, _name, _memberType, _ckNumber, _mobile, _telephone, _slogan, _instagram, _facebook, _twitter);
        emit onNewSupplier(id);
    }

    function addCategory(bytes32 id, string memory _name, string memory _description) public isOwner notExistsCategory(id) {
        categoryMapping[id] = Category(id, _name, _description);
        categoryIndex.push(id);
        emit onNewCategory(id);
    }

    function updateTransactionStatus(uint transactionId, bytes32 newValue) public isOwner existsTransaction(transactionId){
        bytes32 oldValue = transactionMapping[transactionId].status;
        transactionMapping[transactionId].status = newValue;
        emit onTransactionStatusUpdate(transactionId, oldValue, newValue);
    }

    function refundTransaction(uint transactionId, uint amount) public isOwner existsTransaction(transactionId) {
        transactionMapping[transactionId].refunded = true;
        transactionMapping[transactionId].refundedAmount += amount;
        emit onTransactionRefunded(transactionId, amount);
    }

    function returnedPurchase(uint transactionId, uint purchaseId, uint _refundAmount, uint _numItems) public isOwner existsTransaction(transactionId) existsPurchase(transactionId, purchaseId)  {
        transactionMapping[transactionId].purchasesMapping[purchaseId].itemsReturned += _numItems;
        transactionMapping[transactionId].purchasesMapping[purchaseId].returnsAmount += _refundAmount;
        emit onPurchaseReturned(purchaseId, transactionId, _numItems, _refundAmount);
    }

    function setEnableSupplierViewAllTransactions(bool enable) isOwner public {
        enableSupplierViewAllTransactions = enable;
    }
}