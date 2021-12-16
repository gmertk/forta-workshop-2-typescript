# High Gas Agent

## Description

Following "Forta Agent Development Workshop #2, an example Walkthrough" at  https://www.youtube.com/watch?v=Xd6K3QB_JcY

> Create an alert whenever a flash swap occurs worth more than 100K USD on Uniswap V3 Pools

## Supported Chains

- Ethereum


## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-1
  - Fired when a transaction consumes more gas than 1,000,000 gas
  - Severity is always set to "medium" (mention any conditions where it could be something else)
  - Type is always set to "suspicious" (mention any conditions where it could be something else)
  - Mention any other type of metadata fields included with this alert

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x1b71dcc24657989f920d627c7768f545d70fcb861c9a05824f7f5d056968aeee (1,094,700 gas)
- 0x8df0579bf65e859f87c45b485b8f1879c56bc818043c3a0d6870c410b5013266 (2,348,226 gas)

## Links
- https://docs.uniswap.org/
- https://github.com/Uniswap/v3-core
- https://github.com/Uniswap/v3-periphery/blob/main/deploys.md
