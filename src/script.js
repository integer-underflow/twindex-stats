;(async () => {
  const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org', {
    name: 'Binance Smart Chain',
    chainId: 56,
  })

  const ROUTERS = {
    twindex: {
      address: '0x6B011d0d53b0Da6ace2a3F436Fd197A4E35f47EF',
      abi: IPANCAKE_ROUTER02_ABI,
    },
  }

  const TOKENS = {
    TSLA: '0x17aCe02e5C8814BF2EE9eAAFF7902D52c15Fb0f4',
    GOOGL: '0x9C169647471C1C6a72773CfFc50F6Ba285684803',
    AMZN: '0x1085B90544ff5C421D528aAF79Cc65aFc920aC79',
    AAPL: '0xC10b2Ce6A2BCfdFDC8100Ba1602C1689997299D3',
    DOLLY: '0xfF54da7CAF3BC3D34664891fC8f3c9B6DeA6c7A5',
    DOP: '0x844FA82f1E54824655470970F7004Dd90546bB28',
    TWIN: '0x3806aae953a3a873D02595f76C7698a57d4C7A57',
  }

  const TWIN_ABI = ['function lockOf(address) external view returns (uint256 lockedAmount)']

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

  $('#wallet_address').val(getAddressInQueryString())

  Promise.all(
    Object.entries(TOKENS).map(async ([token, address]) => {
      if (token === 'DOLLY' || token === 'DOP' || token === 'TWIN') return

      const dollyPrice = await getOracleDollyPrice()
      const stockPrice = await getTokenPriceWithDollyPair(address, dollyPrice)
      const oracleStockPrice = await getOracleStockPrice(address, dollyPrice)
      const diff = getDiff(stockPrice, oracleStockPrice)

      renderStockDiff(
        token,
        Number(ethers.utils.formatEther(stockPrice)).toFixed(2),
        Number(ethers.utils.formatEther(oracleStockPrice)).toFixed(2),
        Number(ethers.utils.formatEther(diff)).toFixed(2) + '%'
      )
    })
  ).then(() => {
    $('#stock_price .loading').hide()
  })

  Promise.all([
    // Stock - DOLLY LP
    ...Object.entries(DOLLY_PAIRS).map(async ([token, pairAddress]) => {
      const dollyPrice = await getOracleDollyPrice()
      const stockPrice = await getTokenPriceWithDollyPair(TOKENS[token], dollyPrice)
      const [totalStockReserve, totalDollyReserve] = await getReserves(pairAddress)
      const totalSupply = await getTotalLpSupply(pairAddress)
      const lpPrice = getLpPrice(totalSupply, stockPrice, dollyPrice, totalStockReserve, totalDollyReserve)
      const lpAmount = await getLpAmount(pairAddress, getAddressInQueryString())
      const lpValue = lpPrice.mul(lpAmount).div(ethers.utils.parseEther('1'))
      const [stockAmount, dollyAmount] = getUnderlyingAssetsOfLps(totalSupply, lpAmount, totalStockReserve, totalDollyReserve)

      renderLpPrice(
        token,
        'DOLLY',
        Number(ethers.utils.formatEther(stockAmount)).toFixed(4),
        Number(ethers.utils.formatEther(dollyAmount)).toFixed(2),
        Number(ethers.utils.formatEther(lpAmount)).toFixed(2),
        Number(ethers.utils.formatEther(lpValue)).toFixed(2)
      )

      return lpValue
    }),
    // TWIN, Stock - DOP LP
    ...Object.entries(DOP_PAIRS).map(async ([token, pairAddress]) => {
      const dollyPrice = await getOracleDollyPrice()
      const dopPrice = await getTokenPriceWithDollyPair(TOKENS.DOP, dollyPrice)
      let tokenPrice
      if (token === 'TWIN') {
        tokenPrice = await getTokenPriceWithDopPair(TOKENS[token], dollyPrice)
      } else {
        tokenPrice = await getTokenPriceWithDollyPair(TOKENS[token], dollyPrice)
      }
      const totalSupply = await getTotalLpSupply(pairAddress)
      const [token0, _] = await getTokenAddressesFromPair(pairAddress)

      let totalStockReserve, totalDopReserve, lpPrice
      if (TOKENS[token] === token0) {
        ;[totalStockReserve, totalDopReserve] = await getReserves(pairAddress)
        lpPrice = getLpPrice(totalSupply, tokenPrice, dopPrice, totalStockReserve, totalDopReserve)
      } else {
        ;[totalDopReserve, totalStockReserve] = await getReserves(pairAddress)
        lpPrice = getLpPrice(totalSupply, dopPrice, tokenPrice, totalDopReserve, totalStockReserve)
      }

      const lpAmount = await getLpAmount(pairAddress, getAddressInQueryString())
      const lpValue = lpPrice.mul(lpAmount).div(ethers.utils.parseEther('1'))
      const [stockAmount, dopAmount] = getUnderlyingAssetsOfLps(totalSupply, lpAmount, totalStockReserve, totalDopReserve)

      renderLpPrice(
        token,
        'DOP',
        Number(ethers.utils.formatEther(stockAmount)).toFixed(4),
        Number(ethers.utils.formatEther(dopAmount)).toFixed(2),
        Number(ethers.utils.formatEther(lpAmount)).toFixed(2),
        Number(ethers.utils.formatEther(lpValue)).toFixed(2)
      )

      return lpValue
    }),
  ]).then((lpValues) => {
    const totalValue = lpValues.reduce((sum, value) => sum.add(value))

    renderLpTotalValue(Number(ethers.utils.formatEther(totalValue)).toFixed(2))

    $('#lp_price .loading').hide()
  })

  getOracleDollyPrice().then(async dollyPrice => {
    const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
    const dopPrice = await getTokenPriceWithDollyPair(TOKENS.DOP, dollyPrice)

    $('#twin_price').text(`$${Number(ethers.utils.formatEther(twinPrice)).toFixed(2)}`)
    $('#dop_price').text(`$${Number(ethers.utils.formatEther(dopPrice)).toFixed(2)}`)
  })

  getLockedTWINAmount(getAddressInQueryString()).then(async lockedAmount => {
    const amount = Number(ethers.utils.formatEther(lockedAmount)).toFixed(2)
    const dollyPrice = await getOracleDollyPrice()
    const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
    const valueInUsd = lockedAmount.mul(twinPrice).div(ethers.utils.parseEther('1'))

    $('#locked_twin').text(`${amount} ($${Number(ethers.utils.formatEther(valueInUsd)).toFixed(2)})`)
  })

  function getAddressInQueryString() {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('address')
  }

  function getUnderlyingAssetsOfLps(totalLpSupply, lpAmount, totalReserve0, totalReserve1) {
    return [lpAmount.mul(totalReserve0).div(totalLpSupply), lpAmount.mul(totalReserve1).div(totalLpSupply)]
  }

  function renderLpPrice(token0Symbol, token1Symbol, token0Amount, token1Amount, lpAmount, value) {
    $('#lp_price tbody').prepend(
      `<tr><td>${token0Symbol}-${token1Symbol} LP</td><td class="text-end">${lpAmount} LP</td><td class="text-center">${token0Amount} ${token0Symbol} + ${token1Amount} ${token1Symbol}</td><td class="text-end">$${value}</td></tr>`
    )
  }

  function renderLpTotalValue(value) {
    $('#lp_price tbody').append(
      `<tr class="table-secondary"><td colspan="3" class="text-end">Total Value</td><td class="text-end">$${value}</td></tr>`
    )
  }

  function renderStockDiff(token, stockPrice, oraclePrice, diff) {
    $('#stock_price tbody').prepend(`<tr><td>${token}</td><td>${stockPrice}</td><td>${oraclePrice}</td><td>${diff}</td></tr>`)
  }

  function getDiff(price, oraclePrice) {
    const priceDiff = price.sub(oraclePrice)

    return priceDiff.mul(ethers.utils.parseEther('100')).div(oraclePrice)
  }

  function getPoolIdFromPairAddress(pairAddress) {
    let token = objectFlip(DOLLY_PAIRS)[pairAddress]
    if (token) return TWINDEX_POOLS[`${token}_DOLLY`]

    token = objectFlip(DOP_PAIRS)[pairAddress]
    if (token) return TWINDEX_POOLS[`${token}_DOP`] ?? TWINDEX_POOLS[`DOP_${token}`]

    return null
  }

  function getTokenFromAddress(tokenAddress) {
    const token = objectFlip(TOKENS)[tokenAddress]

    return token
  }

  async function getLockedTWINAmount(address) {
    if (!address) return ethers.utils.parseEther('0')
    const twin = new ethers.Contract(TOKENS.TWIN, TWIN_ABI, provider)
    const lockedAmount = (await twin.functions.lockOf(address)).lockedAmount

    return lockedAmount
  }

  async function getTotalLpSupply(pairAddress) {
    const twindexPair = new ethers.Contract(pairAddress, IUNISWAPV2_PAIR_ABI, provider)
    const totalSupply = (await twindexPair.functions.totalSupply())[0]

    return totalSupply
  }

  async function getTokenAddressesFromPair(pairAddress) {
    const twindexPair = new ethers.Contract(pairAddress, IUNISWAPV2_PAIR_ABI, provider)
    const token0 = (await twindexPair.functions.token0())[0]
    const token1 = (await twindexPair.functions.token1())[0]

    return [token0, token1]
  }

  async function getReserves(pairAddress) {
    const twindexPair = new ethers.Contract(pairAddress, IUNISWAPV2_PAIR_ABI, provider)
    const reserves = await twindexPair.functions.getReserves()

    return reserves
  }

  function getLpPrice(lpSupply, token0Price, token1Price, reserve0, reserve1) {
    const totalToken0Value = token0Price.mul(reserve0).div(ethers.utils.parseEther('1'))
    const totalToken1Value = token1Price.mul(reserve1).div(ethers.utils.parseEther('1'))
    const totalValue = totalToken0Value.add(totalToken1Value)

    return totalValue.mul(ethers.utils.parseEther('1')).div(lpSupply)
  }

  async function getLpAmount(pairAddress, walletAddress) {
    if (!walletAddress) return ethers.utils.parseEther('0')

    const twindexPair = new ethers.Contract(pairAddress, IUNISWAPV2_PAIR_ABI, provider)
    const lpAmountInWallet = (await twindexPair.functions.balanceOf(walletAddress))[0]

    const fairlaunch = new ethers.Contract(FAIRLAUNCH.address, FAIRLAUNCH.abi, provider)
    const userInfo = await fairlaunch.userInfo(getPoolIdFromPairAddress(pairAddress), walletAddress)
    const lpAmountInPool = userInfo.amount

    return lpAmountInWallet.add(lpAmountInPool)
  }

  async function getTokenPriceWithDollyPair(tokenAddress, dollyPrice) {
    const tokenPrice = await getPriceFromTwindexRouter(dollyPrice, [tokenAddress, TOKENS.DOLLY])

    return tokenPrice
  }

  async function getTokenPriceWithDopPair(tokenAddress, dollyPrice) {
    const tokenPrice = await getPriceFromTwindexRouter(dollyPrice, [tokenAddress, TOKENS.DOP, TOKENS.DOLLY])

    return tokenPrice
  }

  async function getPriceFromTwindexRouter(dollyPrice, path) {
    const twindexRouter = new ethers.Contract(ROUTERS.twindex.address, ROUTERS.twindex.abi, provider)

    const result = await twindexRouter.functions.getAmountsOut(ethers.utils.parseEther('1'), path)
    const amountOut = result.amounts[result.amounts.length - 1]

    return amountOut.mul(dollyPrice).div(ethers.utils.parseEther('1'))
  }

  /**
   *
   * @param {string} stockAddress Address of a Dopple synthetic stock
   * @param {BigNumber} dollyPrice dolly price (18 decimal precision) (get from getOracleDollyPrice)
   */
  async function getOracleStockPrice(stockAddress, dollyPrice) {
    const priceFeeds = new ethers.Contract(
      '0xd4f061a6a276f8B0Ae83D210D838B45fCC7532B2',
      ['function queryRate(address, address) external view returns (uint256 rate, uint256 precision)'],
      provider
    )

    const [stockPriceInDolly, precision] = await priceFeeds.functions.queryRate(stockAddress, TOKENS.DOLLY)

    return stockPriceInDolly.mul(dollyPrice).div(precision)
  }

  /**
   * Get Dolly price in USD from the oracle
   * @returns dolly price (18 decimal precision)
   */
  async function getOracleDollyPrice() {
    const oracle = new ethers.Contract(
      '0xa442c34d88f4091880AEEE16500B088306562caa',
      ['function latestAnswer() external view returns (uint256 price)'],
      provider
    )
    const price = (await oracle.functions.latestAnswer())['price']
    return price
  }

  function objectFlip(obj) {
    const ret = {}
    Object.keys(obj).forEach((key) => {
      ret[obj[key]] = key
    })
    return ret
  }

  $('#wallet_address_form').on('submit', (e) => {
    e.preventDefault()
    const walletAddress = $('#wallet_address').val()
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.has('address') ? urlParams.set('address', walletAddress) : urlParams.append('address', walletAddress)
    const newParams = urlParams.toString()

    window.location.href = '//' + location.host + location.pathname + '?' + newParams
  })

  return
})()

function copyToClipboard(element) {
  var $temp = $('<input>')
  $('body').append($temp)
  $temp.val($(element).text()).select()
  document.execCommand('copy')
  $temp.remove()
}
