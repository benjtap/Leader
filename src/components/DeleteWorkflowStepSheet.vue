<template>
  <div class="sheet-overlay" @click.self="$emit('close')">
    <div class="sheet-content">
      <div class="drag-handle"></div>

      <!-- Header -->
      <div class="sheet-header">
        <div class="header-icon">
             <div class="circle-icon">
                <span class="initial">{{ step.name.charAt(0) }}</span>
             </div>
        </div>
        <div class="header-text">
            <h3>Move all contacts from {{ step.name }} to:</h3>
        </div>
      </div>

      <div class="sheet-body">
          
          <!-- Move To Section -->
          <div class="section">
              <div class="section-title" @click="toggleSection('move')">
                  <span>Move to...</span>
                  <span class="chevron" :class="{ rotated: expandedSection === 'move' }">▼</span>
              </div>
              <div v-show="expandedSection === 'move'" class="options-list">
                  <div 
                    v-for="opt in moveOptions" 
                    :key="opt.id"
                    class="option-item"
                    :class="{ selected: selectedTarget === opt.id }"
                    @click="selectTarget(opt.id)"
                  >
                      <span class="opt-label">{{ opt.label }}</span>
                      <span v-if="selectedTarget === opt.id" class="checkmark">✓</span>
                  </div>
              </div>
          </div>

          <!-- Assign To Section -->
          <div class="section">
              <div class="section-title" @click="toggleSection('assign')">
                  <span>Assign to</span>
                  <span class="chevron" :class="{ rotated: expandedSection === 'assign' }">▼</span>
              </div>
              <div v-show="expandedSection === 'assign'" class="options-list">
                   <div 
                    v-for="member in members" 
                    :key="member.id || member.Id"
                    class="option-item member-item"
                    @click="selectMember(member.id || member.Id)"
                  >
                      <div class="member-avatar" :style="{ backgroundColor: getColor(member.name || member.Name) }">
                          {{ member.initial || member.Initial || (member.name ? member.name.charAt(0) : (member.Name ? member.Name.charAt(0) : '?')) }}
                      </div>
                      <span class="opt-label">{{ member.name || member.Name || member.email || member.Email || 'Unknown' }}</span>
                  </div>
              </div>
          </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const props = defineProps(['step']);
const emit = defineEmits(['close', 'confirm']);
const store = useStore();

const expandedSection = ref('move');
const selectedTarget = ref(null);

const workflowSteps = computed(() => store.getters.allWorkflowSteps);
const members = computed(() => store.getters.tenantMembers || []); // Ensure getter

const moveOptions = computed(() => {
    return workflowSteps.value
        .filter(s => s.id !== props.step.id) // Exclude self
        .map(s => ({ id: s.type, label: s.name }));
    // Add Archive if needed?
    // .concat([{ id: 'archive', label: 'Archive' }]) 
});

onMounted(() => {
    store.dispatch('fetchTenantMembers');
    // Default select first available option
    if (moveOptions.value.length > 0) {
        selectedTarget.value = moveOptions.value[0].id;
    }
});

const toggleSection = (sec) => {
    if (expandedSection.value === sec) expandedSection.value = null;
    else expandedSection.value = sec;
};

const selectTarget = (id) => {
    selectedTarget.value = id;
    // Auto expand next section?
    expandedSection.value = 'assign';
};

const selectMember = async (userId) => {
    if (!selectedTarget.value) {
        alert("Please select a target status first.");
        return;
    }
    
    // Trigger action
    emit('confirm', { 
        targetType: selectedTarget.value, 
        targetUserId: userId 
    });
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

</script>

<style scoped>
.sheet-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.sheet-content {
  background: white;
  width: 100%;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drag-handle {
    width: 40px; height: 4px; background: #e0e0e0;
    border-radius: 2px; margin: 10px auto;
}

.sheet-header {
    display: flex; align-items: center; gap: 15px;
    padding: 10px 20px 20px;
    border-bottom: 1px solid #f0f0f0;
}

.circle-icon {
    width: 40px; height: 40px; background: #6200ea;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    color: white; font-weight: bold;
}

.sheet-header h3 {
    margin: 0; font-size: 1.1rem; color: #333; font-weight: 600;
}

.sheet-body {
    overflow-y: auto;
}

.section {
    border-bottom: 1px solid #f0f0f0;
}

.section-title {
    padding: 15px 20px;
    display: flex; justify-content: space-between; align-items: center;
    font-weight: 500; cursor: pointer; color: #333;
}

.chevron {
    transition: transform 0.2s; color: #888;
}
.chevron.rotated { transform: rotate(180deg); }

.options-list {
    background: #fafafa;
    padding-bottom: 10px;
}

.option-item {
    padding: 12px 20px;
    display: flex; justify-content: space-between; align-items: center;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}
.option-item.selected {
    background: #f3e5f5; color: #7b1fa2; font-weight: 500;
}

.member-item {
    justify-content: flex-start; gap: 15px;
}

.member-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    color: white; display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; font-weight: bold;
}

.checkmark { color: #7b1fa2; font-weight: bold; }

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
