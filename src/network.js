import { ethers } from 'ethers'
import { objectFlip } from './helpers'
import { TWIN_ABI, DFI_PROTOCOLS_ABI, IUNISWAP_V2_PAIR_ABI, FAIRLAUNCH_ABI, IPANCAKE_ROUTER_02_ABI, PRICE_FEEDS_ABI } from './contracts'

export const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org', {
  name: 'Binance Smart Chain',
  chainId: 56
})

export const TWINDEX = {
  router: '0x6B011d0d53b0Da6ace2a3F436Fd197A4E35f47EF',
  fairlaunch: '0xe6bE78800f25fFaE4D1db7CA6d3485629bD200Ed',
  price_feeds: '0xd4f061a6a276f8B0Ae83D210D838B45fCC7532B2',
  dfi_protocols: '0x37f5a7D8bBB1cc0307985D00DE520fE30630790c'
}

export const TOKENS = {
  TSLA: '0x17aCe02e5C8814BF2EE9eAAFF7902D52c15Fb0f4',
  GOOGL: '0x9C169647471C1C6a72773CfFc50F6Ba285684803',
  AMZN: '0x1085B90544ff5C421D528aAF79Cc65aFc920aC79',
  AAPL: '0xC10b2Ce6A2BCfdFDC8100Ba1602C1689997299D3',
  COIN: '0xB23DC438b40cDb8a625Dc4f249734811F7DA9f9E',
  BIDU: '0x48D2854529183e1de3D36e29D437f8F6043AcE17',
  SPCE: '0x75bD0500548B49455D2Dfd86fa30Fba476Cb3895',
  SPY: '0xf2018b59f8f9be020c12cb0a2624200d9fba2af1',

  DOLLY: '0xfF54da7CAF3BC3D34664891fC8f3c9B6DeA6c7A5',
  DOP: '0x844FA82f1E54824655470970F7004Dd90546bB28',
  TWIN: '0x3806aae953a3a873D02595f76C7698a57d4C7A57',
  WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
}

export const STOCK_DOLLY_PAIRS = {
  TSLA: '0xbde3b88c4D5926d5236447D1b12a866f1a38B2B7',
  GOOGL: '0xC38150a12D3C686f13D6e3A791d6301ed274B862',
  AMZN: '0x15C53425bd0b9bfEd3d4cCf27F4c4f1f7bBC838B',
  AAPL: '0xb91d34BCdF77E13f70AfF4d86129d13389dE0802',
  COIN: '0x13F65fA2E9c9532125b752ED7A57Da87B4Dd4279',
  BIDU: '0x65e79848699E9ef894C440206946087d31f6575C',
  SPCE: '0xb07fC35D2318bF8FF31A3FdDF1e758e3450D98e2',
  SPY: '0x5d704aA3f49c57f0Da3b1db97114763cBD679333'
}

export const TWIN_PAIRS = {
  DOP: '0x65A95C2BC5c12E8e30e24D322ff386249c29a072',
  DOLLY: '0x593747Cd0023669c7A67511406266559B166Ca5d',
  WBNB: '0xC3BFdd2cd502e719132Bf7aA5954C74e9C7209F5'
}

export const TWINDEX_FAIRLAUNCH_POOL_IDS = {
  // TWIN
  TWIN_DOP: 0,
  TWIN_DOLLY: 10,
  TWIN_WBNB: 11,
  // Stock
  TSLA_DOLLY: 4,
  AMZN_DOLLY: 5,
  AAPL_DOLLY: 6,
  GOOGL_DOLLY: 7,
  COIN_DOLLY: 12,
  BIDU_DOLLY: 13,
  SPCE_DOLLY: 14,
  SPY_DOLLY: 15
}

export function getPoolIdFromPairAddress (pairAddress) {
  let token = objectFlip(STOCK_DOLLY_PAIRS)[pairAddress]
  if (token) return TWINDEX_FAIRLAUNCH_POOL_IDS[`${token}_DOLLY`]

  token = objectFlip(TWIN_PAIRS)[pairAddress]
  if (token) return TWINDEX_FAIRLAUNCH_POOL_IDS[`TWIN_${token}`]

  return null
}

export async function getCurrentBlockNumber () {
  const blockNumber = await provider.getBlockNumber()

  return blockNumber
}

export function secondsUntilBlock (currentBlockNumber, targetBlockNumber) {
  const BLOCK_TIME = 3 * 1000 // 3 second
  const diff = Math.abs(currentBlockNumber - targetBlockNumber)

  return diff * BLOCK_TIME
}

export async function getLockedTwinAmount (address) {
  if (!address) return ethers.utils.parseEther('0')
  const twin = new ethers.Contract(TOKENS.TWIN, TWIN_ABI, provider)
  const lockedAmount = (await twin.functions.lockOf(address)).lockedAmount

  return lockedAmount
}

