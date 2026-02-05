export default function ExpensesPage() {
  return (
    <div>
      <h1>Expense Management</h1>
      <p>This page will be implemented by Yinan</p>
      <div style={{ marginTop: '2rem' }}>
        <button style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginBottom: '1rem' }}>
          + Add Expense
        </button>
        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                  No expenses yet. Click "Add Expense" to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
