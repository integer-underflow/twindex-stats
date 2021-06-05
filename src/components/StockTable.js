import { Table } from 'react-bootstrap'

const StockTable = () => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Stock</th>
          <th class="text-end">Twindex Price</th>
          <th class="text-end">Oracle Price</th>
          <th class="text-end">Diff</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>AMZN</td>
          <td class="text-end">$3,967.82</td>
          <td class="text-end">$3,212.01</td>
          <td class="text-end">23.53%</td>
        </tr>
        <tr>
          <td>AAPL</td>
          <td class="text-end">$158.89</td>
          <td class="text-end">$125.58</td>
          <td class="text-end">26.52%</td>
        </tr>
        <tr>
          <td>GOOGL</td>
          <td class="text-end">$2,960.15</td>
          <td class="text-end">$2,390.93</td>
          <td class="text-end">23.81%</td>
        </tr>
        <tr>
          <td>TSLA</td>
          <td class="text-end">$756.88</td>
          <td class="text-end">$599.29</td>
          <td class="text-end">26.30%</td>
        </tr>
        <tr class="loading" style={{ display: 'none' }}>
          <td
            colspan="4"
            style={{
              textAlign: 'center',
            }}
          >
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
      </tbody>
    </Table>
  )
}

export default StockTable
