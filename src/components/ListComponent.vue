<template>
  <div class="list-view-content">
    <div class="panel list-panel">
      <div v-if="createLabel" class="create-action" @click="$emit('create')">
        <span class="plus-icon">+</span>
        <span class="create-text">{{ createLabel }}</span>
      </div>

      <div class="panel-header">
        <div>
          <h2 v-if="!createLabel">{{ title }} <span v-if="items.length">({{ items.length }})</span></h2>
          <h2 v-else class="list-title-small">{{ title }} <span v-if="items.length">({{ items.length }})</span></h2>
        </div>
        <div class="header-actions">
           <span class="dots-icon">⋮</span>
        </div>
      </div>

      <div class="list-items">
        <div v-if="!createLabel && items.length === 0" class="empty-state">
           No items found.
        </div>
        <div 
          v-for="item in items" 
          :key="item.id" 
          :id="'list-item-' + item.id"
          class="list-item"
          :class="{ expanded: expandedItemId === item.id }"
          @click="toggleExpand(item.id)"
        >
          <!-- Main Row Content -->
          <div class="item-row">
            <div class="avatar" :style="{ backgroundColor: item.color || '#e0e0e0', color: item.textColor || '#fff' }">
              <span v-if="!item.isIcon">{{ item.initial }}</span>
              <span v-else>👤</span>
            </div>
            
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <!-- Optional: Add subheading if available -->
            </div>

            <div class="meta-actions">
              <button class="icon-btn phone-btn" @click.stop="handleAction('call', item)">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.26-.26.35-.65.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3.3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .69-.63.69-1.19v-3.44c0-.54-.45-.99-.99-.99z"/></svg>
              </button>
              <button class="icon-btn more-btn" @click.stop="handleAction('actions', item)">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
            </div>
          </div>
          
          <!-- Assigned To Footer -->
          <div v-if="getAssignedTo(item)" class="assigned-footer">
            Assigned to <strong>{{ getAssignedTo(item) }}</strong>
          </div>

          <!-- Expanded Menu -->
          <div v-if="expandedItemId === item.id" class="expanded-menu" @click.stop>
            <div class="menu-action" @click.stop="handleAction('actions', item)">
                <div class="action-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <span>Actions</span>
            </div>
            <div class="menu-action" @click.stop="handleAction('info', item)">
                <div class="action-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <span>Info</span>
            </div>
            <div class="menu-action" @click.stop="handleAction('move', item)">
                <div class="action-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path><path d="M12 6L15 3M12 6L9 3" transform="translate(8, 0)" stroke-width="2" v-if="false" /> <!-- Simplified list icon--> <rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2" stroke-opacity="0.5" fill="none" class="move-icon-base"/> <path d="M16 8l3 3l-3 3" /></svg>
                    <!-- Using a better 'Move/List' icon -->
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute; opacity:0;">
                       <path d="M3 6h18M3 12h18M3 18h18"/>
                    </svg>
                     <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 6h16M4 10h16M4 14h8" />
                        <path d="M16 16l3 3l3-3" />
                         <path d="M19 14v5" />
                    </svg>
                </div>
                <!-- UPDATED LABEL FOR VERIFICATION -->
                <span>Move to...</span>
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex'; // Import useStore
import ActionsSheet from './ActionsSheet.vue';
import MoveToSheet from './MoveToSheet.vue';

defineProps({
  title: String,
  items: {
    type: Array,
    default: () => []
  },
  createLabel: String
})

defineEmits(['create']);

const store = useStore(); // Initialize store
const router = useRouter();
const expandedItemId = ref(null);
const showActionsSheet = ref(false);
const showMoveToSheet = ref(false);
const selectedItemForAction = ref(null);

onMounted(() => {
    const focusedId = store.state.focusedItemId;
    if (focusedId) {
        // We can't easily check props.items here because props might not be populated instantly if async fetched?
        // But DashboardView mounts ListComponent with items from getter. So items should be ready or watcher needed.
        // Let's rely on watcher or timeout.
        
        setTimeout(() => {
             const el = document.getElementById('list-item-' + focusedId);
             if (el) {
                 expandedItemId.value = focusedId;
                 el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 // Clear focus after action to prevent re-focusing? 
                 // store.commit('SET_FOCUSED_ITEM', null); // Maybe clear after delay or on destroy
             }
        }, 300);
    }
});

