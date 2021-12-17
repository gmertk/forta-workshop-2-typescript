import axios from 'axios';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

const DECIMALS_ABI = ['function decimals() view returns (uint8)'];

async function getValue(
  amountBN: BigNumber,
  tokenPrice: any,
  tokenAddress: any,
  provider: ethers.providers.Provider
): Promise<BigNumber> {
  const contract = new ethers.Contract(tokenAddress, DECIMALS_ABI, provider);
  const decimals = await contract.decimals();
  const denominator = new BigNumber(10).pow(decimals);
  return amountBN.times(tokenPrice).div(denominator);
}

async function getTokenPrices(token0Address: any, token1Address: any) {
  const apiURL = 'https://api.coingecko.com/api/v3/simple/token_price/';
  const idString = 'ethereum';
  const addressString = `contract_addresses=${token0Address},${token1Address}`;
  const currencyString = 'vs_currencies=usd';

  const { data } = await axios.get(
    `${apiURL + idString}?${addressString}&${currencyString}`
  );

  // parse the response and convert the prices to BigNumber.js type (NOT ethers.js BigNumber)
  const usdPerToken0 = new BigNumber(data[token0Address.toLowerCase()].usd);
  const usdPerToken1 = new BigNumber(data[token1Address.toLowerCase()].usd);

  return { token0Price: usdPerToken0, token1Price: usdPerToken1 };
}

export { getValue, getTokenPrices };
