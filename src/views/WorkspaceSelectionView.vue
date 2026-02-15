<template>
  <div class="workspace-selection-view">
    <div class="header">
      <div class="icon-help">
        <!-- Help Icon restored -->
         <span>?</span>
      </div>
      <h2>Choose your workspace</h2>
    </div>

    <div class="workspace-list" v-if="loading">
        <div class="loading-state">Loading workspaces...</div>
    </div>

    <div class="workspace-list" v-else>
      <div 
        v-for="ws in workspaces" 
        :key="ws.id" 
        class="workspace-item"
        @click="selectWorkspace(ws.id)"
      >
        <div class="ws-avatar" :class="{ 'avatar-purple': !isOwn(ws), 'avatar-blue': isOwn(ws) }">
          {{ getAvatarInitial(ws) }}
        </div>
        <div class="ws-info">
          <div class="ws-name">{{ getWorkspaceName(ws) }}</div>
          <div class="ws-meta">Last use {{ getRandomTime() }}</div>
        </div>
        <div class="ws-check" v-if="selectedId === ws.id">
           <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6200ea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>
    </div>

    <!-- Continue button hidden as per image style logic (auto select or just list)
         But keeping logic.
    -->
    <div class="footer" v-if="selectedId">
        <button class="btn-continue" @click="proceed">Continue</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import api from '../services/api';

const router = useRouter();
const store = useStore();
const workspaces = ref([]);
const loading = ref(true);
const selectedId = ref(null);
const currentUserId = computed(() => store.getters.currentUser?.Id || store.getters.currentUser?.id);

const getAvatarInitial = (ws) => {
    const name = ws.Name || ws.name || '?';
    return name.charAt(0);
};

const isOwn = (ws) => {
    return (ws.OwnerId === currentUserId.value || ws.ownerId === currentUserId.value);
};

const getWorkspaceName = (ws) => {
    return ws.Name || ws.name || 'Workspace';
};

const getRandomTime = () => {
    return "10 min ago";
};

const fetchWorkspaces = async () => {
    try {
        loading.value = true;
        const res = await api.get('/Tenants/my-workspaces');
        let fetchedData = Array.isArray(res.data) ? res.data : (res.data?.Data || []);
        
        // Filter: Owned vs Invited
        const owned = fetchedData.filter(ws => ws.OwnerId === currentUserId.value || ws.ownerId === currentUserId.value);
        const invited = fetchedData.filter(ws => ws.OwnerId !== currentUserId.value && ws.ownerId !== currentUserId.value);

        if (owned.length > 0) {
            // Case 1: User has owned workspace(s)
            // Show owned first, then invited. NO "My Workspace" placeholder.
            // "show up the workspace name that belong to the user in the first place , in second place show the workspace 's user that invited the user"
            workspaces.value = [...owned, ...invited];
        } else {
            // Case 2: User has NO owned workspace
            // Show invited first (if any), then "My Workspace" placeholder as base.
            // "the first is the workspace that invited the user , and the second is the base of the workspace"
             const personalWorkspace = {
                id: 'personal',
                Name: 'My Workspace',
                OwnerId: currentUserId.value,
                _isPlaceholder: true
            };
            workspaces.value = [...invited, personalWorkspace];
        }
        
        const currentTenantId = store.getters.currentUser?.TenantId || store.getters.currentUser?.tenantId;
        
        if (currentTenantId) {
            selectedId.value = currentTenantId;
        } else {
            // If no active tenant, and we have a personal placeholder, default to it.
            // If we have owned workspaces but no active tenant (rare?), select the first owned?
            if (owned.length === 0) {
                 selectedId.value = 'personal';
            } else {
                 selectedId.value = owned[0].id;
            }
        }

    } catch (e) {
        console.error("Failed to fetch workspaces", e);
        // Fallback
         workspaces.value = [{
            id: 'personal',
            Name: 'My Workspace',
            OwnerId: currentUserId.value,
            _isPlaceholder: true
        }];
        selectedId.value = 'personal';
    } finally {
        loading.value = false;
    }
};

const selectWorkspace = (id) => {
    selectedId.value = id;
};

const proceed = async () => {
    if (!selectedId.value) return;

    if (selectedId.value === 'personal') {
        // Handle "My Workspace" selection (leaving specific tenant context)
        // User said: "just select it ( by the store vuex )"
        const user = store.getters.currentUser;
        // Create a new user object without TenantId, or set it to null
        const updatedUser = { ...user, TenantId: null, tenantId: null };  
        store.commit('SET_USER', updatedUser);
        router.push('/dashboard');
        return;
    }

    try {
        const res = await api.post(`/Tenants/switch-workspace/${selectedId.value}`);
        if (res.data.success) {
             store.commit('SET_TOKEN', res.data.token);
             store.commit('SET_USER', res.data.user);
            router.push('/dashboard');
        }
    } catch (e) {
        alert("Failed to switch: " + (e.response?.data || e.message));
    }
};

onMounted(() => {
    fetchWorkspaces();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap');

.workspace-selection-view {
    padding: 20px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
    font-family: 'Roboto', sans-serif;
}

.header {
    text-align: center;
    margin-top: 20px;
    margin-bottom: 30px;
    position: relative;
}

.icon-help {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 1.2rem;
    color: #666;
    padding: 10px; /* larger tap area */
    cursor: pointer;
}

h2 {
    font-size: 1.3rem;
    font-weight: 300;
    color: #333;
    margin: 0;
}

.workspace-list {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.workspace-item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    direction: ltr; 
}

.ws-avatar {
    width: 48px;
    height: 48px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 500;
    margin-right: 15px;
    flex-shrink: 0;
    border-radius: 2px;
}

.avatar-purple {
    background-color: #7b1fa2;
}

.avatar-blue {
    background-color: #0d47a1;
}

.ws-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.ws-name {
    font-size: 1rem;
    color: #333;
    line-height: 1.2;
    margin-bottom: 4px;
    text-align: left;
}

.ws-meta {
    font-size: 0.75rem;
    color: #999;
    text-align: left;
}

.ws-check {
    margin-left: 10px;
    display: flex;
    align-items: center;
}

.footer {
    padding: 20px 0;
}

.btn-continue {
    width: 100%;
    background-color: #6200ea;
    color: white;
    border: none;
    padding: 15px;
    border-radius: 30px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
}
</style>
