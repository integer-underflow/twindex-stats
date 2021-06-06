import { formatUsd, getOracleDollyPrice, getTokenPriceWithDopPair, getTokenPriceWithDollyPair, objectFlip } from './Utils'
import { ethers } from 'ethers'
import { FAIRLAUNCH_ABI, IUNISWAPV2_PAIR_ABI } from './ABI'
import { provider, TOKENS } from './EthersProvider'

const DOLLY_PAIRS = {
  TSLA: '0xbde3b88c4D5926d5236447D1b12a866f1a38B2B7',
  GOOGL: '0xC38150a12D3C686f13D6e3A791d6301ed274B862',
  AMZN: '0x15C53425bd0b9bfEd3d4cCf27F4c4f1f7bBC838B',
  AAPL: '0xb91d34BCdF77E13f70AfF4d86129d13389dE0802',
}

const DOP_PAIRS = {
  TSLA: '0xb611aCe852f60F0ec039f851644a5bC5270AbF7b',
  GOOGL: '0x7A00B2BB049176C9C74E5d7bF617F84dB4763aec',
  AMZN: '0x4a1135768C6ce4b2a2F20DAc80DE661949161627',
  AAPL: '0x2D4980c63962d4B9156a8974AEA7C7fd3121913A',
  TWIN: '0x65A95C2BC5c12E8e30e24D322ff386249c29a072',
}

const TWINDEX_POOLS = {
  TWIN_DOP: 0,
  TSLA_DOP: 1,
  DOP_AAPL: 2,
  AMZN_DOP: 3,
  TSLA_DOLLY: 4,
  AMZN_DOLLY: 5,
  AAPL_DOLLY: 6,
  GOOGL_DOLLY: 7,
  DOP_GOOGL: 8,
}

const FAIRLAUNCH = {
  address: '0xe6bE78800f25fFaE4D1db7CA6d3485629bD200Ed',
  abi: FAIRLAUNCH_ABI,
}

export interface LPPrice {
  token0Symbol: string
  token1Symbol: string
  token0Amount: string
  token1Amount: string
  lpAmount: string
  unlockedTwin: string
  unlockedTwinValue: string
  lockedTwin: string
  lockedTwinValue: string
  lpValue: string
  unformattedLpValue: any
  pendingTwin: any
}

const getDollyLPs = async (address: string): Promise<LPPrice[]> => {
  const LPs = await Promise.all(
    Object.entries(DOLLY_PAIRS).map(async ([token, pairAddress]) => {
      const dollyPrice = await getOracleDollyPrice()
      const stockPrice = await getTokenPriceWithDollyPair(TOKENS[token], dollyPrice)
      const [totalStockReserve, totalDollyReserve] = await getReserves(pairAddress)
      const totalSupply = await getTotalLpSupply(pairAddress)
      const lpPrice = getLpPrice(totalSupply, stockPrice, dollyPrice, totalStockReserve, totalDollyReserve)
      const lpAmount = await getLpAmount(pairAddress, address)
      const lpValue = lpPrice.mul(lpAmount).div(ethers.utils.parseEther('1'))
      const [stockAmount, dollyAmount] = getUnderlyingAssetsOfLps(totalSupply, lpAmount, totalStockReserve, totalDollyReserve)

      const pendingTwin = await getPendingTwin(getPoolIdFromPairAddress(pairAddress), address)
      const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
      const unlockedTwin = pendingTwin.mul(20).div(100)
      const unlockedTwinValue = unlockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))
      const lockedTwin = pendingTwin.mul(80).div(100)
      const lockedTwinValue = lockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

      if (lpAmount.gt(0)) {
        return {
          token0Symbol: token,
          token1Symbol: 'DOLLY',
          token0Amount: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(stockAmount)).toFixed(4))),
          token1Amount: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(dollyAmount)).toFixed(2))),
          lpAmount: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(lpAmount)).toFixed(2))),
          unlockedTwin: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(unlockedTwin)).toFixed(2))),
          unlockedTwinValue: formatUsd(unlockedTwinValue),
          lockedTwin: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(lockedTwin)).toFixed(2))),
          lockedTwinValue: formatUsd(lockedTwinValue),
          lpValue: formatUsd(lpValue),
          unformattedLpValue: lpValue,
          pendingTwin,
        }
      } else {
        return undefined
      }
    })
  )

  return LPs.filter((pair) => pair !== undefined) as LPPrice[]
}

