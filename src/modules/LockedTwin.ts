import { ethers } from 'ethers'
import { provider, TOKENS } from './EthersProvider'
import { formatUsd, getOracleDollyPrice, getTokenPriceWithDopPair } from './Utils'

const TWIN_ABI = ['function lockOf(address) external view returns (uint256 lockedAmount)']

export const getLockedTWINAmount = async (address: string) => {
  const twin = new ethers.Contract(TOKENS.TWIN, TWIN_ABI, provider)
  const lockedAmount = (await twin.functions.lockOf(address)).lockedAmount

  const amount = Number(ethers.utils.formatEther(lockedAmount)).toFixed(2)
  const dollyPrice = await getOracleDollyPrice()
  const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
  const valueInUsd = lockedAmount.mul(twinPrice).div(ethers.utils.parseEther('1'))

  return {
    amount,
    valueInUsd: formatUsd(valueInUsd),
  }
}
