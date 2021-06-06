import { ethers } from 'ethers'

export function formatUsd (bigNumber) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(ethers.utils.formatEther(bigNumber)))
}

export function getDiff (price, oraclePrice) {
  const priceDiff = price.sub(oraclePrice)

  return priceDiff.mul(ethers.utils.parseEther('100')).div(oraclePrice)
}

export function objectFlip (obj) {
  const ret = {}
  Object.keys(obj).forEach((key) => {
    ret[obj[key]] = key
  })
  return ret
}

export const getAddressInQueryString = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('address')
}
