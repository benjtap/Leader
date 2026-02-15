<template>
  <div class="dashboard-page">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="menu-icon" @click="showSidebar = true">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="#5f6368" stroke-width="2" fill="none">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
      
      <div class="search-bar">
        <span class="search-icon">
           <svg viewBox="0 0 24 24" width="20" height="20" stroke="#5f6368" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input type="text" placeholder="Search" />
      </div>

      <div class="top-actions">
        <div class="notification-badge">
          <div class="icon-btn">
             <svg viewBox="0 0 24 24" width="24" height="24" stroke="#5f6368" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
        </div>
        <div class="icon-btn" title="View Options" @click="toggleViewMode">
           <svg viewBox="0 0 24 24" width="24" height="24" stroke="#5f6368" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </div>
      </div>
    </div>

    <!-- Invite Teammates OR Assignee Filter Section -->
    <div class="invite-section">
        <button v-if="!hasTeammates" class="invite-btn">
            <span class="plus-icon">+</span> Invite teammates
        </button>
        <button v-else class="assignee-filter-btn" @click="showAssigneeSheet = true">
            Assignee <span class="chevron-down">⌄</span>
        </button>
    </div>

    <!-- Swipeable Container -->
    <div class="swiper-container" ref="swiperRef" :class="{ 'compact-view': isCompactView }">
      
      <!-- Slide 1: Last Activity (Always First, Custom) -->
      <div class="slide">
        <ActivityComponent />
      </div>

       <!-- Dynamic Slides based on Workflow -->
      <div 
        v-for="step in workflowSteps" 
        :key="step.id" 
        class="slide"
      >
        <ListComponent 
            :title="step.name" 
            :items="filteredListItems(step.type)" 
        />
      </div>

      <!-- Final Slide: Add New Step -->
      <div class="slide add-slide">
         <div class="add-card" @click="showManageModal = true">
             <div class="add-icon">+</div>
             <span>Add / Manage Workflow</span>
         </div>
      </div>

    </div>

    <!-- Keypad FAB -->
    <button class="keypad-fab">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V9h2v4zm0-6h-2V5h2v2zm4 10h-2v-2h2v2zm0-4h-2V9h2v4zm0-6h-2V5h2v2zm4 10h-2v-2h2v2zm0-4h-2V9h2v4zm0-6h-2V5h2v2zm4 10h-2v-2h2v2zm0-4h-2V9h2v4zm0-6h-2V5h2v2z" opacity="0"></path> 
            <circle cx="7" cy="7" r="1.5"></circle>
            <circle cx="12" cy="7" r="1.5"></circle>
            <circle cx="17" cy="7" r="1.5"></circle>
            <circle cx="7" cy="12" r="1.5"></circle>
            <circle cx="12" cy="12" r="1.5"></circle>
            <circle cx="17" cy="12" r="1.5"></circle>
            <circle cx="7" cy="17" r="1.5"></circle>
            <circle cx="12" cy="17" r="1.5"></circle>
            <circle cx="17" cy="17" r="1.5"></circle>
        </svg>
    </button>

    <!-- Bottom Nav -->
    <div class="bottom-nav">
       <div class="nav-item">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="#5f6368" stroke-width="2" fill="none"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
       </div>
       <div class="nav-item">
          <svg viewBox="0 0 24 24" width="26" height="26" stroke="#5f6368" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
       </div>
       <div class="nav-item">
          <div class="plus-nav-btn">
             <svg viewBox="0 0 24 24" width="28" height="28" stroke="white" stroke-width="3" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
       </div>
       <div class="nav-item">
           <svg viewBox="0 0 24 24" width="24" height="24" stroke="#5f6368" stroke-width="2" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
       </div>
       <div class="nav-item">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="#5f6368" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
       </div>
    </div>

    <!-- Modals -->
    <MobileSyncModal 
        :visible="showSyncModal" 
        @close="onModalClose"
        @synced="onSynced"
    />
    
    <SidebarMenu :visible="showSidebar" @close="showSidebar = false" />
    
    <WorkflowManageModal 
        v-if="showManageModal" 
        @close="showManageModal = false" 
    />

    <!-- Assignee Filter Sheet -->
    <Teleport to="body">
        <div v-if="showAssigneeSheet" class="sheet-overlay" @click="showAssigneeSheet = false">
            <div 
                class="sheet-content" 
                @click.stop
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
            >
                <div class="drag-handle"></div>
                
                <h3 class="sheet-title">Assignee</h3>

                <div class="members-list">
                    <div 
                        v-for="member in tenantMembers" 
                        :key="member.id" 
                        class="member-item"
                        @click="toggleAssignee(member.id)"
                    >
                        <div class="member-left">
                            <div 
                                class="member-avatar"
                                :style="{ backgroundColor: getAvatarColor(member.name || member.email) }"
                            >
                                {{ getInitial(member.name || member.email) }}
                            </div>
                            <span class="member-name">{{ member.name || member.email }}</span>
                        </div>
                        
                        <div class="checkbox">
                             <div v-if="selectedAssignees.includes(member.id)" class="check-box checked">
                                 <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                             </div>
                             <div  v-else class="check-box unchecked"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </Teleport>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import SidebarMenu from '../components/SidebarMenu.vue';
