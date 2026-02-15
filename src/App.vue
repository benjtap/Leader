<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { App as CapacitorApp } from '@capacitor/app';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import api from './services/api'

onMounted(() => {
  // Wake up Render Backend (Free Tier Cold Start) - Fire and forget
  // This helps start the server while the user enters credentials
  // api.get('/').catch(() => { /* Ignore errors, just waking up */ });

  // Tente de passer en plein écran dès la première interaction (clic) de l'utilisateur
  // Les navigateurs bloquent le plein écran automatique sans interaction pour sécurité.
  const goFullScreen = () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log("Plein écran bloqué par le navigateur :", err.message);
      });
    }
  };

  window.addEventListener('click', goFullScreen, { once: true });

  // Deep Link Listener
  CapacitorApp.addListener('appUrlOpen', async (data) => {
      // Example: leader://invite?token=XYZ
      const url = new URL(data.url);
      const token = url.searchParams.get('token');
      
      if (url.host === 'invite' && token) {
          const store = useStore();
          // Assuming user is logged in. If not, maybe store token and redirect to login?
          // For now, try join directly.
          if (store.getters.isAuthenticated) {
              try {
                  await store.dispatch('joinTenant', token);
              } catch (e) {
                  // Handled in store
              }
          } else {
             // User not logged in, but has invite token.
             localStorage.setItem('pending_invite_token', token);
             
             // Visual Feedback
             store.dispatch('showToast', { 
                message: 'Invite received! Please login/signup to join.', 
                type: 'info' 
             });

             // Ensure we are on the login page
             // We need to import router carefully or use window.location if router is not valid here
             // But since we are inside onMounted of App.vue, we can use the router instance if we initialized it properly.
             // However, `useRouter()` inside setup() is fine, but inside the callback? 
             // Start of script setup defines `router`. We can use it.
             router.push({ name: 'login' });
          }
      }
  });
})

const store = useStore();
const router = useRouter(); // Initialize for usage if needed later
</script>

<template>
  <div v-if="$store.getters.isLoadingRoute" class="global-loader"></div>
  <RouterView />
  
  <!-- Global Toast Notification -->
  <transition name="fade-fast">
      <div v-if="$store.state.toast.visible" class="toast-notification">
          <div class="toast-content" :class="$store.state.toast.type">
              <div class="toast-icon-wrapper">
                  <svg v-if="$store.state.toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <svg v-else-if="$store.state.toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </div>
              <div class="toast-text">{{ $store.state.toast.message }}</div>
          </div>
      </div>
  </transition>
</template>

<style>
/* Global resets */
body {
  margin: 0;
  padding: 0;
}

/* Toast Styles */
.toast-notification {
    position: fixed;
    top: 20px; /* Top positioning for global visibility */
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    pointer-events: none; /* Allow clicking through if not on toast */
}

.toast-content {
    background-color: white;
    border-radius: 100px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06);
    direction: rtl;
    min-width: fit-content;
    max-width: 90vw;
    pointer-events: auto;
    border: 1px solid rgba(0,0,0,0.05);
}

.toast-content.success .toast-icon-wrapper {
    color: #10b981;
}

.toast-content.error .toast-icon-wrapper {
    color: #ef4444;
}

.toast-content.info .toast-icon-wrapper {
    color: #3b82f6;
}

.toast-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.toast-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: #1f2937;
    white-space: nowrap;
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* Global Route Loader */
.global-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 4px;
    z-index: 10000;
    background: linear-gradient(90deg, #0093AB, #4DD0E1, #ffffff);
    background-size: 200% 100%;
    animation: loadingRoute 1.5s infinite linear;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

@keyframes loadingRoute {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}
</style>
