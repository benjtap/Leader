import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { setupInterceptors } from './services/api'
import './style.css' // Import global styles if available, or create them

const app = createApp(App)

app.use(store)
app.use(router)
setupInterceptors(store)

// CRITICAL: Restore token from localStorage if vuex-persistedstate didn't sync it yet
// This handles the migration from manual storage to persisted state
const rawToken = localStorage.getItem('token')
if (rawToken && !store.state.token) {
    console.log('Restoring token from localStorage (migration fix)')
    store.commit('SET_TOKEN', rawToken)
}

// Initialize data if user is logged in
if (store.state.token) {
    store.dispatch('fetchInitialData')
}

// FORCE UNREGISTER ALL SERVICE WORKERS TO CLEAR CACHE
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            console.log('Unregistering SW:', registration);
            registration.unregister();
        }
    });
}

app.mount('#app')
