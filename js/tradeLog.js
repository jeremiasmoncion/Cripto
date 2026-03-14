// Logic for the trading log page.  This script handles fetching existing
// trades from the backend and submitting new trade entries.  It
// populates the trade history table with profit/loss and ROI values,
// displaying a running balance for the current user.  Only logged in
// users may access this page; admins will see all trades while normal
// users see only their own.

document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  // Show admin menu if the logged in user has admin role
  const adminMenu = document.getElementById('adminMenu');
  if (adminMenu && user && user.role === 'admin') {
    adminMenu.style.display = 'block';
  }

  /**
   * Fetch existing trades from the backend and populate the table.
   */
  async function loadTrades() {
    try {
      const res = await fetch('/api/trade-log');
      if (!res.ok) {
        throw new Error('Error al obtener operaciones');
      }
      const trades = await res.json();
      populateTable(trades);
    } catch (err) {
      console.error(err);
      // In a production system you might display an error message to the user
    }
  }

  /**
   * Render the table rows based on the trade data.  Each trade shows
   * date, symbol, type, entry price, exit price, amount, profit/loss,
   * ROI percentage and running balance.  Positive values are coloured
   * green and negative values red for quick visual identification.
   *
   * @param {Array} trades List of trade objects returned by the backend
   */
  function populateTable(trades) {
    const tbody = document.getElementById('tradeRows');
    tbody.innerHTML = '';
    if (!Array.isArray(trades) || trades.length === 0) {
      // No trades yet
      return;
    }
    // Sort trades by date ascending to maintain chronological balance
    trades.sort((a, b) => new Date(a.date) - new Date(b.date));
    trades.forEach(trade => {
      const row = document.createElement('tr');
      const cells = [];
      cells.push(formatDate(trade.date));
      cells.push(trade.symbol);
      cells.push(trade.type);
      cells.push(trade.entry_price.toFixed(4));
      cells.push(trade.exit_price.toFixed(4));
      cells.push(trade.amount.toFixed(4));
      // Profit/loss cell with colour
      const profitCell = document.createElement('td');
      const profitValue = trade.profit.toFixed(4);
      profitCell.textContent = profitValue;
      profitCell.style.color = trade.profit >= 0 ? '#0f0' : '#f00';
      // ROI percentage
      const roiCell = document.createElement('td');
      const roiValue = (trade.roi * 100).toFixed(2);
      roiCell.textContent = roiValue;
      roiCell.style.color = trade.roi >= 0 ? '#0f0' : '#f00';
      cells.forEach(text => {
        const td = document.createElement('td');
        td.textContent = text;
        row.appendChild(td);
      });
      row.appendChild(profitCell);
      row.appendChild(roiCell);
      // Balance
      const balTd = document.createElement('td');
      balTd.textContent = trade.balance.toFixed(4);
      balTd.style.color = trade.balance >= 0 ? '#0f0' : '#f00';
      row.appendChild(balTd);
      tbody.appendChild(row);
    });
  }

  /**
   * Convert an ISO date string to a more friendly format (YYYY-MM-DD).
   *
   * @param {string} isoDate
   * @returns {string}
   */
  function formatDate(isoDate) {
    try {
      const d = new Date(isoDate);
      return d.toISOString().split('T')[0];
    } catch {
      return isoDate;
    }
  }

  // Handle form submission to record a new trade
  const form = document.getElementById('tradeForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Gather form values
    const tradeDate = document.getElementById('tradeDate').value;
    const symbol = document.getElementById('tradeSymbol').value;
    const type = document.getElementById('tradeType').value;
    const entryPrice = parseFloat(document.getElementById('entryPrice').value);
    const exitPrice = parseFloat(document.getElementById('exitPrice').value);
    const amount = parseFloat(document.getElementById('amount').value);
    const commissionValue = document.getElementById('commission').value;
    const commission = commissionValue ? parseFloat(commissionValue) : 0;
    const notes = document.getElementById('notes').value;
    const payload = {
      date: tradeDate,
      symbol: symbol,
      type: type,
      entry_price: entryPrice,
      exit_price: exitPrice,
      amount: amount,
      commission: commission,
      notes: notes
    };
    try {
      const res = await fetch('/api/trade-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data && data.error ? data.error : 'Error al guardar la operación';
        alert(msg);
        return;
      }
      // Reset form and reload trades on success
      form.reset();
      loadTrades();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la operación');
    }
  });

  // Initial load of trades on page entry
  loadTrades();
});

// Export navigate function for sidebar links.  This attaches to the
// global object so that inline onclick handlers can call navigate().
window.navigate = (page) => {
  if (page === 'dashboard') {
    window.location.href = 'dashboard.html';
  } else if (page === 'trade-log') {
    window.location.href = 'trade-log.html';
  } else if (page === 'admin') {
    window.location.href = 'admin.html';
  }
};
