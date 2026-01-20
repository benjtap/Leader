<template>
  <div class="dashboard-page">
    <!-- Top Bar (Shared) -->
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
        <!-- New Sync Button -->
        <div class="icon-btn" @click="showSyncModal = true" title="Sync Mobile Contacts">
            <span>📲</span>
        </div>

        <div class="notification-badge">
          <span>🔔</span>
          <span class="badge">1</span>
        </div>
        <div class="profile-icon">
          <span>〓</span>
        </div>
      </div>
    </div>

    <!-- Swipeable Container -->
    <div class="swiper-container" ref="swiperRef">
      
      <!-- Slide 1: Last Activity (Custom View) -->
      <div class="slide">
        <ActivityComponent />
      </div>

       <!-- Slide 2: Leads -->
      <div class="slide">
        <ListComponent title="Leads" :items="leadItems" />
      </div>

      <!-- Slide 3: Follow Up -->
      <div class="slide">
        <ListComponent title="Follow up" :items="followUpItems" />
      </div>

      <!-- Slide 4: Quotes -->
      <div class="slide">
        <ListComponent title="Quotes" :items="quoteItems" />
      </div>

      <!-- Slide 5: Not Relevant -->
      <div class="slide">
        <ListComponent title="Not relevant" :items="notRelevantItems" />
      </div>

    </div>

    <!-- Bottom Nav (Shared) -->
    <div class="bottom-nav">
       <span class="nav-item">▽</span>
       <span class="nav-item">👤</span>
       <span class="nav-item main-action">+</span>
       <span class="nav-item">🏷️</span>
       <span class="nav-item">✓</span>
    </div>

    <!-- Mobile Sync Modal -->
    <MobileSyncModal 
        :visible="showSyncModal" 
        @close="onModalClose"
        @synced="onSynced"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import ActivityComponent from './ActivityView.vue'; // Reusing the ActivityView layout logic but needs adjustment
import ListComponent from '../components/ListComponent.vue';
import MobileSyncModal from '../components/MobileSyncModal.vue';

// Note: ActivityView.vue was designed as a full page. 
// Ideally we should refactor it to be a component, but for now we might need to adjust styles via CSS deeply or assume it fits.
// Actually, ActivityView includes the top bar and bottom nav which duplicates them.
// I will need to refactor ActivityView slightly OR extract its content. 
// For this step, I'll rely on a specialized version or assume ActivityComponent adapts.
// Wait, ActivityView HAS top bar and bottom nav. 
// Use a new dedicated component for the specific Activity Content or just use ListComponent for consistency?
// The image "Last Activity" has a specific design (cards).
// Let's assume for now I will use the store data.

const store = useStore();
const swiperRef = ref(null);
const showSyncModal = ref(false);

onMounted(() => {
    store.dispatch('fetchActivities');
    store.dispatch('fetchLeads');
    store.dispatch('fetchLists');
    
    // Auto-focus logic for mouse drag support
    const slider = swiperRef.value;
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    });

    // Check sync status
    const hasAskedSync = localStorage.getItem('hasAskedContactSync');
    if (!hasAskedSync) {
        setTimeout(() => {
            showSyncModal.value = true;
        }, 1000);
    }
});

const onModalClose = () => {
    showSyncModal.value = false;
    localStorage.setItem('hasAskedContactSync', 'true');
};

const onSynced = (contacts) => {
    console.log("Synced Contacts:", contacts);
    // Future: Dispatch store action to save
};

const leadItems = computed(() => store.getters.allLeads);
const quoteItems = computed(() => store.getters.allQuotes);
const followUpItems = computed(() => store.getters.allFollowUp);
const notRelevantItems = computed(() => store.getters.allNotRelevant);

</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f6fa;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
}

/* Shared Top Bar (Duplicated from ActivityView) */
.top-bar {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-bottom: 2px;
  border-bottom: 3px solid #6200ea;
  z-index: 10;
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
.notification-badge { position: relative; }
.badge {
  position: absolute;
  top: -5px; right: -5px;
  background: red; color: white;
  border-radius: 50%; padding: 2px 5px; font-size: 10px;
}
.icon-btn { 
    font-size: 1.5rem; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
}

/* Swiper Logic */
.swiper-container {
  flex: 1;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  height: 100%;
  cursor: grab;
}

.swiper-container.active {
  cursor: grabbing;
  scroll-behavior: auto; /* Dissable smooth scroll while dragging for responsiveness */
  scroll-snap-type: none; /* Disable snap while dragging */
}

.slide {
  flex: 0 0 100vw; /* Force full viewport width */
  width: 100vw;
  scroll-snap-align: start;
  height: 100%;
  overflow-y: hidden; /* Content inside should scroll */
  display: flex;
  flex-direction: column;
}

/* Bottom Nav */
.bottom-nav {
  background: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  z-index: 10;
}
.nav-item { font-size: 1.5rem; color: #666; cursor: pointer; }
.main-action {
  background: #6200ea;
  color: white; width: 50px; height: 50px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-top: -25px;
  box-shadow: 0 4px 10px rgba(98, 0, 234, 0.3);
}

/* Hide ActivityView's internal top/bottom bars if reused directly */
:deep(.activity-page) {
    height: 100%;
    background: transparent;
}
:deep(.activity-page .top-bar),
:deep(.activity-page .bottom-nav) {
    display: none !important;
}
</style>
