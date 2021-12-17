/* eslint-disable no-console */
import BigNumber from 'bignumber.js';
import {
  getJsonRpcUrl,
  Finding,
  FindingSeverity,
  FindingType,
  TransactionEvent,
} from 'forta-agent';
import { ethers } from 'ethers';

import config from '../agent-config.json';
import contractAddresses from '../contract-addresses.json';
import { abi as factoryAbi } from '../abi/UniswapV3Factory.json';
import { abi as poolAbi } from '../abi/UniswapV3Pool.json';
import { getValue, getTokenPrices } from './utils';

type InitializeData =
  | {
      everestId: string;
      provider: ethers.providers.JsonRpcBatchProvider;
      factoryContract: ethers.Contract;
      flashSwapThresholdUSDBN: BigNumber;
      poolAbi: typeof poolAbi;
    }
  | Record<string, never>;

type FlashSwapData = {
  address: string;
  amount0BN: BigNumber;
  amount1BN: BigNumber;
  sender: any;
  value0USDBN: BigNumber;
  value1USDBN: BigNumber;
};

const initializeData: InitializeData = {};

function provideInitialize(data: InitializeData) {
  return async function initalize() {
    data.everestId = config.EVEREST_ID;
    data.provider = new ethers.providers.JsonRpcBatchProvider(getJsonRpcUrl());
    data.factoryContract = new ethers.Contract(
      contractAddresses.UniswapV3Factory.address,
      factoryAbi,
      data.provider
    );
    data.flashSwapThresholdUSDBN = new BigNumber(
      config.largeFlashSwap.thresholdUSD
    );
    data.poolAbi = poolAbi;
  };
}

function provideHandleTransaction(data: InitializeData) {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    const {
      everestId,
      poolAbi,
      provider,
      factoryContract,
      flashSwapThresholdUSDBN,
    } = data;

    if (!factoryContract) {
      throw new Error('factoryContract is not initialized');
    }

    if (!poolAbi) {
      throw new Error('poolAbi is not initialized');
    }

    const flashSignature =
      'Flash(address,address,uint256,uint256,uint256,uint256)';
    const flashSwapLogs = txEvent.filterEvent(flashSignature);

    if (flashSwapLogs.length === 0) {
      return findings;
    }

    const flashSwapPromises = flashSwapLogs.map(async (log) => {
      const { address, data: eventData, topics } = log;

      const poolContract = new ethers.Contract(address, poolAbi, provider);

      let token0;
      let token1;

      try {
        token0 = await poolContract.token0();
        token1 = await poolContract.token1();
        const fee = await poolContract.fee();

        const expectedAddress = await factoryContract.getPool(
          token0,
          token1,
          fee
        );

        if (address.toLowerCase() !== expectedAddress.toLowerCase()) {
          return undefined;
        }
      } catch (e) {
        return undefined;
      }

      const { token0Price, token1Price } = await getTokenPrices(token0, token1);

      // parse the information from the flash swap
      const {
        args: { sender, amount0, amount1 },
      } = poolContract.interface.parseLog({
        data: eventData,
        topics,
      });

      // convert from ethers.js BigNumber to BigNumber.js
      const amount0BN = new BigNumber(amount0.toHexString());
      const amount1BN = new BigNumber(amount1.toHexString());

      const flashSwapData: FlashSwapData = {
        address,
        amount0BN,
        amount1BN,
        sender,
        value0USDBN: new BigNumber(0),
        value1USDBN: new BigNumber(0),
      };

      if (amount0BN.gt(0)) {
        const value0USDBN = await getValue(
          amount0BN,
          token0Price,
          token0,
          provider
        );
        flashSwapData.value0USDBN = flashSwapData.value0USDBN.plus(value0USDBN);
      }

      if (amount1BN.gt(0)) {
        const value1USDBN = await getValue(
          amount1BN,
          token1Price,
          token1,
          provider
        );
        flashSwapData.value1USDBN = flashSwapData.value1USDBN.plus(value1USDBN);
      }

      return flashSwapData;
    });

    // Promise.all will fail fast on any rejected promises
    // Consider Promise.allSettled() to ensure that all promises settle - resolved or rejected
    const flashSwapResults = await Promise.all(flashSwapPromises);
    const filteredFlashSwapResults = flashSwapResults.filter(
      (result) => !!result
    ) as FlashSwapData[];

    filteredFlashSwapResults.forEach((result) => {
      if (
        result.value0USDBN.plus(result.value1USDBN).gt(flashSwapThresholdUSDBN)
      ) {
        const finding = Finding.fromObject({
          name: 'Forta Workshop 2: Uniswap V3 Large Flash Swap',
          description: `Large Flash Swap from pool ${result.address}`,
          alertId: 'AE-FORTA-WORKSHOP2-UNISWAPV3-LARGE-FLASH-SWAP',
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: 'UniswapV3',
          everestId,
          metadata: {
            address: result.address,
            token0Amount: result.amount0BN.toString(),
            token1Amount: result.amount1BN.toString(),
            sender: result.sender,
            value0USD: result.value0USDBN.toString(),
            value1USD: result.value1USDBN.toString(),
            flashSwapThresholdUSD: flashSwapThresholdUSDBN.toString(),
          },
        });
        findings.push(finding);
      }
    });
    return findings;
  };
}

export default {
  provideInitialize,
  initialize: provideInitialize(initializeData),
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(initializeData),
};
