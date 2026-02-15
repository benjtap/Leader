<template>
  <div class="activity-page">
    <!-- Header / Top Bar similar to image -->
    <div class="top-bar">
      <div class="menu-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
      <div class="user-info" v-if="currentUser">
        <span class="user-name">{{ currentUser.Username || currentUser.username }}</span>
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Search" />
      </div>
      <div class="top-actions">
        <div class="notification-badge">
          <span>🔔</span>
          <span class="badge">1</span>
        </div>
        <div class="profile-icon">
          <span>〓</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Last Activity Panel -->
      <div class="panel activity-panel">
        <div class="panel-header">
          <div>
            <h2>Last Activity</h2>
            <!-- Subtitle kept as it provides context, though not strictly in small crop -->
            <!-- <span class="subtitle">Visible only to you</span> -->
          </div>
          <div class="header-actions">
             <span class="filter-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="4" y1="12" x2="14" y2="12"></line>
                  <line x1="4" y1="18" x2="8" y2="18"></line>
                </svg>
             </span>
             <span class="dots-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
             </span>
          </div>
        </div>
        
        <MobileSyncModal :visible="showSyncModal" @close="showSyncModal = false" />

        <div class="activity-list">
          <div 
            v-for="activity in activities" 
            :key="activity.id" 
            class="activity-item"
            :class="{ expanded: expandedItemId === activity.id }"
            @click="toggleExpand(activity.id)"
          >
            <div class="activity-row">
              <div class="avatar" :style="{ backgroundColor: activity.color || '#6200ea' }">
                <span v-if="!activity.isIcon">{{ activity.initial }}</span>
                <span v-else>👤</span>
              </div>
              
              <div class="info">
                <div class="name" :style="{ color: activity.textColor || '#333' }">{{ activity.name }}</div>
              </div>

              <!-- Collapsed State: Show Time, Meta icons -->
              <div v-if="expandedItemId !== activity.id" class="meta">
                <span class="status-icon" :class="activity.type">
                   <span v-if="activity.type === 'incoming'">↙</span>
                   <span v-else-if="activity.type === 'missed'">↗</span>
                   <span v-else>↔</span>
                </span>
                <span class="time">{{ activity.time }}</span>
                <span class="more-options">⋮</span>
              </div>

               <!-- Expanded State Header: Phone + Dots (Like Screenshot) -->
               <div v-else class="expanded-meta-actions">
                   <button class="icon-btn phone-btn">
                     <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.26-.26.35-.65.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3.3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .69-.63.69-1.19v-3.44c0-.54-.45-.99-.99-.99z"/></svg>
                   </button>
                   <button class="icon-btn more-btn">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                   </button>
               </div>
            </div>

            <!-- Expanded Menu -->
            <div v-if="expandedItemId === activity.id" class="expanded-menu" @click.stop>
                <div class="menu-action" @click.stop="handleAction('actions', activity)">
                    <div class="action-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <span>Actions</span>
                </div>
                <div class="menu-action" @click.stop="handleAction('info', activity)">
                    <div class="action-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span>Info</span>
                </div>
                <div class="menu-action" @click.stop="handleAction('move', activity)">
                    <div class="action-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path><path d="M12 6L15 3M12 6L9 3" transform="translate(8, 0)" stroke-width="2" v-if="false" /> <!-- Simplified list icon--> <rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2" stroke-opacity="0.5" fill="none" class="move-icon-base"/> <path d="M16 8l3 3l-3 3" /></svg>
                    </div>
                    <span>Move to...</span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Nav (Mocked) -->
    <div class="bottom-nav">
       <span class="nav-item">▽</span> <!-- Funnel -->
       <span class="nav-item">👤</span>
       <span class="nav-item main-action">+</span>
       <span class="nav-item">🏷️</span>
       <span class="nav-item">✓</span>
    </div>
    <Teleport to="body">
      <ActionsSheet v-if="showActionsSheet" @close="showActionsSheet = false" @select="onActionSelect" />
      <MoveToSheet 
        v-if="showMoveToSheet" 
        :item="selectedItemForAction" 
        @close="showMoveToSheet = false" 
        @move="onMoveItem" 
      />
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import MobileSyncModal from '../components/MobileSyncModal.vue';
import ActionsSheet from '../components/ActionsSheet.vue';
import MoveToSheet from '../components/MoveToSheet.vue';

