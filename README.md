# Introduction
This shows how simple it is to write a basic Web3 JSON RPC server that can accept JSON RPC calls, and returns the results by calling a public Avalanche node to get the results and returns them to the caller.

The BaseJsonRpcServer has been incorporated into the DelphiRTL repository.

In order to run this, 
* run the run.cmd, or alternatively, 
* run ts-node ./runWeb3BalanceServer.ts

Note: A configuration file must be created.
The configuration file needs to be named .env and needs to contain wssUrl with the value being the URL to use.

Eg, 
.env   
wssUrl=wss://blahblahblah/9234098230482304   


JSON RPC commands can be sent either using curl, or Postman, depending on the user's preference.

# Tests

Send the following JSON RPC messages:

* To get balance:
```
{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "getBalance",
    "params": 
        "0x56Eddb7aa87536c09CCc2793473599fD21A8b17F"
}
```
* To get asset ID:
```
{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "getAssetID",
    "params": ["0"]
}
```
