<template>
  <div v-if="visible" class="sidebar-overlay" @click="close">
    <div class="sidebar-menu" @click.stop>
      <!-- Header / Profile -->
      <div class="sidebar-header">
        <div class="avatar" v-if="user">
          {{ avatarInitial }}
        </div>
        <div class="avatar-placeholder" v-else>
          <span>👤</span>
        </div>
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="user-email">{{ userEmail }}</div>
        </div>
      </div>

      <!-- Upgrade Banner -->
      <div class="sidebar-content">
        <div class="upgrade-banner">
            <div class="coin-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="gold"><circle cx="12" cy="12" r="10" stroke="orange" stroke-width="2" fill="#ffd700" /><text x="12" y="16" font-size="12" text-anchor="middle" fill="orange" font-weight="bold">♛</text></svg>
            </div>
            <div class="banner-text">
                <div class="banner-title">Upgrade Now</div>
                <div class="banner-desc">Access all of Leader's features and get the edge you need to close more deals.</div>
            </div>
        </div>

        <!-- Menu Items -->
        <div class="menu-list">
            
            <div class="menu-item" @click="handleItemClick('desktop')">
                <span class="menu-icon">🖥️</span>
                <span class="menu-label">Leader for Desktop</span>
                <span class="new-badge">New</span>
            </div>

            <div class="menu-item">
                <span class="menu-icon">📢</span>
                <span class="menu-label">What's New</span>
            </div>

            <div class="menu-item">
                <span class="menu-icon">🤲</span>
                <span class="menu-label">My Quotes</span>
            </div>

            <div class="menu-item" @click="handleItemClick('teammates')">
                <span class="menu-icon">👥</span>
                <span class="menu-label">Teammates</span>
                <span class="plus-mini">+</span>
            </div>

             <div class="menu-item">
                <span class="menu-icon">📇</span>
                <span class="menu-label">My Business Card</span>
            </div>

             <div class="menu-item" @click="handleItemClick('my-notes')">
                <span class="menu-icon">📝</span>
                <span class="menu-label">My Notes</span>
            </div>
            
            <div class="divider"></div>

            <div class="menu-item" @click="handleItemClick('workspaces')">
                <span class="menu-icon" v-if="!isWorkspacesLoading">🔲</span> 
                <span class="menu-icon spinner" v-else>↻</span>
                <span class="menu-label">Workspaces</span>
            </div>

             <div class="menu-item" @click="handleItemClick('settings')">
                <span class="menu-icon">⚙️</span>
                <span class="menu-label">Settings</span>
            </div>



             <div class="menu-item">
                <span class="menu-icon">💬</span>
                <span class="menu-label">Contact Us</span>
            </div>

             <div class="menu-item">
                <span class="menu-icon">❓</span>
                <span class="menu-label">Support</span>
            </div>

             <div class="menu-item">
                <span class="menu-icon">▶️</span>
                <span class="menu-label">Tutorial</span>
            </div>

            <div class="divider"></div>

             <div class="menu-item">
                <span class="menu-icon">👑</span>
                <span class="menu-label">Restore Purchases</span>
            </div>

             <div class="menu-item">
                <span class="menu-icon">✨</span>
                <span class="menu-label">Rate LEADER</span>
            </div>

            <div class="divider"></div>

             <div class="menu-item" @click="handleLogout">
                <span class="menu-icon" style="color: #d32f2f;">🚪</span>
                <span class="menu-label" style="color: #d32f2f;">Logout</span>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import api from '../services/api';

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['close']);

const router = useRouter();
const store = useStore();
const user = computed(() => store.getters.currentUser);

const userName = computed(() => {
    if (user.value) return user.value.Username || user.value.username || 'Guest';
    return 'Guest';
});

const userEmail = computed(() => {
    if (user.value) return user.value.Email || user.value.email || '';
    return '';
});

const avatarInitial = computed(() => {
    const name = userName.value;
    return name ? name.charAt(0).toUpperCase() : 'B';
});

const close = () => {
  emit('close');
};

