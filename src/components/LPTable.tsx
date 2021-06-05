import { Table } from 'react-bootstrap'

const LPTable = () => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Pair</th>
          <th className="text-end">LP Balance</th>
          <th className="text-center">Underlying Assets</th>
          <th className="text-center">Pending TWIN</th>
          <th className="text-end">Total LP Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>AMZN-DOLLY LP</td>
          <td className="text-end">1.94 LP</td>
          <td className="text-center">
            0.031 AMZN
            <br />
            123.25 DOLLY
          </td>
          <td className="text-center">
            <i className="bi bi-unlock"></i>
            0.18 <span className="approx-value">($1.63)</span>
            <br />
            <i className="bi bi-lock-fill"></i>
            0.73 <span className="approx-value">($6.50)</span>
          </td>
          <td className="text-end">$245.98</td>
        </tr>
        <tr>
          <td>TSLA-DOLLY LP</td>
          <td className="text-end">4.79 LP</td>
          <td className="text-center">
            0.175 TSLA
            <br />
            132.94 DOLLY
          </td>
          <td className="text-center">
            <i className="bi bi-unlock"></i>
            0.47 <span className="approx-value">($4.15)</span>
            <br />
            <i className="bi bi-lock-fill"></i>
            1.87 <span className="approx-value">($16.61)</span>
          </td>
          <td className="text-end">$265.46</td>
        </tr>
        <tr
          className="loading"
          style={{
            display: 'none',
          }}
        >
          <td
            colSpan={6}
            style={{
              textAlign: 'center',
            }}
          >
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
        <tr className="table-secondary">
          <td colSpan={3} className="text-start">
            Total Value
          </td>
          <td className="text-center">
            <i className="bi bi-unlock"></i>
            0.65 <span className="approx-value">($5.78)</span>
            <br />
            <i className="bi bi-lock-fill"></i>
            2.6 <span className="approx-value">($23.11)</span>
          </td>
          <td className="text-end">$511.44</td>
        </tr>
      </tbody>
    </Table>
  )
}

export default LPTable
