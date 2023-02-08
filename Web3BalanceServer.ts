import { BaseJsonRpcServer, JSONRPCErrorException, JSONRPCParameters, SimpleJSONRPCMethod } from "../BaseJsonRpcServer/BaseJsonRpcServer";
import { BigNumber, ethers } from "ethers";
import * as dotenv from 'dotenv';
import { evm, avm, platformvm, Avalanche, BinTools, Buffer } from "avalanche";
import assert from 'node:assert/strict';

// See https://stackoverflow.com/questions/47375916/typescript-how-to-create-type-with-common-properties-of-two-types
type CommonMethodsOrProperties<A, B, C> = {
    [P in keyof A & keyof B & keyof C]: A[P] | B[P] | C[P];
}

function UNUSED(...x: any) {}

type AvalancheCommonAPI = CommonMethodsOrProperties<evm.EVMAPI, platformvm.PlatformVMAPI, avm.AVMAPI>;
class Web3JsonRpcServer extends BaseJsonRpcServer {

    protected mProvider: ethers.providers.BaseProvider | undefined;
    protected mAvax: Avalanche;
    protected mAvaxC: evm.EVMAPI;
    protected mAvaxP: platformvm.PlatformVMAPI;
    protected mAvaxX: avm.AVMAPI;

    constructor() {
        super();
        const env = dotenv.config();
        const WebSocketURL = env.parsed?.wssUrl || "";
        this.mProvider = ethers.providers.getDefaultProvider(WebSocketURL);
        this.mAvax = new Avalanche("avalanche-mainnet-rpc.allthatnode.com", undefined, "https");
        this.mAvaxC = this.mAvax.CChain();
        this.mAvaxP = this.mAvax.PChain();
        this.mAvaxX = this.mAvax.XChain();
        let commonMethodsOrProperties = this.mAvaxC;
        
    }

    override get listeningPath() {
        return "/web3/";
    }

    /**
     * Returns JSON RPC methods implemented
     *
     * @returns {} The JSON RPC methods implemented by this class
     */
    override implementedRPCMethods(): SimpleJSONRPCMethod<void>[] {
        return [
            this.getAssetID, this.getAvaxBalance,
            // this.getCBalance,
            this.getBalance, this.getPBalance, this.getXBalance, this.getXBalanceAsset
        ];
    }

    isAddress(addr: string): boolean {
       const result = ethers.utils.isAddress(addr);
       return result;
    }

    async getBalance(params: JSONRPCParameters) {
        let result: BigNumber = BigNumber.from(0);
        let validAddress = false;
        let addr = "";
        try {
            if (Array.isArray(params)) {
                addr = params[0];
            } else if (typeof params === "string"){
                addr = params;
            }
            validAddress = this.isAddress(addr);
            if (!validAddress) {
                throw this.createInvalidAddress(addr); // this will go into catch which will throw the error again
            }
            result = await this.mProvider!.getBalance(addr);
            this.log(`Balance for ${addr} is: ${result}.`);
            return result;
        } catch(e) {
            switch(true) {
                case e instanceof JSONRPCErrorException: {
                    this.log(`Invalid address: ${(e as any).data}`);
                    throw e;
                }
                default: {
                    throw this.createInvalidParams();
                }
            }
        }
    }

    isValidArray(params: JSONRPCParameters): asserts params is Array<string> {
        UNUSED(params);
    }

    protected AssetIDToString(decodedAssetID: Buffer): string {
        const bintools = BinTools.getInstance();
        const result = bintools.cb58Encode(decodedAssetID);
        return result;
    }

    async getAssetID(params: JSONRPCParameters) {
        UNUSED(params);
        const decodedAssetID = await this.mAvaxC.getAVAXAssetID();
        const result = this.AssetIDToString(decodedAssetID);
        return result;
    }

    // async getCBalance(params: JSONRPCParameters) {
    //     this.isValidArray(params);
    //     const addr = params[0];
    //     const result = await this.mAvaxC.getAssetBalance();
    //     return result;
    // }

    async getAvaxBalance(params: JSONRPCParameters) {
        this.isValidArray(params);
        const addr = params[0];
        const PAddr = `P-${addr}`;
        // const XAddr = `X-${addr}`;
        // const buffer = await this.mAvaxX.getAVAXAssetID();
        // const assetID = this.AssetIDToString(buffer);
        const result = await this.mAvaxP.getBalance(PAddr);
        return result;
    }

    async getPBalance(params: JSONRPCParameters) {
        this.isValidArray(params);
        const addr = params[0];
        const result = await this.mAvaxP.getBalance(addr);
        return result;
    }

    async getXBalance(params: JSONRPCParameters) {
        this.isValidArray(params);
        const addr = params[0];
        const assetID = params.length >=2 ? params[1]: this.AssetIDToString(await this.mAvaxX.getAVAXAssetID());
        const result = await this.mAvaxX.getBalance(addr, assetID);
        return result;
    }

    // P-avax1tnuesf6cqwnjw7fxjyk7lhch0vhf0v95wj5jvy

    async getXBalanceAsset(params: JSONRPCParameters) {
        this.isValidArray(params);
        assert.ok(params.length >= 2, "Insufficient parameters!");
        const addr = params[0];
        const assetID = params[1];
        const result = await this.mAvaxX.getBalance(addr, assetID);
        return result;
    }

    createInvalidAddress(data?: any): JSONRPCErrorException {
        const error = this.createInvalidParamsMessage("Invalid address", data);
        return error;
    }

}

export {
    Web3JsonRpcServer
}
























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































/*
Chee-Wee Chua,
Nov 2022,
Singapore
*/
