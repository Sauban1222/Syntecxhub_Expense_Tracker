import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, X } from 'lucide-react';
import {
  DEFAULT_TRANSACTION_CATEGORY,
  getCurrencySymbol,
  getTransactionCategoryOptions,
} from '../utils/finance.js';

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function TransactionModal({ transaction, currency = 'USD', onClose, onSave }) {
  const descriptionRef = useRef(null);
  const [form, setForm] = useState(() => ({
    description: transaction?.description || '',
    amount: transaction?.amount ?? '',
    category: transaction?.category || DEFAULT_TRANSACTION_CATEGORY,
    date: transaction?.date || getToday(),
    type: transaction?.type || 'expense',
  }));
  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);
  const categoryOptions = getTransactionCategoryOptions(transaction?.category);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusableElements = descriptionRef.current
        ?.closest('[role="dialog"]')
        ?.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled])');
      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    descriptionRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setValidationError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim()) {
      setValidationError('Add a short description for this transaction.');
      descriptionRef.current?.focus();
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setValidationError('Enter an amount greater than zero.');
      return;
    }
    if (!form.date || Number.isNaN(new Date(`${form.date}T00:00:00`).getTime())) {
      setValidationError('Choose a valid transaction date.');
      return;
    }

    setSaving(true);
    try {
      await onSave({ ...form, description: form.description.trim(), amount });
      onClose();
    } catch (error) {
      setValidationError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
        <div className="modal-header">
          <div>
            <div className="modal-kicker"><span className="modal-kicker-dot" /> TRANSACTION</div>
            <h2 id="modal-title">{transaction ? 'Edit transaction' : 'Add transaction'}</h2>
            <p id="modal-description">Keep your finances up to date.</p>
          </div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type-toggle" role="group" aria-label="Transaction type">
            <button type="button" className={form.type === 'expense' ? 'type-active type-expense' : ''} onClick={() => setForm((current) => ({ ...current, type: 'expense' }))}>Expense</button>
            <button type="button" className={form.type === 'income' ? 'type-active type-income' : ''} onClick={() => setForm((current) => ({ ...current, type: 'income' }))}>Income</button>
          </div>

          <label className="form-label amount-label" htmlFor="transaction-amount">Amount</label>
          <div className="amount-input-wrap">
            <span>{getCurrencySymbol(currency)}</span>
            <input id="transaction-amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={updateField} required />
            <span className="currency-code">{currency}</span>
          </div>

          <div className="form-grid">
            <label className="form-label" htmlFor="transaction-description">Description
              <input ref={descriptionRef} id="transaction-description" name="description" type="text" maxLength="80" placeholder="e.g. Weekly groceries" value={form.description} onChange={updateField} required />
            </label>
            <label className="form-label" htmlFor="transaction-category">Category
              <span className="select-wrap">
                <select id="transaction-category" name="category" value={form.category} onChange={updateField}>
                  {categoryOptions.map((category) => <option key={category}>{category}</option>)}
                </select>
                <ChevronDown size={15} />
              </span>
            </label>
          </div>
          <label className="form-label" htmlFor="transaction-date">Date
            <span className="date-input-wrap">
              <input id="transaction-date" name="date" type="date" value={form.date} onChange={updateField} required />
              <CalendarDays size={16} />
            </span>
          </label>

          {validationError && <p className="form-error" role="alert">{validationError}</p>}

          <div className="modal-footer">
            <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary modal-submit" disabled={saving}>
              {saving ? <span className="button-spinner" /> : <Check size={16} />}
              {saving ? 'Saving...' : transaction ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
