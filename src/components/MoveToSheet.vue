<template>
  <div class="sheet-overlay" @click="closeSheet">
  <div 
    class="sheet-content" 
    :class="{ closing: closing }"
    @click.stop
    ref="sheetContent"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="drag-handle"></div>
    
    <!-- Header with Item Info -->
    <div class="sheet-header">
      <div class="avatar" :style="{ backgroundColor: item?.color || '#6200ea' }">
        {{ item?.initial || item?.name?.charAt(0) || '?' }}
      </div>
      <div class="item-name">{{ item?.name || 'Unknown' }}</div>
    </div>

    <div class="scrollable-content">
      <!-- Status Section -->
      <div class="section">
        <div class="section-title" @click="isMoveToExpanded = !isMoveToExpanded">
          <div class="label-group">
              <span class="section-label">Status</span>
              <span class="section-value">{{ currentStatusName }}</span>
          </div>
          <span class="chevron" :class="{ rotated: !isMoveToExpanded }">▲</span>
        </div>
        
        <div v-show="isMoveToExpanded" class="options-list">
          <div 
            v-for="option in moveOptions" 
            :key="option.id" 
            class="option-item"
            :class="{ selected: selectedOption === option.id }"
            @click="selectOption(option.id)"
          >
            <div class="option-label">
                <span v-if="option.icon" class="option-icon">{{ option.icon }}</span>
                {{ option.label }}
            </div>
            <span v-if="selectedOption === option.id" class="checkmark">✓</span>
          </div>
        </div>
      </div>

      <!-- Assigned To Section -->
      <div class="section">
         <div class="section-title" @click="isAssignToExpanded = !isAssignToExpanded">
          <div class="label-group">
            <span class="section-label">Assigned to</span>
            <span class="section-value">{{ currentAssigneeName }}</span>
          </div>
          <span class="chevron" :class="{ rotated: isAssignToExpanded }">▼</span>
        </div>
        <div v-show="isAssignToExpanded" class="options-list">
             <div 
                v-for="member in members" 
                :key="member.id || member.Id"
                class="option-item member-item"
                @click="selectMember(member.id || member.Id)"
             >
                   <div class="member-info">
                      <div class="member-avatar" :style="{ backgroundColor: getColor(member.name || member.Name || member.email || member.Email) }">
                          {{ member.initial || member.Initial || (member.name ? member.name.charAt(0) : (member.Name ? member.Name.charAt(0) : (member.email ? member.email.charAt(0) : (member.Email ? member.Email.charAt(0) : '?')))) }}
                      </div>
                      <div class="member-name">{{ member.name || member.Name || member.email || member.Email || 'Unknown User' }}</div>
                   </div>
             </div>
        </div>
      </div>
    </div>

  </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  item: Object,
  statusOptions: Array
});

const emit = defineEmits(['close', 'move']);

const isMoveToExpanded = ref(true);
const isAssignToExpanded = ref(false);
const selectedOption = ref('last_activity'); 
const closing = ref(false);
const sheetContent = ref(null);
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isDragging = ref(false);
const pendingMoveTarget = ref(null);

const store = useStore();
const workflowSteps = computed(() => store.getters.allWorkflowSteps);
const members = computed(() => store.getters.tenantMembers || []);

const currentStatusName = computed(() => {
    if (!props.item) return '';
    // If it's a specific list type from item
    if (props.item.listType) {
        const step = workflowSteps.value.find(s => s.type === props.item.listType);
        if (step) return step.name;
    }
    // Fallback if we just have selectedOption initialized
    const step = workflowSteps.value.find(s => s.type === selectedOption.value);
    return step ? step.name : (props.item.status || 'New');
});

const currentAssigneeName = computed(() => {
    if (!props.item) return 'Unassigned';
    // If assignedTo is array
    let userId = null;
    if (Array.isArray(props.item.assignedTo) && props.item.assignedTo.length > 0) {
        userId = props.item.assignedTo[0];
    } else if (props.item.userId) {
        userId = props.item.userId;
    }

    if (!userId) return 'Unassigned';

    const member = members.value.find(m => (m.id || m.Id) === userId);
    return member ? (member.name || member.Name || member.email || member.Email) : 'Unknown User';
});

// Fetch members on mount or check if empty
import { onMounted } from 'vue';
onMounted(() => {
    store.dispatch('fetchTenantMembers');
    
    if (props.item) {
        if (props.item.listType) {
            selectedOption.value = props.item.listType;
        } else if (workflowSteps.value && workflowSteps.value.length > 0) {
            // Default to first workflow step (usually "New") for activities
            selectedOption.value = workflowSteps.value[0].type;
        } else {
            selectedOption.value = 'lead'; // Default fallback
        }
    }
});