import ActivityComponent from './ActivityView.vue';
import ListComponent from '../components/ListComponent.vue';
import MobileSyncModal from '../components/MobileSyncModal.vue';
import WorkflowManageModal from '../components/WorkflowManageModal.vue';

const store = useStore();
const swiperRef = ref(null);
const isCompactView = ref(false); 
const showSidebar = ref(false);
const showSyncModal = ref(false);
const showManageModal = ref(false);

const toggleViewMode = () => {
    isCompactView.value = !isCompactView.value;
};

// Access store getters
const workflowSteps = computed(() => store.getters.allWorkflowSteps);

const tenantMembers = computed(() => store.getters.tenantMembers);
const hasTeammates = computed(() => {
    // Show Assignee filter if there are members. 
    // Usually fetching returns at least the current user owner.
    return tenantMembers.value && tenantMembers.value.length > 0;
});

const showAssigneeSheet = ref(false);
const selectedAssignees = ref([]);

const filteredListItems = (type) => {
    const items = store.getters.getListItems(type);
    if (!items) return [];
    
    if (selectedAssignees.value.length === 0) return items;
    
    return items.filter(item => {
        // Filter by assignedTo
        return selectedAssignees.value.some(id => String(id) === String(item.assignedTo));
    });
};

const toggleAssignee = (id) => {
    const idx = selectedAssignees.value.indexOf(id);
    if (idx !== -1) {
        selectedAssignees.value.splice(idx, 1);
    } else {
        selectedAssignees.value.push(id);
    }
};

const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
};

const getAvatarColor = (name) => {
    if (!name) return '#ccc';
    const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

onMounted(() => {
    store.dispatch('fetchActivities');
    // fetchWorkflowAndLists handles fetching steps AND their content
    store.dispatch('fetchWorkflowAndLists');
    store.dispatch('fetchTenantMembers');
    
    // Auto-focus logic for mouse drag
    const slider = swiperRef.value;
    let isDown = false;
    let startX;
    let scrollLeft;

    // Restore Scroll Position
    if (store.state.activeSlideIndex > 0 && swiperRef.value) {
        setTimeout(() => {
             if (!swiperRef.value) return;
             const slideWidth = swiperRef.value.children[0]?.offsetWidth;
             if (slideWidth) {
                 swiperRef.value.scrollLeft = slideWidth * store.state.activeSlideIndex;
             }
        }, 100);
    }

    // Scroll Listener for Persistence
    if (slider) {
        let scrollTimeout;
        slider.addEventListener('scroll', () => {
             clearTimeout(scrollTimeout);
             scrollTimeout = setTimeout(() => {
                 if (!slider.children[0]) return;
                 const slideWidth = slider.children[0].offsetWidth;
                 const index = Math.round(slider.scrollLeft / slideWidth);
                 store.commit('SET_ACTIVE_SLIDE', index);
             }, 100);
        });

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
          const walk = (x - startX) * 2; 
          slider.scrollLeft = scrollLeft - walk;
        });
    }
});

const onModalClose = () => {
    showSyncModal.value = false;
    localStorage.setItem('hasAskedContactSync', 'true');
};

