// Logic for the dashboard page.  This file initializes the candlestick
// chart, fetches market data, displays technical analysis results and
// generates recommendations.  It also configures navigation between
// different sections of the application.

document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  // Show admin menu if the logged in user has admin role
  const adminMenu = document.getElementById('adminMenu');
  if (adminMenu && user && user.role === 'admin') {
    adminMenu.style.display = 'block';
  }

  // Initialise chart
  const chartContainer = document.getElementById('chart');
  const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: 400,
    layout: { background: { color: '#121212' }, textColor: '#ccc' },
    grid: { vertLines: { color: '#2a2a2a' }, horzLines: { color: '#2a2a2a' } },
    crosshair: { mode: 0 },
    rightPriceScale: { borderColor: '#555' },
    timeScale: { borderColor: '#555' }
  });
  const candlestickSeries = chart.addCandlestickSeries({
    upColor: '#0f0',
    downColor: '#f00',
    borderUpColor: '#0f0',
    borderDownColor: '#f00',
    wickUpColor: '#0f0',
    wickDownColor: '#f00'
  });

  async function updateChart() {
    const symbol = document.getElementById('symbolSelect').value;
    const interval = document.getElementById('intervalSelect').value;
    // Disable update button while loading
    const btn = document.getElementById('updateBtn');
    btn.disabled = true;
    btn.textContent = 'Cargando...';
    try {
      // Fetch candle data from backend
      const res = await fetch(`/api/market-data?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`);
      const data = await res.json();
      // Transform into format required by lightweight-charts
      const chartData = data.map(c => ({
        time: Math.floor(new Date(c.date).getTime() / 1000),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      }));
      candlestickSeries.setData(chartData);
      chart.timeScale().fitContent();
      // Fetch analysis
      const an = await fetch(`/api/analyze?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`);
      const anData = await an.json();
      displayAnalysis(anData);
      // Fetch recommendation
      const rec = await fetch(`/api/recommendation?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`);
      const recData = await rec.json();
      displayRecommendation(recData);
    } catch (err) {
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Actualizar';
    }
  }

  function displayAnalysis(an) {
    const container = document.getElementById('analysisDetails');
    container.innerHTML = '';
    if (!an || !an.indicators) {
      container.textContent = 'Sin datos';
      return;
    }
    const { indicators, summary } = an;
    const items = [
      { label: 'RSI', value: `${indicators.rsi.toFixed(2)} (${indicators.rsi < 30 ? 'sobreventa' : indicators.rsi > 70 ? 'sobrecompra' : 'neutral'})` },
      { label: 'MACD', value: `${(indicators.macd.MACD - indicators.macd.signal).toFixed(4)} (${indicators.macd.histogram >= 0 ? 'alcista' : 'bajista'})` },
      { label: 'EMA 9', value: indicators.ema9.toFixed(2) },
      { label: 'EMA 21', value: indicators.ema21.toFixed(2) },
      { label: 'EMA 200', value: indicators.ema200.toFixed(2) },
      { label: 'Prob. subida', value: `${summary.probabilityUp}%` },
      { label: 'Prob. bajada', value: `${summary.probabilityDown}%` }
    ];
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'analysis-item';
      const label = document.createElement('span');
      label.textContent = item.label;
      const value = document.createElement('span');
      value.textContent = item.value;
      div.appendChild(label);
      div.appendChild(value);
      container.appendChild(div);
    });
  }

  function displayRecommendation(recData) {
    const container = document.getElementById('recommendationDetails');
    container.innerHTML = '';
    if (!recData || !recData.recommendation) {
      container.textContent = 'Sin datos';
      return;
    }
    const { action, entry, takeProfit, stopLoss, risk, confidence } = recData.recommendation;
    const statusColor = action === 'BUY' ? '#0f0' : action === 'SELL' ? '#f00' : '#ff0';
    container.innerHTML = `
      <p>Señal: <span style="color:${statusColor}">${action === 'BUY' ? 'COMPRA' : action === 'SELL' ? 'VENTA' : 'ESPERAR'}</span></p>
      <p>Entrada sugerida: ${entry.toFixed(3)}</p>
      <p>Take Profit: ${takeProfit}</p>
      <p>Stop Loss: ${stopLoss}</p>
      <p>Riesgo estimado: ${risk}</p>
      <p>Confianza: ${confidence}%</p>
    `;
  }

  // Attach event listeners
  document.getElementById('updateBtn').addEventListener('click', updateChart);
  document.getElementById('symbolSelect').addEventListener('change', updateChart);
  document.getElementById('intervalSelect').addEventListener('change', updateChart);
  window.addEventListener('resize', () => {
    chart.applyOptions({ width: chartContainer.clientWidth });
  });
  // Navigation function to switch pages
  window.navigate = (page) => {
    if (page === 'dashboard') {
      // Already here; do nothing
      return;
    }
    if (page === 'trade-log') {
      window.location.href = 'trade-log.html';
    } else if (page === 'admin') {
      window.location.href = 'admin.html';
    }
  };
  // Initial load
  updateChart();
});
