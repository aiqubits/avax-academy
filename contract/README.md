# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
npx hardhat ignition deploy ./ignition/modules/Token.js --network customize

```

## build

```shell
export RPC_URL=https://sepolia.infura.io/v3/7cb673f9a1324974899fc4cd4429b450 
export RPC_URL=https://evmrpc-testnet.0g.ai
export RPC_URL=http://127.0.0.1:42203/ext/bc/2ip2zuU7TVnMRximYcXydPSxSvNtfkdn32AVRYZo5wnSD1D5gT/rpc
export PRIVATE_KEY=56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027

# https://16600.rpc.thirdweb.com
# https://rpc.ankr.com/0g_newton
# https://evmrpc-testnet.0g.ai

npx hardhat vars set RPC_URL

npx hardhat vars set PRIVATE_KEY

npx hardhat compile
```

## test

```shell
npx hardhat test
```

## clean
```
rm -rf ignition/deployments/*
```

## deploy

``` shell

# npx hardhat ignition deploy ./ignition/modules/ERC20Factory.ts --network customize
# npx hardhat ignition deploy ./ignition/modules/ERC721Factory.ts --network customize

npx hardhat run scripts/ERC20Factory.ts --network customize
npx hardhat run scripts/ERC721Factory.ts --network customize

curl -X POST --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0x2f045e265bc15005e3957f8ee2b33c4ef3b957e98123e623287c06bcf125d1da"],"id":1}' -H "Content-Type: application/json" http://127.0.0.1:42203/ext/bc/2ip2zuU7TVnMRximYcXydPSxSvNtfkdn32AVRYZo5wnSD1D5gT/rpc

```