const onSynced = (contacts) => {
    console.log("Synced Contacts:", contacts);
};

// Drag Down Logic
const touchStartY = ref(0);
const touchCurrentY = ref(0);

const handleTouchStart = (e) => {
    touchStartY.value = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
    touchCurrentY.value = e.touches[0].clientY;
    const diff = touchCurrentY.value - touchStartY.value;
    if (diff > 0) {
        // Apply transform to visualize drag
        e.currentTarget.style.transform = `translateY(${diff}px)`;
    }
};

const handleTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - touchStartY.value;
    
    if (diff > 100) { // Threshold to close
        showAssigneeSheet.value = false;
    } 
    
    // Reset transform
    e.currentTarget.style.transform = '';
    touchStartY.value = 0;
    touchCurrentY.value = 0;
};

</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  background-color: #f5f6fa;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
}

/* Top Bar */
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
.icon-btn { 
    font-size: 1.5rem; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
}

/* Invite Section */
.invite-section {
    padding: 10px 15px;
    background-color: #f5f6fa; 
}

.invite-btn {
    border: 1px solid #ddd;
    background: white;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 0.9rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.plus-icon {
    font-size: 1.2rem;
    font-weight: 300;
}

.assignee-filter-btn {
    border: 1px solid #ddd;
    background: white;
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 0.9rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.chevron-down {
    font-size: 1.1rem;
    font-weight: bold;
    margin-top: -3px; 
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
  padding-bottom: 80px; 
}

.swiper-container.active {
  cursor: grabbing;
  scroll-behavior: auto;
  scroll-snap-type: none;
}

.slide {
  flex: 0 0 100vw;
  width: 100vw;
  scroll-snap-align: start;
  height: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, margin 0.3s ease;
}

.add-slide {
    align-items: center;
    justify-content: center;
    background: #f5f6fa;
}

.add-card {
    background: white;
    border-radius: 20px;
    width: 200px;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: transform 0.2s;
}

.add-card:active {
    transform: scale(0.95);
}

.add-icon {
    font-size: 3rem;
    color: #6200ea;
    font-weight: 300;
    margin-bottom: 15px;
}

.add-card span {
    font-size: 1.1rem;
    color: #666;
    font-weight: 500;
}


/* Compact View */
.swiper-container.compact-view .slide {
    flex: 0 0 75vw;
    width: 75vw;
    margin-right: 10px;
}
.swiper-container.compact-view .slide:first-child {
    margin-left: 10px;
}

/* Keypad FAB */
.keypad-fab {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #6200ea;
    color: white;
    border: none;
    box-shadow: 0 4px 10px rgba(98, 0, 234, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 20; 
    transition: transform 0.2s;
}

.keypad-fab:active {
    transform: scale(0.95);
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
  position: absolute; 
  bottom: 0;
  left: 0;
  width: 100%;
}

.nav-item { font-size: 1.5rem; color: #666; cursor: pointer; display: flex; justify-content: center; align-items: center; }
.plus-nav-btn {
  background: #6200ea;
  color: white; width: 50px; height: 50px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-top: -25px; 
  box-shadow: 0 4px 10px rgba(98, 0, 234, 0.3);
}

:deep(.activity-page) {
    height: 100%;
    background: transparent;
}
:deep(.activity-page .top-bar),
:deep(.activity-page .bottom-nav) {
    display: none !important;
}

/* Sheet Styles */
.sheet-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.sheet-content {
    background: white;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    padding-bottom: 30px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    animation: slideUp 0.3s ease-out;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.drag-handle {
    width: 40px;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    align-self: center;
    margin-top: 10px;
    margin-bottom: 20px;
}

.sheet-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    padding: 0 20px;
    margin-bottom: 15px;
}

.members-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.member-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    cursor: pointer;
    border-bottom: 1px solid #f9f9f9;
}

.member-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.member-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.95rem;
}

.member-name {
    font-size: 1rem;
    color: #333;
}

.checkbox {
    display: flex;
    align-items: center;
}

.check-box {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 2px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.check-box.checked {
    background: #6200ea;
    border-color: #6200ea;
}

.check-box.unchecked {
    border-color: #999;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
</style>
