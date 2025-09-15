<script>
  export let data = [];
  export let columns = [];

  function getStatusClass(status) {
    switch(status) {
      case 'completed': return 'status-success';
      case 'pending': return 'status-warning';
      case 'processing': return 'status-info';
      case 'failed': return 'status-danger';
      default: return '';
    }
  }
</script>

<div class="table-wrapper">
  <table class="pure-table pure-table-horizontal admin-table">
    <thead>
      <tr>
        {#each columns as column}
          <th>{column.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row}
        <tr>
          {#each columns as column}
            <td>
              {#if column.key === 'status'}
                <span class="status-badge {getStatusClass(row[column.key])}">
                  {row[column.key]}
                </span>
              {:else}
                {row[column.key]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrapper {
    overflow-x: auto;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .status-success {
    background-color: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
  }

  .status-warning {
    background-color: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
  }

  .status-info {
    background-color: rgba(6, 182, 212, 0.1);
    color: var(--info-color);
  }

  .status-danger {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
  }
</style>