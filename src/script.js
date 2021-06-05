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

  const PRICE_FEEDS = {
    address: '0xd4f061a6a276f8B0Ae83D210D838B45fCC7532B2',
    abi: ['function queryRate(address, address) external view returns (uint256 rate, uint256 precision)'],
  }

  const DFI_PROTOCOLS = {
    address: '0x37f5a7D8bBB1cc0307985D00DE520fE30630790c',
    abi: DFI_PROTOCOLS_ABI,
  }

  $('#wallet_address').val(getAddressInQueryString())

  // Stock Price
  Promise.all(
    Object.entries(TOKENS).map(async ([token, address]) => {
      if (token === 'DOLLY' || token === 'DOP' || token === 'TWIN') return

      const dollyPrice = await getOracleDollyPrice()
      const stockPrice = await getTokenPriceWithDollyPair(address, dollyPrice)
      const oracleStockPrice = await getOracleStockPrice(address, dollyPrice)
      const diff = getDiff(stockPrice, oracleStockPrice)

      renderStockDiff(token, formatUsd(stockPrice), formatUsd(oracleStockPrice), Number(ethers.utils.formatEther(diff)).toFixed(2) + '%')
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

      const pendingTwin = await getPendingTwin(getPoolIdFromPairAddress(pairAddress), getAddressInQueryString())
      const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
      const unlockedTwin = pendingTwin.mul(20).div(100)
      const unlockedTwinValue = unlockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))
      const lockedTwin = pendingTwin.mul(80).div(100)
      const lockedTwinValue = lockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

      if (lpAmount.gt(0)) {
        renderLpPrice(
          token,
          'DOLLY',
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(stockAmount)).toFixed(4)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(dollyAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(lpAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(unlockedTwin)).toFixed(2)),
          formatUsd(unlockedTwinValue),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(lockedTwin)).toFixed(2)),
          formatUsd(lockedTwinValue),
          formatUsd(lpValue)
        )
      }

      return [lpValue, pendingTwin]
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

      const pendingTwin = await getPendingTwin(getPoolIdFromPairAddress(pairAddress), getAddressInQueryString())
      const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
      const unlockedTwin = pendingTwin.mul(20).div(100)
      const unlockedTwinValue = unlockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))
      const lockedTwin = pendingTwin.mul(80).div(100)
      const lockedTwinValue = lockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

      if (lpAmount.gt(0)) {
        renderLpPrice(
          token,
          'DOP',
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(stockAmount)).toFixed(4)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(dopAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(lpAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(unlockedTwin)).toFixed(2)),
          formatUsd(unlockedTwinValue),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(lockedTwin)).toFixed(2)),
          formatUsd(lockedTwinValue),
          formatUsd(lpValue)
        )
      }

      return [lpValue, pendingTwin]
    }),
  ]).then(async (results) => {
    const totalValue = results.map((r) => r[0]).reduce((sum, value) => sum.add(value))
    const totalPendingTwins = results.map((r) => r[1]).reduce((sum, value) => sum.add(value))

    const dollyPrice = await getOracleDollyPrice()
    const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
    const unlockedTwin = totalPendingTwins.mul(20).div(100)
    const unlockedTwinValue = unlockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))
    const lockedTwin = totalPendingTwins.mul(80).div(100)
    const lockedTwinValue = lockedTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

    renderLpTotalValue(
      new Intl.NumberFormat().format(Number(ethers.utils.formatEther(unlockedTwin)).toFixed(2)),
      formatUsd(unlockedTwinValue),
      new Intl.NumberFormat().format(Number(ethers.utils.formatEther(lockedTwin)).toFixed(2)),
      formatUsd(lockedTwinValue),
      formatUsd(totalValue)
    )

    $('#lp_holdings .loading').hide()
  })

  getUserLoans().then((loans) => {
    loans.forEach((loan) => {
      const COLLATERAL_THRESHOLD = ethers.utils.parseEther('0.01')
      const { loanToken, collateralToken, principal, collateral, maintenanceMargin, currentMargin } = loan

      if (collateral.lt(COLLATERAL_THRESHOLD)) return

      const loanTokenSymbol = objectFlip(TOKENS)[loanToken]
      const collateralTokenSymbol = objectFlip(TOKENS)[collateralToken]

      let margin = currentMargin.sub(maintenanceMargin)
      if (margin.lt(0)) {
        margin = ethers.utils.parseEther('0')
      }

      renderMintPosition(
        loanTokenSymbol,
        Number(ethers.utils.formatEther(principal)).toFixed(5),
        collateralTokenSymbol,
        Number(ethers.utils.formatEther(collateral)).toFixed(2),
        Number(ethers.utils.formatEther(maintenanceMargin)).toFixed(2),
        Number(ethers.utils.formatEther(margin)).toFixed(2)
      )
    })

    $('#mint_positions .loading').hide()
  })

  getOracleDollyPrice().then(async (dollyPrice) => {
    const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
    const dopPrice = await getTokenPriceWithDollyPair(TOKENS.DOP, dollyPrice)

    $('#twin_price').text(`${formatUsd(twinPrice)}`)
    $('#dop_price').text(`${formatUsd(dopPrice)}`)
  })

  getLockedTWINAmount(getAddressInQueryString()).then(async (lockedAmount) => {
    const amount = Number(ethers.utils.formatEther(lockedAmount)).toFixed(2)
    const dollyPrice = await getOracleDollyPrice()
    const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)
    const valueInUsd = lockedAmount.mul(twinPrice).div(ethers.utils.parseEther('1'))

    $('#locked_twin').html(`${amount} <span class="approx-value">(${formatUsd(valueInUsd)})</span>`)
  })

  function formatUsd(bigNumber) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(ethers.utils.formatEther(bigNumber)))
  }

  function getAddressInQueryString() {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('address')
  }

  function getUnderlyingAssetsOfLps(totalLpSupply, lpAmount, totalReserve0, totalReserve1) {
    return [lpAmount.mul(totalReserve0).div(totalLpSupply), lpAmount.mul(totalReserve1).div(totalLpSupply)]
  }

  function renderLpPrice(
    token0Symbol,
    token1Symbol,
    token0Amount,
    token1Amount,
    lpAmount,
    unlockedTwin,
    unlockedTwinValue,
    lockedTwin,
    lockedTwinValue,
    lpValue
  ) {
    $('#lp_holdings tbody').prepend(
      `<tr><td>${token0Symbol}-${token1Symbol} LP</td><td class="text-end">${lpAmount} LP</td><td class="text-center">${token0Amount} <img alt="${token0Symbol}" src="${getLogoByTokenSymbol(
        token0Symbol
      )}"><br>${token1Amount} <img alt="${token1Symbol}" src="${getLogoByTokenSymbol(
        token1Symbol
      )}"></td><td class="text-center"><i class="bi bi-unlock"></i>
${unlockedTwin} <span class="approx-value">(${unlockedTwinValue})</span><br><i class="bi bi-lock-fill"></i>
${lockedTwin} <span class="approx-value">(${lockedTwinValue})</span></td><td class="text-end">${lpValue}</td></tr>`
    )
  }

  function renderLpTotalValue(unlockedTwin, unlockedTwinValue, lockedTwin, lockedTwinValue, lpValue) {
    $('#lp_holdings tbody').append(
      `<tr class="table-secondary"><td colspan="3" class="text-start">Total Value</td><td class="text-center"><i class="bi bi-unlock"></i>
${unlockedTwin} <span class="approx-value">(${unlockedTwinValue})</span><br><i class="bi bi-lock-fill"></i>
${lockedTwin} <span class="approx-value">(${lockedTwinValue})</span></td><td class="text-end">${lpValue}</td></tr>`
    )
  }

  function renderStockDiff(token, stockPrice, oraclePrice, diff) {
    $('#stock_price tbody').prepend(
      `<tr><td>${token}</td><td class="text-end">${stockPrice}</td><td class="text-end">${oraclePrice}</td><td class="text-end">${diff}</td></tr>`
    )
  }

  function renderMintPosition(loanTokenSymbol, loanTokenAmount, collateralTokenSymbol, collateralTokenAmount, maintenanceMargin, margin) {
    $('#mint_positions tbody').prepend(
      `<tr><td>${loanTokenAmount} <img alt="${loanTokenSymbol}" src="${getLogoByTokenSymbol(
        loanTokenSymbol
      )}"></td><td>${collateralTokenAmount} <img alt="${collateralTokenSymbol}" src="${getLogoByTokenSymbol(
        collateralTokenSymbol
      )}"></td><td class="text-center"><div class="mint-position-progress progress m-1"><div class="progress-bar bg-transparent" role="progressbar" style="width: ${maintenanceMargin}%">💀</div>
      <div class="progress-bar bg-transparent" role="progressbar" style="width: ${margin}%;" aria-valuenow="${margin}" aria-valuemin="0" aria-valuemax="100">${margin}%</div>
      <div class="progress-bar progress-bar-mask" role="progressbar" style="width: ${100 - maintenanceMargin - margin}%"></div>
  </div></td></tr>`
    )
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

  async function getPendingTwin(poolId, walletAddress) {
    if (!walletAddress) return ethers.utils.parseEther('0')

    const fairlaunch = new ethers.Contract(FAIRLAUNCH.address, FAIRLAUNCH.abi, provider)
    const pendingTwin = await fairlaunch.pendingTwin(poolId, walletAddress)

    return pendingTwin
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
    const priceFeeds = new ethers.Contract(PRICE_FEEDS.address, PRICE_FEEDS.abi, provider)

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

  async function getCurrentBlockNumber() {
    const blockNumber = await provider.getBlockNumber()

    return blockNumber
  }

  async function getUserLoans() {
    let loans = []
    try {
      const dfiProtocol = new ethers.Contract(DFI_PROTOCOLS.address, DFI_PROTOCOLS.abi, provider)
      loans = (await dfiProtocol.functions.getUserLoans(getAddressInQueryString(), 0, 1000, 0, false, false))[0]
    } catch (_) {}

    return loans
  }

  function getLogoByTokenSymbol(token) {
    const LOGO = {
      AAPL: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/aapl-stock.svg',
      AMZN: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/amza-stock.svg',
      GOOGL: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/googl-stock.svg',
      MSFT: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/msft-stock.svg',
      TSLA: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tsla-stock.svg',
      DOLLY: './assets/dolly.svg',
      DOP: './assets/dopple.svg',
      TWIN: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tokens/0x3806aae953a3a873D02595f76C7698a57d4C7A57.svg',
    }

    return LOGO[token]
  }

  function secondsUntilBlock(currentBlockNumber, targetBlockNumber) {
    const BLOCK_TIME = 3 * 1000 // 3 second
    const diff = Math.abs(currentBlockNumber - targetBlockNumber)

    return diff * BLOCK_TIME
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

  $('#darkmode-button').on('click', (e) => {
    darkmode.toggleDarkMode()

    if ($(e.currentTarget).find('i.bi').hasClass('bi-moon')) {
      $(e.currentTarget).find('i.bi').removeClass('bi-moon').addClass('bi-sun')
    } else {
      $(e.currentTarget).find('i.bi').removeClass('bi-sun').addClass('bi-moon')
    }
  })

  getCurrentBlockNumber().then((currentBlockNumber) => {
    const TWIN_UNLOCK_BLOCK_NUMBER = 8763010

    $('#countdown-unlock-twin').countdown(
      new Date(new Date().valueOf() + secondsUntilBlock(currentBlockNumber, TWIN_UNLOCK_BLOCK_NUMBER)),
      function (event) {
        $(this).html(
          event.strftime(
            '<span class="display-6">%D</span> Day%!d' +
              '<span class="display-6">%H</span> Hr' +
              '<span class="display-6">%M</span> Min' +
              '<span class="display-6">%S</span> Sec'
          )
        )
      }
    )
  })
  ;(() => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  })()

  return
})()

function copyToClipboard(element) {
  var $temp = $('<input>')
  $('body').append($temp)
  $temp.val($(element).text()).select()
  document.execCommand('copy')
  $temp.remove()
}
