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
            <span class="subtitle">Visible only to you</span>
          </div>
          <div class="header-actions">
             <span class="action-icon" @click="showSyncModal = true" title="Sync Mobile">📲</span>
             <span class="filter-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="4" y1="12" x2="14" y2="12"></line>
                  <line x1="4" y1="18" x2="8" y2="18"></line>
                </svg>
             </span>
             <span class="dots-icon">⋮</span>
          </div>
        </div>
        
        <MobileSyncModal :visible="showSyncModal" @close="showSyncModal = false" />

        <div class="activity-list">
          <div 
            v-for="activity in activities" 
            :key="activity.id" 
            class="activity-item"
          >
            <div class="activity-row">
              <div class="avatar" :style="{ backgroundColor: activity.color || '#6200ea' }">
                <span v-if="!activity.isIcon">{{ activity.initial }}</span>
                <span v-else>👤</span>
              </div>
              
              <div class="info">
                <div class="name" :style="{ color: activity.textColor || '#333' }">{{ activity.name }}</div>
              </div>

              <div class="meta">
                <span class="status-icon" :class="activity.type">
                   <span v-if="activity.type === 'incoming'">↙</span>
                   <span v-else-if="activity.type === 'missed'">↗</span>
                   <span v-else>↔</span>
                </span>
                <span class="time">{{ activity.time }}</span>
                <span class="more-options">⋮</span>
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import MobileSyncModal from '../components/MobileSyncModal.vue';

const store = useStore();
const showSyncModal = ref(false);

// Fetch activities on mount
onMounted(() => {
  store.dispatch('fetchActivities');
});

const activities = computed(() => store.getters.allActivities);

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
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
  background: white;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* Expanded Actions */
.actions-row {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6200ea;
  font-size: 0.8rem;
  gap: 5px;
  cursor: pointer;
}

.plus-icon, .user-icon, .move-icon {
    font-size: 1.2rem;
}

.expanded-call-icon {
  position: absolute;
  top: 15px;
  right: 50px; /* Adjust based on visualization */
  font-size: 1.2rem;
  color: #555;
}

/* Right Panel Avatars */
.leads-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 10px;
}

.avatar-circle {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.floating-dialpad {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #6200ea;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 10px rgba(98, 0, 234, 0.3);
    cursor: pointer;
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
    .leads-panel {
        display: none; /* Hide leads on small screens like the image mockup implies a split or mobile view */
    }
}
</style>
