import { TOKENS } from './EthersProvider'
import { getTokenPriceWithDopPair, getOracleDollyPrice, getTokenPriceWithDollyPair, formatUsd } from './Utils'

export const getTwinPrice = async () => {
  return formatUsd(await getTokenPriceWithDopPair(TOKENS.TWIN, await getOracleDollyPrice()))
}

export const getDopplePrice = async () => {
  return formatUsd(await getTokenPriceWithDollyPair(TOKENS.DOP, await getOracleDollyPrice()))
}
