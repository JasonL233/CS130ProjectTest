export default function SubscriptionsPage() {
  return (
    <div>
      <h1>Subscriptions / Recurring Transactions</h1>
      <p>This page will be implemented by Jinying</p>
      <div style={{ marginTop: '2rem' }}>
        <button style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginBottom: '1rem' }}>
          + Add Subscription
        </button>
        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Cycle</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Renewal</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.5rem' }}>Netflix</td>
                <td style={{ padding: '0.5rem' }}>$15</td>
                <td style={{ padding: '0.5rem' }}>Monthly</td>
                <td style={{ padding: '0.5rem' }}>03/20</td>
                <td style={{ padding: '0.5rem' }}>Active</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem' }}>Spotify</td>
                <td style={{ padding: '0.5rem' }}>$10</td>
                <td style={{ padding: '0.5rem' }}>Monthly</td>
                <td style={{ padding: '0.5rem' }}>03/25</td>
                <td style={{ padding: '0.5rem' }}>Trial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
