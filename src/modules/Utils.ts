import { ethers } from 'ethers'
import { provider, ROUTERS, TOKENS } from './EthersProvider'

export const getTokenPriceWithDopPair = async (tokenAddress: string, dollyPrice: any) => {
  const tokenPrice = await getPriceFromTwindexRouter(dollyPrice, [tokenAddress, TOKENS.DOP, TOKENS.DOLLY])

  return tokenPrice
}

export const getTokenPriceWithDollyPair = async (tokenAddress: string, dollyPrice: any) => {
  const tokenPrice = await getPriceFromTwindexRouter(dollyPrice, [tokenAddress, TOKENS.DOLLY])

  return tokenPrice
}

export const getPriceFromTwindexRouter = async (dollyPrice: any, path: any) => {
  const twindexRouter = new ethers.Contract(ROUTERS.twindex.address, ROUTERS.twindex.abi, provider)

  const result = await twindexRouter.functions.getAmountsOut(ethers.utils.parseEther('1'), path)
  const amountOut = result.amounts[result.amounts.length - 1]

  return amountOut.mul(dollyPrice).div(ethers.utils.parseEther('1'))
}

/**
 * Get Dolly price in USD from the oracle
 * @returns dolly price (18 decimal precision)
 */
export const getOracleDollyPrice = async () => {
  const oracle = new ethers.Contract(
    '0xa442c34d88f4091880AEEE16500B088306562caa',
    ['function latestAnswer() external view returns (uint256 price)'],
    provider
  )
  const price = (await oracle.functions.latestAnswer())['price']
  return price
}

export const formatUsd = (bigNumber: any) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(ethers.utils.formatEther(bigNumber)))
}

export const objectFlip = (obj: { [key: string]: string }) => {
  const ret: { [key: string]: string } = {}
  Object.keys(obj).forEach((key) => {
    ret[obj[key]] = key
  })
  return ret
}

export const getAddressInQueryString = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('address')
}
