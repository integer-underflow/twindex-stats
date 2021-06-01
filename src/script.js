(async () => {
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
  }

  const DOLLY_PAIRS = {
    TSLA: '0xbde3b88c4D5926d5236447D1b12a866f1a38B2B7',
    GOOGL: '0xC38150a12D3C686f13D6e3A791d6301ed274B862',
    AMZN: '0x15C53425bd0b9bfEd3d4cCf27F4c4f1f7bBC838B',
    AAPL: '0xb91d34BCdF77E13f70AfF4d86129d13389dE0802',
  }

  await Promise.all(Object.entries(TOKENS).map(async ([token, address]) => {
    if (token === 'DOLLY') return
    
    const dollyPrice = await getOracleDollyPrice()
    const stockPrice = await getStockPrice(address, dollyPrice)
    const oracleStockPrice = await getOracleStockPrice(address, dollyPrice)
    const diff = getDiff(stockPrice, oracleStockPrice)

    renderStockDiff(
      token,
      Number(ethers.utils.formatEther(stockPrice)).toFixed(2),
      Number(ethers.utils.formatEther(oracleStockPrice)).toFixed(2),
      Number(ethers.utils.formatEther(diff)).toFixed(2) + '%'
    )
  }))

  $('#stock_price .loading').hide()

  function renderStockDiff(token, stockPrice, oraclePrice, diff) {
    $('#stock_price tbody').prepend(`<tr><td>${token}</td><td>${stockPrice}</td><td>${oraclePrice}</td><td>${diff}</td></tr>`)
  }

  // const twindexRouter = new ethers.Contract(
  //   ROUTERS.twindex.address,
  //   [ROUTERS.twindex.abi],
  //   provider
  // )

  function getDiff(price, oraclePrice) {
    const priceDiff = price.sub(oraclePrice)
    
    return priceDiff.mul(ethers.utils.parseEther('100')).div(oraclePrice)
  }

  async function getTotalLpSupply(pairAddress) {
    const twindexPair = new ethers.Contract(pairAddress, [IUNISWAPV2_PAIR_ABI], provider)
    const totalSupply = await twindexPair.functions.totalSupply()

    return totalSupply
  }

  async function getReserves(pairAddress) {
    const twindexPair = new ethers.Contract(pairAddress, [IUNISWAPV2_PAIR_ABI], provider)
    const reserves = await twindexPair.functions.getReserves()

    return reserves
  }

  function getLpPrice(lpSupply, token0Price, token1Price, reserve0, reserve1) {
    const totalToken0Value = token0Price.mul(reserve0).div(1e18)
    const totalToken1Value = token1Price.mul(reserve1).div(1e18)
    const totalValue = totalToken0Value.add(totalToken1Value)

    return totalValue.mul(1e18).div(lpSupply)
  }

  async function getLpAmount(pairAddress, walletAddress) {
    const twindexPair = new ethers.Contract(pairAddress, [IUNISWAPV2_PAIR_ABI], provider)
    const lpAmount = await twindexPair.functions.balanceOf(walletAddress)

    return lpAmount
  }

  /**
   *
   * @param {string} stockAddress Address of a Dopple synthetic stock
   * @param {BigNumber} dollyPrice dolly price (18 decimal precision) (get from getOracleDollyPrice)
   */
  async function getStockPrice(stockAddress, dollyPrice) {
    const twindexRouter = new ethers.Contract(ROUTERS.twindex.address, ROUTERS.twindex.abi, provider)

    const result = await twindexRouter.functions.getAmountsOut(ethers.utils.parseEther('1'), [stockAddress, TOKENS.DOLLY])
    const amountOut = result.amounts[1]

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

  return 1;
})()
