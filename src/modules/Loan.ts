import { ethers } from 'ethers'
import { DFI_PROTOCOLS, provider, TOKENS } from './EthersProvider'
import { objectFlip } from './Utils'

const getUserLoans = async (address: string) => {
  let loans = []
  try {
    const dfiProtocol = new ethers.Contract(DFI_PROTOCOLS.address, DFI_PROTOCOLS.abi, provider)
    loans = (await dfiProtocol.functions.getUserLoans(address, 0, 1000, 0, false, false))[0]
  } catch (_) {}

  return loans
}

export interface MintPosition {
  collateralTokenAmount: string
  collateralTokenSymbol: string
  loanTokenAmount: string
  loanTokenSymbol: string
  maintenanceMargin: string
  margin: string
}

export const getMintPositions = async (address: string): Promise<MintPosition[]> => {
  const loans = await getUserLoans(address)
  return loans
    .map((loan: any) => {
      const COLLATERAL_THRESHOLD = ethers.utils.parseEther('0.01')
      const { loanToken, collateralToken, principal, collateral, maintenanceMargin, currentMargin } = loan

      if (collateral.lt(COLLATERAL_THRESHOLD)) return undefined

      const loanTokenSymbol = objectFlip(TOKENS)[loanToken]
      const collateralTokenSymbol = objectFlip(TOKENS)[collateralToken]

      let margin = currentMargin.sub(maintenanceMargin)
      if (margin.lt(0)) {
        margin = ethers.utils.parseEther('0')
      }

      return {
        loanTokenSymbol,
        loanTokenAmount: Number(ethers.utils.formatEther(principal)).toFixed(5),
        collateralTokenSymbol,
        collateralTokenAmount: Number(ethers.utils.formatEther(collateral)).toFixed(2),
        maintenanceMargin: Number(ethers.utils.formatEther(maintenanceMargin)).toFixed(2),
        margin: Number(ethers.utils.formatEther(margin)).toFixed(2),
      }
    })
    .filter((position: any) => position !== undefined)
}
