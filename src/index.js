import { ethers } from 'ethers'
import {
  TOKENS,
  STOCK_DOLLY_PAIRS,
  TWIN_PAIRS,
  getOracleDollyPrice,
  getTokenPriceWithDollyPair,
  getOraclePrice,
  getReserves,
  getTotalLpSupply,
  getLpPrice,
  getLpAmount,
  getUnderlyingAssetsOfLps,
  getPendingTwin,
  getPoolIdFromPairAddress,
  getUserLoans,
  getLockedTwinAmount,
  getUserInfo
} from './network'
import { getDiff, getAddressInQueryString, formatUsd, objectFlip } from './helpers'

$(async function () {
  $('#wallet_address').val(getAddressInQueryString())

  const dollyPrice = await getOracleDollyPrice()
  const dopPrice = await getTokenPriceWithDollyPair(TOKENS.DOP, dollyPrice)
  const twinPrice = await getTokenPriceWithDollyPair(TOKENS.TWIN, dollyPrice)

  $('#twin_price').text(`${formatUsd(twinPrice)}`)
  $('#dop_price').text(`${formatUsd(dopPrice)}`)

  // Stock Price
  Promise.all(
    Object.entries(TOKENS).map(async ([token, address]) => {
      if (['DOLLY', 'DOP', 'TWIN', 'WBNB'].includes(token)) return

      const stockPrice = await getTokenPriceWithDollyPair(address, dollyPrice)
      const oracleStockPrice = await getOraclePrice(address, dollyPrice)
      const diff = getDiff(stockPrice, oracleStockPrice)

      renderStockDiff(token, formatUsd(stockPrice), formatUsd(oracleStockPrice), Number(ethers.utils.formatEther(diff)).toFixed(2) + '%')
    })
  ).then(() => {
    $('#stock_price .loading').hide()
  })

  Promise.all([
  // Stock - DOLLY LP
    ...Object.entries(STOCK_DOLLY_PAIRS).map(async ([token, pairAddress]) => {
      const stockPrice = await getTokenPriceWithDollyPair(TOKENS[token], dollyPrice)
      const [totalStockReserve, totalDollyReserve] = await getReserves(pairAddress)
      const totalSupply = await getTotalLpSupply(pairAddress)
      const lpPrice = getLpPrice(totalSupply, stockPrice, dollyPrice, totalStockReserve, totalDollyReserve)
      const lpAmount = await getLpAmount(pairAddress, getAddressInQueryString())
      const lpValue = lpPrice.mul(lpAmount).div(ethers.utils.parseEther('1'))
      const [stockAmount, dollyAmount] = getUnderlyingAssetsOfLps(totalSupply, lpAmount, totalStockReserve, totalDollyReserve)

      const pendingTwin = await getPendingTwin(getPoolIdFromPairAddress(pairAddress), getAddressInQueryString())
      const pendingTwinValue = pendingTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

      if (lpAmount.gt(0)) {
        renderLpPrice(
          token,
          'DOLLY',
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(stockAmount)).toFixed(4)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(dollyAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(lpAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(pendingTwin)).toFixed(2)),
          formatUsd(pendingTwinValue),
          formatUsd(lpValue)
        )
      }

      return [lpValue, pendingTwin]
    }),
    // TWIN - XXX LP
    ...Object.entries(TWIN_PAIRS).map(async ([token, pairAddress]) => {
      let tokenPrice
      if (token === 'WBNB') {
        tokenPrice = await getOraclePrice(TOKENS.WBNB, dollyPrice)
      } else if (token === 'DOLLY') {
        tokenPrice = dollyPrice
      } else {
        tokenPrice = await getTokenPriceWithDollyPair(TOKENS[token], dollyPrice)
      }
      const totalSupply = await getTotalLpSupply(pairAddress)

      const [totalTwinReserve, totalToken1Reserve] = await getReserves(pairAddress)
      const lpPrice = getLpPrice(totalSupply, twinPrice, tokenPrice, totalTwinReserve, totalToken1Reserve)

      const lpAmount = await getLpAmount(pairAddress, getAddressInQueryString())
      const lpValue = lpPrice.mul(lpAmount).div(ethers.utils.parseEther('1'))
      const [twinAmount, token1Amount] = getUnderlyingAssetsOfLps(totalSupply, lpAmount, totalTwinReserve, totalToken1Reserve)

      const pendingTwin = await getPendingTwin(getPoolIdFromPairAddress(pairAddress), getAddressInQueryString())
      const pendingTwinValue = pendingTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

      if (lpAmount.gt(0)) {
        renderLpPrice(
          'TWIN',
          token,
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(twinAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(token1Amount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(lpAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(pendingTwin)).toFixed(2)),
          formatUsd(pendingTwinValue),
          formatUsd(lpValue)
        )
      }

      return [lpValue, pendingTwin]
    }),
    // TWIN pool
    (async () => {
      const TWIN_POOL_ID = 9

      const twinAmountInPool = (await getUserInfo(TWIN_POOL_ID, getAddressInQueryString())).amount
      const twinAmountInPoolValue = twinAmountInPool.mul(twinPrice).div(ethers.utils.parseEther('1'))

      const pendingTwin = await getPendingTwin(TWIN_POOL_ID, getAddressInQueryString())
      const pendingTwinValue = pendingTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

      if (twinAmountInPool.gt(0)) {
        renderTwinPoolPrice(
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(twinAmountInPool)).toFixed(2)),
          formatUsd(twinAmountInPoolValue),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(pendingTwin)).toFixed(2)),
          formatUsd(pendingTwinValue)
        )
      }

      return [twinAmountInPoolValue, pendingTwin]
    })()
  ]).then(async (results) => {
    const totalValue = results.map((r) => r[0]).reduce((sum, value) => sum.add(value))
    const totalPendingTwin = results.map((r) => r[1]).reduce((sum, value) => sum.add(value))
    const totalPendingTwinValue = totalPendingTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

    renderLpTotalValue(
      new Intl.NumberFormat().format(Number(ethers.utils.formatEther(totalPendingTwin)).toFixed(2)),
      formatUsd(totalPendingTwinValue),
      formatUsd(totalValue)
    )

    $('#lp_holdings .loading').hide()
  })

  getUserLoans(getAddressInQueryString()).then(loans => {
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

  getLockedTwinAmount(getAddressInQueryString()).then(async (lockedAmount) => {
    const amount = Number(ethers.utils.formatEther(lockedAmount)).toFixed(2)
    const valueInUsd = lockedAmount.mul(twinPrice).div(ethers.utils.parseEther('1'))

    $('#locked_twin').html(`${amount} <span class="approx-value">(${formatUsd(valueInUsd)})</span>`)
  })

  $('#buy_me_coffee_address').on('click', e => {
    e.preventDefault()
    copyToClipboard(e.currentTarget)
  })

  $('#wallet_address_form').on('submit', e => {
    e.preventDefault()
    const walletAddress = $('#wallet_address').val()
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.has('address') ? urlParams.set('address', walletAddress) : urlParams.append('address', walletAddress)
    const newParams = urlParams.toString()

    window.location.href = '//' + location.host + location.pathname + '?' + newParams
  })

  $('#darkmode-button').on('click', e => {
    darkmode.toggleDarkMode()

    if ($(e.currentTarget).find('i.bi').hasClass('bi-moon')) {
      $(e.currentTarget).find('i.bi').removeClass('bi-moon').addClass('bi-sun')
    } else {
      $(e.currentTarget).find('i.bi').removeClass('bi-sun').addClass('bi-moon')
    }
  })

  ;(() => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  })()

  function renderLpPrice (
    token0Symbol,
    token1Symbol,
    token0Amount,
    token1Amount,
    lpAmount,
    pendingTwin,
    pendingTwinValue,
    lpValue
  ) {
    $('#lp_holdings tbody').prepend(
      `<tr>
      <td>${token0Symbol}-${token1Symbol} LP</td>
      <td class="text-end">${lpAmount} LP</td>
      <td class="text-center">${token0Amount} <img alt="${token0Symbol}" src="${getLogoByTokenSymbol(token0Symbol)}"><br>
      ${token1Amount} <img alt="${token1Symbol}" src="${getLogoByTokenSymbol(token1Symbol)}"></td>
      <td class="text-center">${pendingTwin} <span class="approx-value">(${pendingTwinValue})</span></td>
      <td class="text-end">${lpValue}</td></tr>`
    )
  }

  function renderTwinPoolPrice (
    twinInPool,
    twinInPoolValue,
    pendingTwin,
    pendingTwinValue
  ) {
    $('#lp_holdings tbody').prepend(
      `<tr>
      <td>TWIN</td>
      <td class="text-end">${twinInPool} TWIN</td>
      <td class="text-center">${twinInPool} <img alt="TWIN" src="${getLogoByTokenSymbol('TWIN')}"></td>
      <td class="text-center">${pendingTwin} <span class="approx-value">(${pendingTwinValue})</span></td>
      <td class="text-end">${twinInPoolValue}</td></tr>`
    )
  }

  function renderLpTotalValue (pendingTwin, pendingTwinValue, lpValue) {
    $('#lp_holdings tbody').append(
      `<tr class="table-secondary">
      <td colspan="3" class="text-start">Total Value</td>
      <td class="text-center">${pendingTwin} <span class="approx-value">(${pendingTwinValue})</span></td>
      <td class="text-end">${lpValue}</td></tr>`
    )
  }

  function renderStockDiff (token, stockPrice, oraclePrice, diff) {
    $('#stock_price tbody').prepend(
      `<tr><td>${token}</td><td class="text-end">${stockPrice}</td><td class="text-end">${oraclePrice}</td><td class="text-end">${diff}</td></tr>`
    )
  }

  function renderMintPosition (loanTokenSymbol, loanTokenAmount, collateralTokenSymbol, collateralTokenAmount, maintenanceMargin, margin) {
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

  function getLogoByTokenSymbol (token) {
    const LOGO = {
      AAPL: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/aapl-stock.svg',
      AMZN: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/amza-stock.svg',
      GOOGL: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/googl-stock.svg',
      MSFT: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/msft-stock.svg',
      TSLA: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tsla-stock.svg',
      COIN: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tokens/0xB23DC438b40cDb8a625Dc4f249734811F7DA9f9E.svg',
      BIDU: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tokens/0x48D2854529183e1de3D36e29D437f8F6043AcE17.svg',
      SPCE: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tokens/0x75bD0500548B49455D2Dfd86fa30Fba476Cb3895.svg',
      SPY: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tokens/0xf2018b59F8f9BE020C12Cb0A2624200d9FBa2af1.svg',

      DOLLY: './assets/dolly.svg',
      DOP: './assets/dopple.svg',
      TWIN: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tokens/0x3806aae953a3a873D02595f76C7698a57d4C7A57.svg',
      WBNB: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png'
    }

    return LOGO[token]
  }

  function copyToClipboard (element) {
    const $temp = $('<input>')
    $('body').append($temp)
    $temp.val($(element).text()).select()
    document.execCommand('copy')
    $temp.remove()
  }
})
