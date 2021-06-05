import { ethers } from 'ethers'
import { IPANCAKE_ROUTER02_ABI } from './ABI'

export const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org', {
  name: 'Binance Smart Chain',
  chainId: 56,
})

export const ROUTERS = {
  twindex: {
    address: '0x6B011d0d53b0Da6ace2a3F436Fd197A4E35f47EF',
    abi: IPANCAKE_ROUTER02_ABI,
  },
}

export const TOKENS = {
  TSLA: '0x17aCe02e5C8814BF2EE9eAAFF7902D52c15Fb0f4',
  GOOGL: '0x9C169647471C1C6a72773CfFc50F6Ba285684803',
  AMZN: '0x1085B90544ff5C421D528aAF79Cc65aFc920aC79',
  AAPL: '0xC10b2Ce6A2BCfdFDC8100Ba1602C1689997299D3',
  DOLLY: '0xfF54da7CAF3BC3D34664891fC8f3c9B6DeA6c7A5',
  DOP: '0x844FA82f1E54824655470970F7004Dd90546bB28',
  TWIN: '0x3806aae953a3a873D02595f76C7698a57d4C7A57',
}

export const PRICE_FEEDS = {
  address: '0xd4f061a6a276f8B0Ae83D210D838B45fCC7532B2',
  abi: ['function queryRate(address, address) external view returns (uint256 rate, uint256 precision)'],
}