const handleItemClick = async (item) => {
    // Debug: Clicked item
    if (item === 'workspaces') {
        // Always navigate to the selection list view.
        // Logic for handling empty workspaces or "My Workspace" placeholder is now in WorkspaceSelectionView.vue
        router.push('/workspace-selection');
        close();
        return;
    }

    if (item === 'teammates') {
        try {
            // Check fresh profile from DB as requested
            const res = await api.get('/auth/profil');
            let freshUser = user.value;

            if (res.data && res.data.Data) {
                store.commit('SET_USER', res.data.Data);
                freshUser = res.data.Data;
            } else if (res.data && res.data.data) {
                 store.commit('SET_USER', res.data.data);
                 freshUser = res.data.data;
            }

            // Logic per request:
            // "when teammates is clicked , in the case of Myworkspace is selected (TenantId null) -> show Image 3 (Tenant Setup)"
            // "otherwise (user has workspace or invited workspace selected) -> show Image 4 (Invite Teammates)"
            
            const hasTenant = freshUser && (freshUser.TenantId || freshUser.tenantId);
            
            // Note: If we set TenantId to null in WorkspaceSelectionView when selecting 'My Workspace', hasTenant will be false.
            
            if (hasTenant) {
                 router.push({ path: '/invite-teammates', query: { step: 'review' } });
            } else {
                 router.push('/tenant-setup');
            }
        } catch (e) {
            // Fallback
            const hasTenant = user.value && (user.value.TenantId || user.value.tenantId);
             if (hasTenant) {
                 router.push({ path: '/invite-teammates', query: { step: 'review' } });
            } else {
                 router.push('/tenant-setup');
            }
        }
    }

    if (item === 'settings') {
        router.push('/settings');
        return;
    }

    if (item === 'my-notes') {
        router.push('/my-notes');
        return;
    }
};

const handleLogout = () => {
    store.dispatch('logout');
    close();
};

</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Dimmed background */
  z-index: 1000; /* High z-index to be on top */
  display: flex;
  justify-content: flex-start;
}

.sidebar-menu {
  width: 85%; /* As per image, takes most of width */
  max-width: 320px;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
  overflow-y: auto;
  position: relative;
  z-index: 1001; /* Ensure higher than overlay or other elements */
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.sidebar-header {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.avatar {
    width: 50px;
    height: 50px;
    background-color: #ba68c8; /* Purple from image */
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 500;
}
.avatar-placeholder {
     width: 50px;
    height: 50px;
    background-color: #eee;
    border-radius: 50%;
     display: flex;
    align-items: center;
    justify-content: center;
}

.user-details {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: bold;
    font-size: 1rem;
    color: #333;
}

.user-email {
    font-size: 0.8rem;
    color: #666;
}

.logout-icon {
    margin-left: auto; /* Pushes to the right */
    cursor: pointer;
    font-size: 1.2rem;
    padding: 10px;
    border-radius: 50%;
    transition: background 0.2s;
}

.logout-icon:hover {
    background-color: #f0f0f0;
}

.sidebar-content {
    padding: 15px;
    flex: 1;
}

.upgrade-banner {
    background: linear-gradient(to right, #f3e5f5, #e1bee7); /* Light purple gradient */
    border-radius: 12px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.coin-icon {
    flex-shrink: 0;
}

.banner-text {
    flex: 1;
}

.banner-title {
    font-weight: bold;
    font-size: 0.95rem;
    color: #333;
    margin-bottom: 4px;
}

.banner-desc {
    font-size: 0.75rem;
    color: #555;
    line-height: 1.2;
}

.menu-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 12px 10px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.2s;
    color: #444;
}

.menu-item:hover {
    background-color: #f5f5f5;
}

.menu-icon {
    font-size: 1.2rem;
    width: 30px;
    color: #666; /* Or specific purple for some icons */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
}

.menu-label {
    flex: 1;
    font-size: 0.95rem;
}

.new-badge {
    background-color: #6200ea;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: bold;
}

.plus-mini {
    font-size: 0.8rem;
    color: #6200ea;
    margin-left: -5px; /* Adjust near icon if needed, but flex layout puts it right? No, flex 1 is label. */
    /* Ah, teammates has icon+plus. Let's just assume icon handles it or simplified */
}

.divider {
    height: 1px;
    background-color: #eee;
    margin: 5px 0;
}

.spinner {
    animation: spin 1s linear infinite;
    display: inline-block;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