const getDopLPs = async (address: string): Promise<LPPrice[]> => {
  const LPs = await Promise.all(
    Object.entries(DOP_PAIRS).map(async ([token, pairAddress]) => {
      const dollyPrice = await getOracleDollyPrice()
      const dopPrice = await getTokenPriceWithDollyPair(TOKENS.DOP, dollyPrice)
      let tokenPrice
      if (token === 'TWIN') {
        tokenPrice = await getTokenPriceWithDopPair(TOKENS[token], dollyPrice)
      } else {
        tokenPrice = await getTokenPriceWithDollyPair(TOKENS[token], dollyPrice)
      }
      const totalSupply = await getTotalLpSupply(pairAddress)
      const [token0] = await getTokenAddressesFromPair(pairAddress)

      let totalStockReserve, totalDopReserve, lpPrice
      if (TOKENS[token] === token0) {
        ;[totalStockReserve, totalDopReserve] = await getReserves(pairAddress)
        lpPrice = getLpPrice(totalSupply, tokenPrice, dopPrice, totalStockReserve, totalDopReserve)
      } else {
        ;[totalDopReserve, totalStockReserve] = await getReserves(pairAddress)
        lpPrice = getLpPrice(totalSupply, dopPrice, tokenPrice, totalDopReserve, totalStockReserve)
      }

      const lpAmount = await getLpAmount(pairAddress, address)
      const lpValue = lpPrice.mul(lpAmount).div(ethers.utils.parseEther('1'))
      const [stockAmount, dopAmount] = getUnderlyingAssetsOfLps(totalSupply, lpAmount, totalStockReserve, totalDopReserve)

      const pendingTwin = await getPendingTwin(getPoolIdFromPairAddress(pairAddress), address)
      const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
      const unlockedTwin = pendingTwin.mul(20).div(100)
      const unlockedTwinValue = unlockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))
      const lockedTwin = pendingTwin.mul(80).div(100)
      const lockedTwinValue = lockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

      if (lpAmount.gt(0)) {
        return {
          token0Symbol: token,
          token1Symbol: 'DOP',
          token0Amount: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(stockAmount)).toFixed(4))),
          token1Amount: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(dopAmount)).toFixed(2))),
          lpAmount: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(lpAmount)).toFixed(2))),
          unlockedTwin: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(unlockedTwin)).toFixed(2))),
          unlockedTwinValue: formatUsd(unlockedTwinValue),
          lockedTwin: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(lockedTwin)).toFixed(2))),
          lockedTwinValue: formatUsd(lockedTwinValue),
          lpValue: formatUsd(lpValue),
          unformattedLpValue: lpValue,
          pendingTwin,
        }
      } else {
        return undefined
      }
    })
  )

  return LPs.filter((pair) => pair !== undefined) as LPPrice[]
}

