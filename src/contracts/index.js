import DFI_PROTOCOLS_ABI from './DfiProtocols'
import FAIRLAUNCH_ABI from './Fairlaunch'
import IPANCAKE_ROUTER_02_ABI from './IPancakeRouter02'
import IUNISWAP_V2_PAIR_ABI from './IUniswapV2Pair'

const TWIN_ABI = ['function lockOf(address) external view returns (uint256 lockedAmount)']
const PRICE_FEEDS_ABI = ['function queryRate(address, address) external view returns (uint256 rate, uint256 precision)']

export {
  DFI_PROTOCOLS_ABI,
  FAIRLAUNCH_ABI,
  IPANCAKE_ROUTER_02_ABI,
  IUNISWAP_V2_PAIR_ABI,
  TWIN_ABI,
  PRICE_FEEDS_ABI
}
