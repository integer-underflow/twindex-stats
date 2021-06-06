import { ethers } from 'ethers'
import { PRICE_FEEDS, provider, TOKENS } from './EthersProvider'
import { formatUsd, getOracleDollyPrice, getTokenPriceWithDollyPair } from './Utils'

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
