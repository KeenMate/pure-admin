// Pure Admin Kit - Svelte Component Library
export { default as Header } from './components/Header.svelte';
export { default as Sidebar } from './components/Sidebar.svelte';
export { default as StatCard } from './components/StatCard.svelte';
export { default as DataTable } from './components/DataTable.svelte';
export { default as ChartCard } from './components/ChartCard.svelte';

// CSS styles - import this in your app
export const styles = () => import('../app.css');