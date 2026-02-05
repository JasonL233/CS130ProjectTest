export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>This page will be implemented by Jason</p>
      <div style={{ marginTop: '2rem' }}>
        <h3>Total Spending This Month: $XXXX</h3>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
          <p>[Category Spending Chart will go here]</p>
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
          <p>[Budget Usage indicators will go here]</p>
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
          <p>[Upcoming Subscription Renewals will go here]</p>
        </div>
      </div>
    </div>
  );
}
