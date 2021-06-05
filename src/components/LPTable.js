import { Table } from 'react-bootstrap'

const LPTable = () => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Pair</th>
          <th class="text-end">LP Balance</th>
          <th class="text-center">Underlying Assets</th>
          <th class="text-center">Pending TWIN</th>
          <th class="text-end">Total LP Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>AMZN-DOLLY LP</td>
          <td class="text-end">1.94 LP</td>
          <td class="text-center">
            0.031 AMZN
            <br />
            123.25 DOLLY
          </td>
          <td class="text-center">
            <i class="bi bi-unlock"></i>
            0.18 <span class="approx-value">($1.63)</span>
            <br />
            <i class="bi bi-lock-fill"></i>
            0.73 <span class="approx-value">($6.50)</span>
          </td>
          <td class="text-end">$245.98</td>
        </tr>
        <tr>
          <td>TSLA-DOLLY LP</td>
          <td class="text-end">4.79 LP</td>
          <td class="text-center">
            0.175 TSLA
            <br />
            132.94 DOLLY
          </td>
          <td class="text-center">
            <i class="bi bi-unlock"></i>
            0.47 <span class="approx-value">($4.15)</span>
            <br />
            <i class="bi bi-lock-fill"></i>
            1.87 <span class="approx-value">($16.61)</span>
          </td>
          <td class="text-end">$265.46</td>
        </tr>
        <tr
          class="loading"
          style={{
            display: 'none',
          }}
        >
          <td
            colspan="6"
            style={{
              textAlign: 'center',
            }}
          >
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
        <tr class="table-secondary">
          <td colspan="3" class="text-start">
            Total Value
          </td>
          <td class="text-center">
            <i class="bi bi-unlock"></i>
            0.65 <span class="approx-value">($5.78)</span>
            <br />
            <i class="bi bi-lock-fill"></i>
            2.6 <span class="approx-value">($23.11)</span>
          </td>
          <td class="text-end">$511.44</td>
        </tr>
      </tbody>
    </Table>
  )
}

export default LPTable
