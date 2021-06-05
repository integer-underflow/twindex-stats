import { Table } from 'react-bootstrap'

const StockTable = () => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Stock</th>
          <th className="text-end">Twindex Price</th>
          <th className="text-end">Oracle Price</th>
          <th className="text-end">Diff</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>AMZN</td>
          <td className="text-end">$3,967.82</td>
          <td className="text-end">$3,212.01</td>
          <td className="text-end">23.53%</td>
        </tr>
        <tr>
          <td>AAPL</td>
          <td className="text-end">$158.89</td>
          <td className="text-end">$125.58</td>
          <td className="text-end">26.52%</td>
        </tr>
        <tr>
          <td>GOOGL</td>
          <td className="text-end">$2,960.15</td>
          <td className="text-end">$2,390.93</td>
          <td className="text-end">23.81%</td>
        </tr>
        <tr>
          <td>TSLA</td>
          <td className="text-end">$756.88</td>
          <td className="text-end">$599.29</td>
          <td className="text-end">26.30%</td>
        </tr>
        <tr className="loading" style={{ display: 'none' }}>
          <td
            colSpan={4}
            style={{
              textAlign: 'center',
            }}
          >
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
      </tbody>
    </Table>
  )
}

export default StockTable
