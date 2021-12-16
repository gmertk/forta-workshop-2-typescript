import BigNumber from 'bignumber.js';
import {
  getJsonRpcUrl,
  Finding,
  HandleTransaction,
  TransactionEvent,
} from 'forta-agent';
import axios from 'axios';
import { ethers } from 'ethers';

import config from '../agent-config.json';
import contractAddresses from '../contract-addresses.json';
import { abi as factoryAbi } from '../abi/UniswapV3Factory.json';
import { abi as poolAbi } from '../abi/UniswapV3Pool.json';

type InitializeData = {
  everestId?: string;
  provider?: ethers.providers.JsonRpcBatchProvider;
  factoryContract?: ethers.Contract;
  flashSwapThresholdUSDBN?: BigNumber;
  poolAbi?: typeof poolAbi;
};

const initializeData = {};

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

    return findings;
  };
}

export default {
  provideInitialize,
  initialize: provideInitialize(initializeData),
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(initializeData),
};