const moveOptions = computed(() => {
    const options = [
        { id: 'last_activity', label: 'Last Activity' }
    ];

    const steps = props.statusOptions || workflowSteps.value;

    if (steps && steps.length > 0) {
        steps.forEach(step => {
            let label = step.name;
            // let label = step.name; // Keep original name
            
            options.push({
               id: step.id || step.type, // Handle both id (property cols) and type (workflow steps)
               label: label
            });
        });
    }

    options.push({ id: 'archive', label: 'Archive', icon: '🗃️' });
    
    return options;
});

const selectMember = (userId) => {
    if (closing.value) return;
    closing.value = true;
    setTimeout(() => {
        // ALWAYS emit move logic to ensure lead creation/assignment flow
        const target = pendingMoveTarget.value || selectedOption.value;
        emit('move', target, props.item, userId);
        emit('close');
    }, 280);
};

const getColor = (name) => {
    const colors = ['#6200ea', '#00bfa5', '#d50000', '#2962ff', '#ff6d00'];
    let hash = 0;
    if (!name) return colors[0];
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const closeSheet = () => {
    if (closing.value) return;
    closing.value = true;
    setTimeout(() => {
        emit('close');
    }, 280); 
};

const selectOption = (id) => {
  if (closing.value) return;
  selectedOption.value = id;
  // Store pending move target and expand "Assign to"
  pendingMoveTarget.value = id;
  isAssignToExpanded.value = true;
};

const handleTouchStart = (e) => {
  const scrollable = sheetContent.value.querySelector('.scrollable-content');
  if (scrollable && scrollable.scrollTop <= 0) {
      touchStartY.value = e.touches[0].clientY;
      isDragging.value = false;
  } else {
      touchStartY.value = -1;
  }
};

const handleTouchMove = (e) => {
  if (touchStartY.value < 0) return;

  const touchY = e.touches[0].clientY;
  const deltaY = touchY - touchStartY.value;
  
  if (deltaY > 0) {
      if (e.cancelable) {
         // Passive?
      }
      isDragging.value = true;
      touchCurrentY.value = deltaY;
      if(sheetContent.value) {
        sheetContent.value.style.transform = `translateY(${deltaY}px)`;
      }
  }
};

const handleTouchEnd = () => {
  if (touchStartY.value < 0) return;
  
  if (touchCurrentY.value > 100) { 
    // Slide out
    if(sheetContent.value) {
        sheetContent.value.style.transition = 'transform 0.2s ease-out';
        sheetContent.value.style.transform = 'translateY(100%)';
    }
    setTimeout(() => {
         emit('close');
    }, 200);
  } else {
    // Reset
    if(sheetContent.value) {
        sheetContent.value.style.transition = 'transform 0.3s ease-out';
        sheetContent.value.style.transform = '';
        setTimeout(() => {
           if(sheetContent.value) sheetContent.value.style.transition = '';
        }, 300);
    }
  }
  isDragging.value = false;
  touchCurrentY.value = 0;
};

</script>

<style scoped>
.sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 99999;
  display: flex;
  align-items: flex-end;
}

.sheet-content {
  background: white;
  width: 100%;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 10px 0 0 0; 
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.sheet-content.closing {
    animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.scrollable-content {
  overflow-y: auto;
  flex: 1;
  padding-bottom: 20px; 
}

.drag-handle {
  width: 40px;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin: 0 auto 15px auto;
  flex-shrink: 0; 
}

.sheet-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 15px 20px;
  border-bottom: 1px solid #f0f0f0; 
  flex-shrink: 0; 
  touch-action: none;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}



.item-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.member-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.member-name {
    color: #333;
    font-weight: 500;
}

.section {
  border-top: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  font-size: 1rem;
}

.chevron {
  font-size: 0.8rem;
  color: #888;
  transition: transform 0.2s;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.options-list {
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
}

.option-item {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: #666;
  font-size: 0.95rem;
}

.option-item.selected {
  background-color: #f3e5f5; 
  color: #7b1fa2; 
  font-weight: 500;
}

.checkmark {
  color: #7b1fa2;
  font-weight: bold;
}

.option-icon {
    margin-right: 8px;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}

.label-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.section-label {
    font-size: 0.8rem;
    color: #888;
    font-weight: normal;
}

.section-value {
    font-size: 1rem;
    color: #333;
    font-weight: 500;
}
</style>
