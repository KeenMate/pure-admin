<script lang="ts">
  import { Tree } from '@keenmate/svelte-treeview';
  import type { LTreeNode, ClickBehavior, SelectionMode } from '@keenmate/svelte-treeview';

  interface Item {
    id: number;
    path: string;
    name: string;
    icon: string;
  }

  const sampleData: Item[] = [
    { id: 1, path: '1', name: 'Documents', icon: '📁' },
    { id: 2, path: '1.1', name: 'Work', icon: '💼' },
    { id: 3, path: '1.1.1', name: 'Reports', icon: '📊' },
    { id: 4, path: '1.1.2', name: 'Presentations', icon: '📽️' },
    { id: 5, path: '1.1.3', name: 'Spreadsheets', icon: '📈' },
    { id: 6, path: '1.2', name: 'Personal', icon: '🏠' },
    { id: 7, path: '1.2.1', name: 'Photos', icon: '📷' },
    { id: 8, path: '1.2.2', name: 'Music', icon: '🎵' },
    { id: 9, path: '1.2.3', name: 'Videos', icon: '🎬' },
    { id: 10, path: '2', name: 'Downloads', icon: '⬇️' },
    { id: 11, path: '2.1', name: 'Software', icon: '💿' },
    { id: 12, path: '2.2', name: 'Media', icon: '🎞️' },
    { id: 13, path: '2.3', name: 'Archives', icon: '📦' },
    { id: 14, path: '3', name: 'Projects', icon: '🚀' },
    { id: 15, path: '3.1', name: 'Web App', icon: '🌐' },
    { id: 16, path: '3.1.1', name: 'Frontend', icon: '🎨' },
    { id: 17, path: '3.1.2', name: 'Backend', icon: '⚙️' },
    { id: 18, path: '3.1.3', name: 'Tests', icon: '🧪' },
    { id: 19, path: '3.2', name: 'Mobile App', icon: '📱' },
    { id: 20, path: '3.2.1', name: 'iOS', icon: '🍎' },
    { id: 21, path: '3.2.2', name: 'Android', icon: '🤖' }
  ];

  function sortByName(items: LTreeNode<Item>[]) {
    return [...items].sort((a, b) => (a.data?.name || '').localeCompare(b.data?.name || ''));
  }

  let clickBehavior = $state<ClickBehavior>('expand-and-focus');
  let selectionMode = $state<SelectionMode>('multi');
  let highlightedNodeClass = $state('ltree-selected-bold');
  let showCheckboxes = $state(false);

  let focusedNode = $state<LTreeNode<Item> | null>(null);
  let highlightedPaths = $state(new Set<string>());
  let selectedPaths = $state(new Set<string>());
</script>

<div class="pa-row">
  <div class="pa-col-100 pa-col-md-1-3">
    <div class="pa-form-group">
      <label>Click Behavior</label>
      <select class="pa-select" bind:value={clickBehavior}>
        <option value="expand-and-focus">expand-and-focus</option>
        <option value="select">select (dbl-click to expand)</option>
        <option value="expand">expand (no selection)</option>
      </select>
    </div>
  </div>
  <div class="pa-col-100 pa-col-md-1-3">
    <div class="pa-form-group">
      <label>Selection Mode</label>
      <select class="pa-select" bind:value={selectionMode}>
        <option value="single">single</option>
        <option value="multi">multi (Ctrl/Shift+click)</option>
      </select>
    </div>
  </div>
  <div class="pa-col-100 pa-col-md-1-3">
    <div class="pa-form-group">
      <label>Highlight Style</label>
      <select class="pa-select" bind:value={highlightedNodeClass}>
        <option value="ltree-selected-bold">Bold</option>
        <option value="ltree-selected-border">Border</option>
        <option value="ltree-selected-brackets">Brackets</option>
        <option value="ltree-selected-highlight">Highlight</option>
      </select>
    </div>
  </div>
</div>

<div class="pa-row">
  <div class="pa-col-100 pa-col-md-50">
    <label class="pa-checkbox">
      <input type="checkbox" bind:checked={showCheckboxes} />
      Show Checkboxes
    </label>
  </div>
  <div class="pa-col-100 pa-col-md-50">
    <button
      class="pa-btn pa-btn--secondary pa-btn--sm"
      onclick={() => { highlightedPaths = new Set(); selectedPaths = new Set(); }}>
      Clear Selection
    </button>
  </div>
</div>

<hr />

<div class="pa-row">
  <div class="pa-col-100 pa-col-md-50">
    <h4>Tree</h4>
    <div class="tree-host">
      <Tree
        data={sampleData}
        idMember="id"
        pathMember="path"
        sortCallback={sortByName}
        isSorted={true}
        expandLevel={2}
        {highlightedNodeClass}
        {clickBehavior}
        {selectionMode}
        {showCheckboxes}
        bind:focusedNode
        bind:highlightedPaths
        bind:selectedPaths
      >
        {#snippet nodeTemplate(node: any)}
          <span>{node.data?.icon} {node.data?.name}</span>
        {/snippet}
      </Tree>
    </div>
  </div>
  <div class="pa-col-100 pa-col-md-50">
    <h4>State</h4>
    <div class="pa-form-group">
      <label>Focused</label>
      <pre class="state-output">{focusedNode ? `${focusedNode.data?.icon} ${focusedNode.data?.name} (${focusedNode.path})` : '(none)'}</pre>
    </div>
    <div class="pa-form-group">
      <label>Highlighted ({highlightedPaths.size})</label>
      <pre class="state-output">{highlightedPaths.size ? [...highlightedPaths].join(', ') : '(none — try Ctrl/Shift+click)'}</pre>
    </div>
    <div class="pa-form-group">
      <label>Selected / Checked ({selectedPaths.size})</label>
      <pre class="state-output">{selectedPaths.size ? [...selectedPaths].join(', ') : '(none — enable checkboxes)'}</pre>
    </div>
  </div>
</div>

<style>
  .tree-host {
    height: 40rem;
    overflow: auto;
    border: 1px solid var(--pa-border-color, #e5e7eb);
    border-radius: var(--pa-border-radius, 4px);
    padding: 0.8rem;
    background-color: var(--pa-card-bg, #ffffff);
  }
  .state-output {
    margin: 0;
    padding: 0.8rem;
    background-color: var(--pa-subtle-bg, #f4f6f9);
    border-radius: var(--pa-border-radius, 4px);
    font-size: 1.2rem;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--pa-text-color-1, #1f2937);
  }
  h4 {
    margin: 0 0 1rem 0;
    color: var(--pa-text-color-1);
  }
  hr {
    border: 0;
    border-top: 1px solid var(--pa-border-color, #e5e7eb);
    margin: 1.6rem 0;
  }
</style>