export const getLPs = async (address: string) => {
  const dollyLPs = await getDollyLPs(address)
  const dopLPs = await getDopLPs(address)
  const combineLPs = [...dollyLPs, ...dopLPs]

  const totalValue = combineLPs.map((r) => r.unformattedLpValue).reduce((sum, value) => sum.add(value))
  const totalPendingTwins = combineLPs.map((r) => r.pendingTwin).reduce((sum, value) => sum.add(value))

  const dollyPrice = await getOracleDollyPrice()
  const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
  const unlockedTwin = totalPendingTwins.mul(20).div(100)
  const unlockedTwinValue = unlockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))
  const lockedTwin = totalPendingTwins.mul(80).div(100)
  const lockedTwinValue = lockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

  return {
    lps: combineLPs,
    total: {
      unlockedTwin: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(unlockedTwin)).toFixed(2))),
      unlockedTwinValue: formatUsd(unlockedTwinValue),
      lockedTwin: new Intl.NumberFormat().format(parseFloat(Number(ethers.utils.formatEther(lockedTwin)).toFixed(2))),
      lockedTwinValue: formatUsd(lockedTwinValue),
      lpValue: formatUsd(totalValue),
    },
  }
}

const getReserves = async (pairAddress: string) => {
  const twindexPair = new ethers.Contract(pairAddress, IUNISWAPV2_PAIR_ABI, provider)
  const reserves = await twindexPair.functions.getReserves()

  return reserves
}

const getTotalLpSupply = async (pairAddress: string) => {
  const twindexPair = new ethers.Contract(pairAddress, IUNISWAPV2_PAIR_ABI, provider)
  const totalSupply = (await twindexPair.functions.totalSupply())[0]

  return totalSupply
}

const getLpPrice = (lpSupply: any, token0Price: any, token1Price: any, reserve0: any, reserve1: any) => {
  const totalToken0Value = token0Price.mul(reserve0).div(ethers.utils.parseEther('1'))
  const totalToken1Value = token1Price.mul(reserve1).div(ethers.utils.parseEther('1'))
  const totalValue = totalToken0Value.add(totalToken1Value)

  return totalValue.mul(ethers.utils.parseEther('1')).div(lpSupply)
}

const getPendingTwin = async (poolId: string, walletAddress: string) => {
  if (!walletAddress) return ethers.utils.parseEther('0')

  const fairlaunch = new ethers.Contract(FAIRLAUNCH.address, FAIRLAUNCH.abi, provider)
  const pendingTwin = await fairlaunch.pendingTwin(poolId, walletAddress)

  return pendingTwin
}

const getLpAmount = async (pairAddress: string, walletAddress: string) => {
  if (!walletAddress) return ethers.utils.parseEther('0')

  const twindexPair = new ethers.Contract(pairAddress, IUNISWAPV2_PAIR_ABI, provider)
  const lpAmountInWallet = (await twindexPair.functions.balanceOf(walletAddress))[0]

  const fairlaunch = new ethers.Contract(FAIRLAUNCH.address, FAIRLAUNCH.abi, provider)
  const userInfo = await fairlaunch.userInfo(getPoolIdFromPairAddress(pairAddress), walletAddress)
  const lpAmountInPool = userInfo.amount

  return lpAmountInWallet.add(lpAmountInPool)
}

const getPoolIdFromPairAddress = (pairAddress: string) => {
  let token = objectFlip(DOLLY_PAIRS)[pairAddress]
  // @ts-ignore
  if (token) return TWINDEX_POOLS[`${token}_DOLLY`]

  token = objectFlip(DOP_PAIRS)[pairAddress]
  // @ts-ignore
  if (token) return TWINDEX_POOLS[`${token}_DOP`] ?? TWINDEX_POOLS[`DOP_${token}`]

  return null
}

const getUnderlyingAssetsOfLps = (totalLpSupply: any, lpAmount: any, totalReserve0: any, totalReserve1: any) => {
  return [lpAmount.mul(totalReserve0).div(totalLpSupply), lpAmount.mul(totalReserve1).div(totalLpSupply)]
}

const getTokenAddressesFromPair = async (pairAddress: string) => {
  const twindexPair = new ethers.Contract(pairAddress, IUNISWAPV2_PAIR_ABI, provider)
  const token0 = (await twindexPair.functions.token0())[0]
  const token1 = (await twindexPair.functions.token1())[0]

  return [token0, token1]
}