const store = useStore();
const router = useRouter();
const showSyncModal = ref(false);
const expandedItemId = ref(null);
const showActionsSheet = ref(false);
const showMoveToSheet = ref(false);
const selectedItemForAction = ref(null);

// Fetch activities on mount
onMounted(() => {
  store.dispatch('fetchActivities');

  // If user is not logged in, prompt for Google Sync immediately
  if (!store.getters.isAuthenticated) {
       showSyncModal.value = true;
  }
});

// Update to use grouped activities
const activities = computed(() => store.getters.groupedActivities);
const currentUser = computed(() => store.getters.currentUser);

const toggleExpand = (id) => {
  if (expandedItemId.value === id) {
    expandedItemId.value = null;
  } else {
    expandedItemId.value = id;
  }
};

const handleAction = (type, activity) => {
    // console.log(`Action ${type} triggered for`, activity);
    
    if (type === 'info') {
        const param = activity.number;
        router.push({ name: 'lead-details', params: { number: param } });
    } else if (type === 'actions') {
        selectedItemForAction.value = activity;
        showActionsSheet.value = true;
    } else if (type === 'move') {
        selectedItemForAction.value = activity;
        showMoveToSheet.value = true;
    }
};

const onActionSelect = (action) => {
    // console.log("Selected action:", action, "for item:", selectedItemForAction.value);
    showActionsSheet.value = false;
};

const onMoveItem = async (targetListId, item, targetUserId) => {
    console.log(`Moving item ${item.name} to ${targetListId} (assigned to: ${targetUserId})`);
    
    try {
        await store.dispatch('moveItem', { item: item, target: targetListId, targetUserId });
        showMoveToSheet.value = false;
        // Optional: Provide feedback or remove from current list
    } catch (e) {
        console.error("Move failed:", e);
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.activity-page {
  font-family: 'Roboto', sans-serif;
  background-color: #f5f6fa;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: #333;
  overflow: hidden;
}

/* Top Bar */
.top-bar {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-bottom: 2px; /* Purple line effect */
  border-bottom: 3px solid #6200ea;
}

.user-info {
  margin-left: 10px;
  margin-right: 10px;
}

.user-name {
  font-weight: bold;
  color: #6200ea;
  font-size: 0.9rem;
}

.search-bar {
  flex: 1;
  background: #f1f3f4;
  border-radius: 20px;
  padding: 8px 15px;
  margin: 0 15px;
  display: flex;
  align-items: center;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  margin-left: 5px;
  width: 100%;
}

.top-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.notification-badge {
  position: relative;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 5px;
  font-size: 10px;
}

/* Main Content Layout */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 10px;
  gap: 10px;
}

.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 15px;
  overflow-y: auto;
}

.activity-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.subtitle {
  font-size: 0.75rem;
  color: #888;
}

.header-actions {
  display: flex;
  gap: 10px;
  font-size: 1.25rem;
}

.action-icon {
    cursor: pointer;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  border: 1px solid #eee;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.activity-item.expanded {
    border-color: #f0f0f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.info {
  flex: 1;
}

.name {
  font-weight: 500;
  font-size: 1rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #888;
}

.status-icon {
    font-weight: bold;
}
.status-icon.incoming { color: #4caf50; }
.status-icon.missed { color: #f44336; }

/* Expanded Meta Actions (Phone, Dots) */
.expanded-meta-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5f6368;
}

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 50%;
}

.phone-btn {
    transform: rotate(0deg); 
}

/* Expanded Menu */
.expanded-menu {
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-around;
    padding: 12px 0;
    background-color: #fff;
    animation: slideDown 0.2s ease-out;
}

.menu-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    width: 33%;
}

.menu-action span {
    font-size: 0.8rem;
    color: #a855f7; /* Purple to match image */
    font-weight: 500;
}

.action-icon {
    width: 24px;
    height: 24px;
    color: #a855f7; /* Purple */
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Bottom Nav */
.bottom-nav {
  background: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
}

.nav-item {
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
}

.main-action {
  background: #6200ea;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -25px;
  box-shadow: 0 4px 10px rgba(98, 0, 234, 0.3);
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .main-content {
        flex-direction: column;
    }
}
</style>
