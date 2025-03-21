import Main from './Main.svelte';
import Test from './Test.svelte';
import Form from './Form.svelte';

export default{
    '/': Main,
    '/test': Test, // /#/test
    '/form': Form
};
