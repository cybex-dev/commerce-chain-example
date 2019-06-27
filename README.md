## Blockchain Ecommerce module ###
The ecommerce blockchain interface allows interacting with the blockchain via an interface.

#####Definitions:
- *wallet and account* refer to the same thing, and can be used interchangeably
- *gas*: is a representation of computing power used to perform some action. Actions which require gas are actions such as deploying a new contract, or altering any data on the contract. The normal 'getters' do not use gas if they are pure (i.e. the simple getters where absolutely no more processing is done than saying ```return localVariable```)

### Requirements:
- NodeJS - install the (latest) NodeJS for your Operating System.
- Ganache (as a local blockchain provider) - https://github.com/trufflesuite/ganache/releases/download/v2.0.1/Ganache-2.0.1-setup.exe

##Features:
- Store all you contracts in the ```contract/``` folder. All contracts here will be compiled into a JSon file and stored in the ```build/``` when completed. Each contract is store with the following format: ```${contract-name}.sol```
- Accounts are managed by the interface. You can set the account you wish to use in the configuration file ```app_config.json```, or the interface can manually create an account on the first run. *This will require user interaction*.
- An account topup feature is included. The account/wallet address and password can also be stored in the configuration file ```app_config.json``` 

### Configuration
The configuration file has the following JSon format:
```
{
  "secret": {
    "private_key": "",
    "password": ""
  },
  "wallet": {
    "address": "",
    "unlockDuration": "30"
  },
  "topUp": {
    "address": "",
    "password": "",
    "enable": "true",
    "amount": "20"
  },
  "provider": {
    "protocol": "ws",
    "address": "0.0.0.0",
    "method": "",
    "port": "8545",
    "usesWebsocket": "true"
  },
  "contract": {
    "contractName": "ContractName",
    "deployAddress": "",
    "deployGas": "6000000",
    "transactionGas": "3000000"
  },
  "debug": "yes"
}
```

#### Secret
This is where the wallet/account you are using for deploying the contract (which becomes the contract owner) is saved.
- private_key: this is the wallet/account's private key
- password: this is the wallet/account's password

**Note: do not give this info out to anyone. Also, make a backup of this. If you lose this, you cannot recover it, and any published contracts will become useless**

#### Wallet
The wallet contains information which can be publicly available.
- address: the wallet address (aka public address) which everyone can and will see when a transaction is completed by this wallet.
- unlockDuration: when a transaction is sent to the blockchain, to add or update a field(s) on the blockchain or even to transfer funds from one account to another or to a contract, the account needs to be unlocked. This time is in seconds.

####TopUp
Topup is used to ensure that the wallet that is being used for all the transactions does not run out of funds. If it does, then a transaction from the topup wallet is done to ensure continued use of the application.
- address: public/wallet address
- password: password of wallet to unlock wallet, it is lock immediately after transferring funds.
- enable: enable the ability to topup
- amount: the topup amount on each topup instance

**Note: if you ever get a message like Account does not exist. This means in the provider you are using, the account (topup wallet most likely) does not exist. In future, support (can/will) be added.**

#### Provider
The provider is the means of communicating with the blockchain. The blockchain can be a public blockchain used by all such as ```testrpc```, ```Rinkby```, or ```mainnet```, or a local blockchain such as ```Ganache```.
- usesWebsocket: true if using the websocket provider (preferred over http), or false if using not using web sockets
- protocol: protocol used to connect to the network. Suggested to use WebSockets provider ```ws```, as using Http provider```http``` will prevent the use of events.
- address: the ip address or domain of the provider
- port: port used by provider
- method: if using a public provider, you may be required be given an API key, which is secret. The format for the extension or method call for each provider may be different.

```
e.g. wss://infura.com:12345/api/user?token=12345657890
     ^_^   ^________^ ^___^^_________________________^ 
 protocol    domain    port       method
 ```
 or
 ```
 e.g. ws://0.0.0.0:8545
      ^_^^________^^__^ 
  protocol   ip    port
  ```
  
**Note: If fields are missing such as method for a localhost ganache session, leave them blank in the configuration file**

