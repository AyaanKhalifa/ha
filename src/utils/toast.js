// src/utils/toast.js
// Stub toast — replace with real react-hot-toast if installed
const toast = (msg) => console.log('[toast]', msg);
toast.success = (msg) => console.log('%c✓ ' + msg, 'color:green');
toast.error   = (msg) => console.error('%c✗ ' + msg, 'color:red');
toast.loading = (msg) => console.log('[toast:loading]', msg);
toast.dismiss = () => {};
export default toast;
