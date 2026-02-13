export default function BudgetsPage() {
  return (
    <div>
      <h1>Budget and Goals</h1>
      <p>This page will be implemented by Roan</p>
      <div style={{ marginTop: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>Category Budgets</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Budget</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Used</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.5rem' }}>Food</td>
                <td style={{ padding: '0.5rem' }}>$300</td>
                <td style={{ padding: '0.5rem' }}>$250</td>
                <td style={{ padding: '0.5rem', color: 'green' }}>Under Budget</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem' }}>Travel</td>
                <td style={{ padding: '0.5rem' }}>$100</td>
                <td style={{ padding: '0.5rem' }}>$120</td>
                <td style={{ padding: '0.5rem', color: 'red' }}>Over Budget</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