export async function getUserLoans (userAddress) {
  let loans = []
  try {
    const dfiProtocol = new ethers.Contract(TWINDEX.dfi_protocols, DFI_PROTOCOLS_ABI, provider)
    loans = (await dfiProtocol.functions.getUserLoans(userAddress, 0, 1000, 0, false, false))[0]
  } catch (_) {}

  return loans
}

export async function getTotalLpSupply (pairAddress) {
  const twindexPair = new ethers.Contract(pairAddress, IUNISWAP_V2_PAIR_ABI, provider)
  const totalSupply = (await twindexPair.functions.totalSupply())[0]

  return totalSupply
}

export async function getTokenAddressesFromPair (pairAddress) {
  const twindexPair = new ethers.Contract(pairAddress, IUNISWAP_V2_PAIR_ABI, provider)
  const token0 = (await twindexPair.functions.token0())[0]
  const token1 = (await twindexPair.functions.token1())[0]

  return [token0, token1]
}

export async function getReserves (pairAddress) {
  const twindexPair = new ethers.Contract(pairAddress, IUNISWAP_V2_PAIR_ABI, provider)
  const reserves = await twindexPair.functions.getReserves()

  return reserves
}

export async function getPendingTwin (poolId, walletAddress) {
  if (!walletAddress) return ethers.utils.parseEther('0')

  const fairlaunch = new ethers.Contract(TWINDEX.fairlaunch, FAIRLAUNCH_ABI, provider)
  const pendingTwin = await fairlaunch.pendingTwin(poolId, walletAddress)

  return pendingTwin
}

export async function getUserInfo (poolId, walletAddress) {
  const fairlaunch = new ethers.Contract(TWINDEX.fairlaunch, FAIRLAUNCH_ABI, provider)
  const userInfo = await fairlaunch.userInfo(poolId, walletAddress)

  return userInfo
}

export async function getLpAmount (pairAddress, walletAddress) {
  if (!walletAddress) return ethers.utils.parseEther('0')

  const twindexPair = new ethers.Contract(pairAddress, IUNISWAP_V2_PAIR_ABI, provider)
  const lpAmountInWallet = (await twindexPair.functions.balanceOf(walletAddress))[0]

  const lpAmountInPool = (await getUserInfo(getPoolIdFromPairAddress(pairAddress), walletAddress)).amount

  return lpAmountInWallet.add(lpAmountInPool)
}

export function getUnderlyingAssetsOfLps (totalLpSupply, lpAmount, totalReserve0, totalReserve1) {
  return [lpAmount.mul(totalReserve0).div(totalLpSupply), lpAmount.mul(totalReserve1).div(totalLpSupply)]
}

export function getLpPrice (lpSupply, token0Price, token1Price, reserve0, reserve1) {
  const totalToken0Value = token0Price.mul(reserve0).div(ethers.utils.parseEther('1'))
  const totalToken1Value = token1Price.mul(reserve1).div(ethers.utils.parseEther('1'))
  const totalValue = totalToken0Value.add(totalToken1Value)

  return totalValue.mul(ethers.utils.parseEther('1')).div(lpSupply)
}

export async function getTokenPriceWithDollyPair (tokenAddress, dollyPrice) {
  const tokenPrice = await getPriceFromTwindexRouter([tokenAddress, TOKENS.DOLLY], dollyPrice)

  return tokenPrice
}

export async function getTokenPriceWithDopPair (tokenAddress, dollyPrice) {
  const tokenPrice = await getPriceFromTwindexRouter([tokenAddress, TOKENS.DOP, TOKENS.DOLLY], dollyPrice)

  return tokenPrice
}

export async function getPriceFromTwindexRouter (path, dollyPrice) {
  const twindexRouter = new ethers.Contract(TWINDEX.router, IPANCAKE_ROUTER_02_ABI, provider)
  const result = await twindexRouter.functions.getAmountsOut(ethers.utils.parseEther('1'), path)
  const amountOut = result.amounts[result.amounts.length - 1]

  return amountOut.mul(dollyPrice).div(ethers.utils.parseEther('1'))
}

export async function getOraclePrice (tokenAddress, dollyPrice) {
  const priceFeeds = new ethers.Contract(TWINDEX.price_feeds, PRICE_FEEDS_ABI, provider)
  const [stockPriceInDolly, precision] = await priceFeeds.functions.queryRate(tokenAddress, TOKENS.DOLLY)

  return stockPriceInDolly.mul(dollyPrice).div(precision)
}

export async function getOracleDollyPrice () {
  const oracle = new ethers.Contract(
    '0xa442c34d88f4091880AEEE16500B088306562caa',
    ['function latestAnswer() external view returns (uint256 price)'],
    provider
  )
  const price = (await oracle.functions.latestAnswer()).price

  return price
}
