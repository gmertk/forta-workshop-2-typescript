# Uniswap High Flash Swap

## Description

Following "Forta Agent Development Workshop #2, an example Walkthrough" at  https://www.youtube.com/watch?v=Xd6K3QB_JcY

> Create an alert whenever a flash swap occurs worth more than 100K USD on Uniswap V3 Pools

## Supported Chains

- Ethereum


## Alerts

Describe each of the type of alerts fired by this agent

- AE-FORTA-WORKSHOP2-UNISWAPV3-LARGE-FLASH-SWAP
  - Fired on any Flash event from a Uniswap V3 Pool contract with USD value exceeding the threshold specified in agent-config.json
  
## Test Data

The agent behaviour can be verified with the following transactions:

- 0x6677c6fcb786dd45a99c8a0e14dec98f8c36eaba498519c043fdf9e12067122c


We can find some flash swaps with the following code:
```
async function getFlashSwaps(provider: ethers.providers.Provider) {
  const filter = {
    fromBlock: 12369739,
    toBlock: 'latest',
    topics: [
      '0xbdbdb71d7860376ba52b25a5028beea23581364a40522f6bcfb86bb1f2dca633',
    ],
  };

  const logs = await provider.getLogs(filter);

  logs.forEach((log) => {
    console.log(log.transactionHash);
  });
}

// call in handler
const provider = new ethers.providers.JsonRpcBatchProvider(getJsonRpcUrl());
await getFlashSwaps(provider);
```

## Links
- https://docs.uniswap.org/
- https://github.com/Uniswap/v3-core
- https://github.com/Uniswap/v3-periphery/blob/main/deploys.md
