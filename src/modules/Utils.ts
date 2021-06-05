import { ethers } from 'ethers'
import { provider, ROUTERS, TOKENS } from './EthersProvider'

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

export const formatUsd = (bigNumber: any) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(ethers.utils.formatEther(bigNumber)))
}
