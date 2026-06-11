import { mount } from 'svelte';
import App from './App.svelte';
import '@keenmate/svelte-treeview/styles.css';

const target = document.getElementById('treeview-app');
if (target) {
  mount(App, { target });
}
