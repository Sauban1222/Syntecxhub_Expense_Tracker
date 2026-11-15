import { useState } from 'react';
import { Check, Coins, Save } from 'lucide-react';
import { AVAILABLE_CURRENCIES } from '../hooks/usePreferences.js';

export default function SettingsPage({ currency, onSaveCurrency, isAuthenticated = false, accountEmail = '' }) {
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      onSaveCurrency(selectedCurrency);
      setSaved(true);
      setFormError('');
    } catch (error) {
      setSaved(false);
      setFormError(error.message);
    }
  }

  return (
    <div className="page-content settings-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> MAKE SPENDLY YOURS</div>
          <h1>Settings</h1>
          <p>Personalize how your financial information is displayed.</p>
        </div>
      </div>
      <section className="panel settings-panel">
        <div className="settings-section-icon"><Coins size={19} /></div>
        <div className="settings-section-copy">
          <h2>Regional preferences</h2>
          <p>Choose the currency used for balances, transactions, and analytics.</p>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label htmlFor="settings-currency">Display currency</label>
          <select
            id="settings-currency"
            value={selectedCurrency}
            onChange={(event) => {
              setSelectedCurrency(event.target.value);
              setSaved(false);
              setFormError('');
            }}
          >
            {AVAILABLE_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
          <p className="settings-help">Your preference is saved in this browser.</p>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="button button-primary settings-save" type="submit">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Preferences saved' : 'Save preferences'}
          </button>
        </form>
      </section>
      <div className="settings-local-note">
        {isAuthenticated
          ? `Signed in as ${accountEmail || 'your Supabase account'}. Display preferences are stored in this browser.`
          : 'You are using the local demo workspace. Sign in with Supabase to use a private account.'}
      </div>
    </div>
  );
}
