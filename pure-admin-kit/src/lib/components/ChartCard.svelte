<script>
  export let type = 'line';

  // Placeholder for chart - in production, you'd integrate with Chart.js or similar
  const chartPlaceholder = {
    line: '📈 Line Chart Placeholder',
    bar: '📊 Bar Chart Placeholder',
    doughnut: '🍩 Doughnut Chart Placeholder',
    area: '📉 Area Chart Placeholder'
  };
</script>

<div class="chart-container">
  <div class="chart-placeholder">
    {chartPlaceholder[type] || 'Chart'}
    <p class="chart-info">Integrate with Chart.js, D3.js, or another charting library</p>
  </div>
</div>

<style>
  .chart-container {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-placeholder {
    text-align: center;
    color: var(--secondary-color);
    font-size: 1.25rem;
  }

  .chart-info {
    font-size: 0.875rem;
    margin-top: 1rem;
    color: var(--secondary-color);
  }
</style>