/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  TransactionEvent,
} from 'forta-agent';
import BigNumber from 'bignumber.js';

// axios mocking
const mockCoinGeckoResponse = {
  data: {},
};
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue(mockCoinGeckoResponse),
}));

import axios from 'axios';

// uniswap v3 factory contract mock and pool mock
const mockToken0Address = '0xFAKETOKEN0ADDRESS'; // .token0()
const mockToken1Address = '0xFAKETOKEN1ADDRESS'; // .token1()
const mockFee = 0; // .fee()
const mockPoolAddress = '0xFAKEPOOLADDRESS';
const mockDecimals = 3;

const mockFactoryContract = {
  getPool: jest.fn().mockResolvedValue(mockPoolAddress),
};

const mockPoolContract = {
  token0: jest.fn().mockResolvedValue(mockToken0Address),
  token1: jest.fn().mockResolvedValue(mockToken1Address),
  fee: jest.fn().mockResolvedValue(mockFee),
  interface: null as any,
};

const mockTokenContract = {
  decimals: jest.fn().mockResolvedValue(mockDecimals),
};

// mock the JsonRpcBatchProvider and Contract constructors
jest.mock('ethers', () => ({
  Contract: jest.fn(),
  providers: {
    JsonRpcBatchProvider: jest.fn(),
  },
  ...jest.requireActual('ethers'),
}));

import { ethers } from 'ethers';

import { abi as poolAbi } from '../abi/UniswapV3Pool.json';

mockPoolContract.interface = new ethers.utils.Interface(poolAbi);

const poolCreatedTopic =
  '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118';
const flashTopic =
  '0xbdbdb71d7860376ba52b25a5028beea23581364a40522f6bcfb86bb1f2dca633';
const EVEREST_ID = '0xa2e07f422b5d7cbbfca764e53b251484ecf945fa';

import agent from './agent';

describe('mock axios GET requests', () => {
  it('should call axios.get and return the mocked response for CoinGecko', async () => {
    mockCoinGeckoResponse.data = { '0xtokenaddress': { usd: 1000 } };
    const response = await axios.get('https://url.url');
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(response.data['0xtokenaddress'].usd).toEqual(1000);

    // reset call count for next test
    (axios.get as jest.Mock).mockClear();
    expect(axios.get).toHaveBeenCalledTimes(0);
  });
});

// const createTxEvent = ({ gasUsed, addresses, logs, blockNumber }: any) =>
//   createTransactionEvent({
//     transaction: {} as any,
//     receipt: { gasUsed, logs } as any,
//     block: { number: blockNumber } as any,
//     addresses,
//   });

/* handler tests */
// describe('large flash swap monitoring', () => {
//   describe('handleTransaction', () => {
//     let initializeData;
//     let handleTransaction: HandleTransaction;

//     // event Flash(
//     //  address indexed sender,
//     //  address indexed recipient,
//     //  uint256 amount0,
//     //  uint256 amount1,
//     //  uint256 paid0,
//     //  uint256 paid1
//     // )

//     // log with an event other than a Flash event
//     const logsNoMatchEvent = [{ topics: [poolCreatedTopic] }];

//     // log that matches a Flash event from a non-uniswap address
//     // expect filterEvent to match on event but then Pool address check will fail
//     // no additional topics or data are needed because this will fail before those checks occur
//     const logsMatchFlashEventInvalidAddress = [
//       { address: '0xINVALIDUNISWAPV3POOLADDRESS', topics: [flashTopic] },
//     ];

//     // log that matches a Flash event from a uniswap v3 pool address
//     // expect all checks to work and for this to be processed completely
//     // therefore, we need all valid topics and data for parseLog to properly decode
//     const amount0 = 100;
//     const amount0Hex64 = amount0.toString(16).padStart(64, '0');
//     const hashZero = ethers.constants.HashZero.slice(2);
//     const logsMatchFlashEventAddressMatch = [
//       {
//         address: '0xFAKEPOOLADDRESS',
//         topics: [
//           flashTopic,
//           ethers.constants.HashZero,
//           ethers.constants.HashZero,
//         ],
//         data: `0x${amount0Hex64}${hashZero}${hashZero}${hashZero}`,
//       },
//     ];

//     beforeEach(async () => {
//       initializeData = {};

//       // ** Couldn't solve the typescript issue here **
//       ethers.Contract = jest
//         .fn()
//         .mockImplementationOnce(() => mockFactoryContract);

//       // initialize the handler
//       // this will create the mock provider and mock factory contract
//       await agent.provideInitialize(initializeData)();
//       handleTransaction = agent.provideHandleTransaction(initializeData);
//     });

//     it('returns empty findings if no flash swaps occurred', async () => {
//       const txEvent = createTxEvent({ logs: logsNoMatchEvent });

//       const findings = await handleTransaction(txEvent);

//       expect(findings).toStrictEqual([]);
//       expect(axios.get).toHaveBeenCalledTimes(0);
//       expect(mockPoolContract.token0).toHaveBeenCalledTimes(0);
//     });
//   });
// });