const toggleExpand = (id) => {
  if (expandedItemId.value === id) {
    expandedItemId.value = null;
  } else {
    expandedItemId.value = id;
  }
};

const handleAction = (type, item) => {
    // Only show alert for debugging if needed, or remove. Keeping it simple.
    // console.log(`Action: ${type}`);
    
    if (type === 'actions') {
        selectedItemForAction.value = item;
        showActionsSheet.value = true;
    } else if (type === 'move') {
        // DEBUG: Alert to confirm click is registered
        // alert(`DEBUG: Move Clicked for ${item.name}`);
        selectedItemForAction.value = item;
        showMoveToSheet.value = true;
    } else if (type === 'call') {
        window.location.href = `tel:${item.phone || item.name}`; // Basic implementation attempt
    } else if (type === 'info') {
        store.commit('SET_FOCUSED_ITEM', item.id); // Save ID for return
        
        if (item.type === 'task') {
             router.push({ name: 'task-detail', params: { taskId: item.id } });
             return;
        }

        const identifier = item.phone || item.number;
        if (identifier) {
             router.push({ 
                name: 'lead-details', 
                params: { number: identifier } 
             });
        }
    } else {
        console.log(`Action: ${type}`);
    }
};

const onActionSelect = (action) => {
    console.log("Selected action:", action, "for item:", selectedItemForAction.value);
    
    if (action === 'add_quote') {
        const item = selectedItemForAction.value;
        const leadId = item.id || item.phone;
        router.push({ name: 'create-quote', params: { leadId: leadId } });
    }
    
    showActionsSheet.value = false;
};

const members = computed(() => store.getters.tenantMembers || []);

const getAssignedTo = (item) => {
    if (!item.assignedTo || item.assignedTo.length === 0) return null;
    const userId = item.assignedTo[0];
    const member = members.value.find(m => (m.id || m.Id) === userId);
    return member ? (member.name || member.Name || member.username || member.Username) : null;
};

const onMoveItem = async (targetListId, item, targetUserId) => {
    // Intercept "Move to Quote" -> Open Create Quote Page
    const normalizedTarget = String(targetListId).toLowerCase();
    if (normalizedTarget.includes('quote') || normalizedTarget.includes('הצעת מחיר')) {
        const leadId = item.id || item.phone;
        router.push({ name: 'create-quote', params: { leadId: leadId } });
        showMoveToSheet.value = false;
        return;
    }

    console.log(`Moving item ${item.name} to ${targetListId} (assigned to: ${targetUserId})`);
    try {
        await store.dispatch('moveItem', { item: item, target: targetListId, targetUserId });
        showMoveToSheet.value = false;
    } catch (e) {
        console.error("Move failed:", e);
    }
};
</script>

<style scoped>
.list-view-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}

.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 15px;
  flex: 1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.header-actions {
  font-size: 1.25rem;
  color: #666;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Main List Item Card */
.list-item {
  border: 1px solid #eee;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  transition: all 0.2s ease;
  margin-bottom: 6px; /* Reduced from 8px */
}

.assigned-footer {
    background-color: #f5f5f5;
    padding: 4px 10px;
    font-size: 0.75rem;
    color: #666;
    border-top: 1px solid #eee;
}

.list-item.expanded {
    border-color: #f0f0f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.item-row {
  display: flex;
  align-items: center;
  padding: 8px; /* Reduced from 10px */
  gap: 10px; /* Reduced from 12px */
  cursor: pointer;
}

.avatar {
  width: 40px; /* Reduced from 45px */
  height: 40px; /* Reduced from 45px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem; /* Reduced from 1.1rem */
  flex-shrink: 0;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  font-weight: 500;
  font-size: 0.95rem; /* Reduced from 1rem */
  color: #333;
}

/* Meta Actions (Phone, Dots) */
.meta-actions {
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

.icon-btn:hover {
    background-color: rgba(0,0,0,0.05);
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
    color: #a855f7; /* Purple to match image */
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-state {
    text-align: center;
    color: #999;
    margin-top: 50px;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.create-action {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 5px;
  padding: 5px 0;
}

.plus-icon {
  font-size: 1.5rem;
  color: #6200ea; /* Purple */
  font-weight: bold;
  line-height: 1;
}

.create-text {
  color: #6200ea; /* Purple */
  font-weight: 600;
  font-size: 1.1rem;
}

.list-title-small {
  font-size: 0.9rem;
  color: #888;
  font-weight: normal;
  margin: 0;
}
</style>
