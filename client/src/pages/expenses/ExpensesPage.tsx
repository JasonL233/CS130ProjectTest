import { useEffect, useState } from "react";
import { CATEGORY_COLORS } from "../../constants/colors";
import './ExpensesPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

interface Expense {
  expense_id: string;
  user_id: string;
  expense_title: string;
  expense_category: string;
  expense_amount_cents: number;
  expense_date: string;
  expense_note: string | null;
  created_at: string;
}

interface ExpenseFormData {
  title: string;
  category: string;
  amount: string;
  date: string;
  note: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  // default to today's date for convenience
  const todayIso = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    category: 'Food',
    amount: '',
    date: todayIso,
    note: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/expenses`);
      if (!resp.ok) throw Error('Failed to load expenses');
      const data: Expense[] = await resp.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

    const handleEditClick = (expense: Expense) => {
    console.log('[client] edit click', expense.expense_id);
    setEditingExpense(expense);

    // Format date to yyyy-MM-dd for input[type="date"]
    let formattedDate = '';
    if (expense.expense_date) {
      const date = new Date(expense.expense_date);
      formattedDate = date.toISOString().split('T')[0];
    }

    setFormData({
      title: expense.expense_title,
      category: expense.expense_category,
      amount: (expense.expense_amount_cents / 100).toFixed(2),
      date: formattedDate,
      note: expense.expense_note || '',
    });
    setShowModal(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setDeletingId(expense.expense_id);
    setDeletingTitle(expense.expense_title);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${deletingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      setShowDeleteConfirm(false);
      setDeletingId(null);
      setDeletingTitle('');
      await fetchExpenses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
      console.error('Error deleting expense:', err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingId(null);
    setDeletingTitle('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.category || !formData.amount || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid amount');
      return;
    }

    // convert dollars to integer cents
    const amountCents = Math.round(amount * 100);

    try {
      const payload = {
        title: formData.title,
        date: formData.date,
        amount_cents: amountCents,
        category: formData.category,
        ...(formData.note ? { note: formData.note } : {}),
      };

      const url = editingExpense
        ? `${API_BASE_URL}/expenses/${editingExpense.expense_id}`
        : `${API_BASE_URL}/expenses`;
      // server expects PATCH for updates
      const method = editingExpense ? 'PATCH' : 'POST';

      console.log('[client] submitting', { method, url, payload });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[client] response body', text);
        throw new Error('Failed to save expense');
      }

      setShowModal(false);
      await fetchExpenses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save expense');
      console.error('Error saving expense:', err);
    }
  };

  const handleAddClick = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Food',
      amount: '',
      note: '',
      date: ''
    });
    setShowModal(true);
  };

    const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    // return ISO yyyy-mm-dd (useful for display and for inputs)
    return new Date(dateString).toISOString().split('T')[0];
  };

  useEffect(() => {fetchExpenses();}, []);

  return (
    <div>
      <h1>Expense Management</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading expenses...</div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <button style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginBottom: '1rem' }} onClick={handleAddClick}>
            + Add Expense
          </button>
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Title</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Note</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length == 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                      No expenses yet. Click "Add Expense" to get started.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.expense_id}>
                      <td>{formatDate(expense.expense_date)}</td>
                      <td>{expense.expense_title}</td>
                      <td>
                        <span
                          className="category-badge"
                          style={{
                            backgroundColor: CATEGORY_COLORS[expense.expense_category] || '#95a5a6',
                            color: '#ffffff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-block'
                          }}
                        >
                          {expense.expense_category}
                        </span>
                      </td>
                      <td>${(expense.expense_amount_cents / 100).toFixed(2)}</td>
                      <td>{expense.expense_note}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditClick(expense)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteClick(expense)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
            <button className="btn-close" onClick={() => setShowModal(false)}>
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Coffee, Concert ticket"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="Food">Food</option>
                <option value="Housing">Housing</option>
                <option value="Transportation">Transportation</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">
                Amount ($) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">
                Date <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  placeholder="YYYY-MM-DD"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setFormData({ ...formData, date: todayIso })}
                  title="Set to today"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="note">Notes</label>
              <textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Optional notes about this expense"
                rows={3}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingExpense ? 'Update' : 'Add'} Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {showDeleteConfirm && (
      <div className="modal-overlay" onClick={cancelDelete}>
        <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Confirm Deletion</h2>
            <button className="btn-close" onClick={cancelDelete}>
              &times;
            </button>
          </div>
          <div className="delete-modal-body">
            <div className="delete-icon">⚠️</div>
            <p>Are you sure you want to delete <strong>{deletingTitle}</strong>?</p>
            <p className="delete-warning">This action cannot be undone.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={cancelDelete}>
              Cancel
            </button>
            <button type="button" className="btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}
