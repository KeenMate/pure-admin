<script>
  export let label = '';
  export let value = '';
  export let icon = '';
  export let type = 'primary';
  export let change = '';

  $: isPositive = change && change.startsWith('+');
</script>

<div class="widget-stat-card">
  <div class="widget-stat-icon {type}">
    {icon}
  </div>
  <div class="widget-stat-content">
    <div class="widget-stat-value">{value}</div>
    <div class="widget-stat-label">{label}</div>
    {#if change}
      <div class="widget-stat-change {isPositive ? 'positive' : 'negative'}">
        {change} from last month
      </div>
    {/if}
  </div>
</div>

<style>
  .widget-stat-change {
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }

  .widget-stat-change.positive {
    color: var(--success-color);
  }

  .widget-stat-change.negative {
    color: var(--danger-color);
  }
</style>