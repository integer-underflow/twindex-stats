import { ethers } from 'ethers'
import {
  TOKENS,
  STOCK_DOLLY_PAIRS,
  STOCK_DOP_PAIRS,
  getOracleDollyPrice,
  getTokenPriceWithDollyPair,
  getOracleStockPrice,
  getReserves,
  getTotalLpSupply,
  getLpPrice,
  getLpAmount,
  getUnderlyingAssetsOfLps,
  getPendingTwin,
  getTokenPriceWithDopPair,
  getPoolIdFromPairAddress,
  getTokenAddressesFromPair,
  getUserLoans,
  getLockedTwinAmount,
  getCurrentBlockNumber,
  secondsUntilBlock
} from './network'
import { getDiff, getAddressInQueryString, formatUsd, objectFlip } from './helpers'

$(async function () {
  $('#wallet_address').val(getAddressInQueryString())

  const dollyPrice = await getOracleDollyPrice()
  const dopPrice = await getTokenPriceWithDollyPair(TOKENS.DOP, dollyPrice)
  const twinPrice = await getTokenPriceWithDopPair(TOKENS.TWIN, dollyPrice)

  $('#twin_price').text(`${formatUsd(twinPrice)}`)
  $('#dop_price').text(`${formatUsd(dopPrice)}`)

  // Stock Price
  Promise.all(
    Object.entries(TOKENS).map(async ([token, address]) => {
      if (token === 'DOLLY' || token === 'DOP' || token === 'TWIN') return

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
    // TWIN, Stock - DOP LP
    ...Object.entries(STOCK_DOP_PAIRS).map(async ([token, pairAddress]) => {
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

      const lpAmount = await getLpAmount(pairAddress, getAddressInQueryString())
      const lpValue = lpPrice.mul(lpAmount).div(ethers.utils.parseEther('1'))
      const [stockAmount, dopAmount] = getUnderlyingAssetsOfLps(totalSupply, lpAmount, totalStockReserve, totalDopReserve)

      const pendingTwin = await getPendingTwin(getPoolIdFromPairAddress(pairAddress), getAddressInQueryString())
      const pendingTwinValue = pendingTwin.mul(twinPrice).div(ethers.utils.parseEther('1'))

      if (lpAmount.gt(0)) {
        renderLpPrice(
          token,
          'DOP',
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(stockAmount)).toFixed(4)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(dopAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(lpAmount)).toFixed(2)),
          new Intl.NumberFormat().format(Number(ethers.utils.formatEther(pendingTwin)).toFixed(2)),
          formatUsd(pendingTwinValue),
          formatUsd(lpValue)
        )
      }

      return [lpValue, pendingTwin]
    })
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

  getUserLoans().then(loans => {
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

  getCurrentBlockNumber().then(currentBlockNumber => {
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
      DOLLY: './assets/dolly.svg',
      DOP: './assets/dopple.svg',
      TWIN: 'https://raw.githubusercontent.com/chawanvtp/Dopple/main/assets/tokens/0x3806aae953a3a873D02595f76C7698a57d4C7A57.svg'
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
