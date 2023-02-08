import { Web3JsonRpcServer } from "./Web3BalanceServer";

(async function () {
    const rpcServer = new Web3JsonRpcServer();
    await rpcServer.listen(8080);
})();
