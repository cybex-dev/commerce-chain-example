pragma solidity ^0.5.8;

contract CommerceChainTest {

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
    mapping (bytes32 => Product) productMapping;
    bytes32[] public productIndex;

    struct Product {
        bytes32 id;
        string name;
        string description;
        bytes32 supplierId;
        bytes32 categoryId;
        uint price;
    }

    // Function modifier
    modifier isOwner(){
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier existsProduct(bytes32 id) {
        require(productMapping[id].id == id, "Product doesn't exist");
        _;

    }

    modifier notExistsProduct(bytes32 id) {
        require(productMapping[id].id != id, "Product already exists");
        _;

    }

    // ------------------------------------------------------
    // Default methods
    constructor() public payable {
        owner = msg.sender;
    }

    function() external payable {

    }

    // ------------------------------------------------------
    function getProductsLength() isOwner public view returns (uint){
        return productIndex.length;
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

    function setProduct(bytes32 id, string memory _name, string memory _description, bytes32 _supplierId, bytes32 _categoryId, uint _price) public isOwner existsProduct(id) {
        //productMapping[id].name = _name;
        //productMapping[id].description = _description;
        //productMapping[id].categoryId = _categoryId;
        //productMapping[id].supplierId = _supplierId;
        //productMapping[id].price = _price;
        emit onUpdatedProduct(id);
    }

    function addProduct(bytes32 id, string memory _name, string memory _description, bytes32 _supplierId, bytes32 _categoryId, uint _price) public isOwner notExistsProduct(id) {
        productIndex.push(id);
        //productMapping[id] = Product(id, _name, _description, _supplierId, _categoryId, _price);
        emit onNewProduct(id);
    }
}