#### Contract
This stores information about the contract and deployment/utilization options
- contractName: the name of the contract you wish to deploy. This is the actual contract name as specified in the contract implementation (and the file name of the compiled contract in the ```build/``` folder).
- deployGas: gas used to deploy contract. Leave this at about 6000000. The unused gas is returned.
- transactionGas: gas used when performing a state-altering transaction (or money transfer).
- deployAddress: the address where the contract is going to be deployed. 

**ote: if you wish to redeploy the contract, clear this field to make it blank. Alternatively, if you wish to reconnect to an old contract, place the contract deployed address in here. This assumes the web interface is compatible with the contract.**

## How To Use:
###1. Import:
Import the blockchain module (assuming it is the current module folder) with

```
const _contractInterface = require('./interface');      // used to interact with contract
const _web3Helper = require('./web3-helper');           // helper functions and utilies
```

###2. Initialize Blockchain 
Initialize the contract which compiles all contracts, creates/imports/access account to deploy contract from, and finally deploy or acquire the contract

```_contractInterface.init(callback);```

###3. Get instance
Get contract instance.

```const blockchain = _contractInterface.getContractInterface()```

###4. Start using blockchain

###4.1 Events
Subscribe to an event. Currently, only one event callback is supported. This can however be extended using the EventEmitter. This is left to custom implementations.

```_contractInterface.subscribeToEvent(_contractInterface.EventType, callback)```

Unsubscribe to an event

```_contractInterface.unsubscribeToEvent(_contractInterface.EventType)```

**Note: see EventType for a list of all events**
###4.2 Call Functions
Call functions on contract:

```contractInterface.getCategoryLength(callback)```

#### Functions 
- ```getCategoryLength```: number of categories 
- ```getProductsLength```: number of products
- ```getTransactionLength```:  number of transactions
- ```getSuppliersLength```: number of suppliers
- ```getPurchasesLength```: number of purchases per transaction
- ```getPurchasesIndex```: index of all purchases per transaction
- ```getTransactionIndex```: index of all tranasctions 
- ```getProductIndex```: index of all products
- ```getSuppliersIndex```: index of all suppliers
- ```getCategoryIndex```: index of all categories
- ```getTransaction```: get a transaction object
- ```getPurchase```: get a purchase object
- ```getProduct```:  get a product object
- ```getSupplier```:  get a supplier object
- ```getCategory```:  get a category object
- ```checkTransactionExists```:  checks if a transaction exists
- ```checkPurchaseExists```: checks if a purchase from a transction exists
- ```checkProductExists```: checks if a product exists
- ```checkSupplierExists```: checks if a supplier exists
- ```checkCategoryExists```: checks if a category exists
- ```getAllTransactions```: get all transactions on blockchain
- ```getAllPurchases```: get all purchases per transactions on blockchain
- ```getAllProducts```: get all products on blockchain
- ```getAllSuppliers```: get all suppliers on blockchain
- ```getAllCategories```: get all categories on blockchain
- ```setTransaction```: update a transaction
- ```setPurchase```: update a purchase of transaction
- ```setProduct```: update a product
- ```setSupplier```: update a supplier
- ```setCategory```: update a category
- ```addTransaction```: add a transaction
- ```addPurchase```: add a purchase
- ```addProduct```: add a product
- ```addSupplier```: add a supplier
- ```addCategory```: add a category
- ```updateTransactionStatus```:  updates a transaction's status
- ```refundTransaction```: refund a transaction (beta)
- ```returnedPurchase```: return items from a purchase (beta)
- ```setEnableSupplierViewAllTransactions```: enable all suppliers to view all transactions, or only transactions where they are part of in terms of their products being purchased

#### EventType
 - ```eventNewTransaction```
 - ```eventUpdatedTransaction```
 - ```eventNewPurchase```
 - ```eventUpdatedPurchase```
 - ```eventNewProduct```
 - ```eventUpdatedProduct```
 - ```eventNewCategory```
 - ```eventUpdatedCategory```
 - ```eventNewSupplier```
 - ```eventUpdatedSupplier```
 - ```eventTransactionStatusUpdate```
 - ```eventTransactionRefunded```
 - ```eventPurchaseReturned```
 