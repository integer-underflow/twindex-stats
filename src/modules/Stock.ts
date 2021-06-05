import { ethers } from 'ethers'
import { PRICE_FEEDS, provider, TOKENS } from './EthersProvider'
import { formatUsd, getTokenPriceWithDollyPair } from './Utils'

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
