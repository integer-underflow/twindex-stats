import { ethers } from 'ethers'
import { IPANCAKE_ROUTER02_ABI } from './ABI'
import { provider } from './EthersProvider'

const ROUTERS = {
  twindex: {
    address: '0x6B011d0d53b0Da6ace2a3F436Fd197A4E35f47EF',
    abi: IPANCAKE_ROUTER02_ABI,
  },
}

const TOKENS = {
  TSLA: '0x17aCe02e5C8814BF2EE9eAAFF7902D52c15Fb0f4',
  GOOGL: '0x9C169647471C1C6a72773CfFc50F6Ba285684803',
  AMZN: '0x1085B90544ff5C421D528aAF79Cc65aFc920aC79',
  AAPL: '0xC10b2Ce6A2BCfdFDC8100Ba1602C1689997299D3',
  DOLLY: '0xfF54da7CAF3BC3D34664891fC8f3c9B6DeA6c7A5',
  DOP: '0x844FA82f1E54824655470970F7004Dd90546bB28',
  TWIN: '0x3806aae953a3a873D02595f76C7698a57d4C7A57',
}

const PRICE_FEEDS = {
  address: '0xd4f061a6a276f8B0Ae83D210D838B45fCC7532B2',
  abi: ['function queryRate(address, address) external view returns (uint256 rate, uint256 precision)'],
}

export interface StockPrice {
  token: string
  stockPrice: string
  oraclePrice: string
  diff: string
}

export const loadStocksPrice = async (): Promise<StockPrice[]> => {
  return await Promise.all(
    Object.entries(TOKENS)
      .filter(([token, address]) => {
        return token !== 'DOLLY' && token !== 'DOP' && token !== 'TWIN'
      })
      .map(async ([token, address]) => {
        const dollyPrice = await getOracleDollyPrice()
        const stockPrice = await getTokenPriceWithDollyPair(address, dollyPrice)
        const oracleStockPrice = await getOracleStockPrice(address, dollyPrice)
        const diff = getDiff(stockPrice, oracleStockPrice)

        return {
          token,
          stockPrice: formatUsd(stockPrice),
          oraclePrice: formatUsd(oracleStockPrice),
          diff: Number(ethers.utils.formatEther(diff)).toFixed(2) + '%',
        }
      })
  )
}

/**
 * Get Dolly price in USD from the oracle
 * @returns dolly price (18 decimal precision)
 */
const getOracleDollyPrice = async () => {
  const oracle = new ethers.Contract(
    '0xa442c34d88f4091880AEEE16500B088306562caa',
    ['function latestAnswer() external view returns (uint256 price)'],
    provider
  )
  const price = (await oracle.functions.latestAnswer())['price']
  return price
}

const getTokenPriceWithDollyPair = async (tokenAddress: string, dollyPrice: any) => {
  const tokenPrice = await getPriceFromTwindexRouter(dollyPrice, [tokenAddress, TOKENS.DOLLY])

  return tokenPrice
}

const getPriceFromTwindexRouter = async (dollyPrice: any, path: any) => {
  const twindexRouter = new ethers.Contract(ROUTERS.twindex.address, ROUTERS.twindex.abi, provider)

  const result = await twindexRouter.functions.getAmountsOut(ethers.utils.parseEther('1'), path)
  const amountOut = result.amounts[result.amounts.length - 1]

  return amountOut.mul(dollyPrice).div(ethers.utils.parseEther('1'))
}

/**
 *
 * @param {string} stockAddress Address of a Dopple synthetic stock
 * @param {BigNumber} dollyPrice dolly price (18 decimal precision) (get from getOracleDollyPrice)
 */
const getOracleStockPrice = async (stockAddress: string, dollyPrice: any) => {
  const priceFeeds = new ethers.Contract(PRICE_FEEDS.address, PRICE_FEEDS.abi, provider)

  const [stockPriceInDolly, precision] = await priceFeeds.functions.queryRate(stockAddress, TOKENS.DOLLY)

  return stockPriceInDolly.mul(dollyPrice).div(precision)
}

const getDiff = (price: any, oraclePrice: any) => {
  const priceDiff = price.sub(oraclePrice)

  return priceDiff.mul(ethers.utils.parseEther('100')).div(oraclePrice)
}

const formatUsd = (bigNumber: any) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(ethers.utils.formatEther(bigNumber)))
}
