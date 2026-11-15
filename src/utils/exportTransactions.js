function escapeCsv(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportTransactions(transactions) {
  const header = ['Description', 'Amount', 'Category', 'Date', 'Type'];
  const rows = transactions.map((transaction) => [
    transaction.description,
    transaction.amount,
    transaction.category,
    transaction.date,
    transaction.type,
  ]);
  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spendly-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
