<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Manage Workflow</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div class="steps-list">
          <div 
            v-for="(step, index) in steps" 
            :key="step.id" 
            class="step-item"
            :class="{ static: step.isStatic }"
          >
            <div class="step-info">
              <span class="step-name">{{ step.name }}</span>
              <span v-if="step.isStatic" class="static-badge">Default</span>
            </div>
            
            <div class="step-actions">
              <button 
                class="action-btn up-btn" 
                :disabled="index === 0"
                @click="moveStep(index, -1)"
              >
                ▲
              </button>
              <button 
                class="action-btn down-btn" 
                :disabled="index === steps.length - 1"
                @click="moveStep(index, 1)"
              >
                ▼
              </button>
              <button 
                class="action-btn delete-btn" 
                :disabled="step.isStatic"
                @click="confirmDelete(step)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div class="add-step-section">
          <h4>Add New Step</h4>
          <div class="input-group">
            <input 
              v-model="newStepName" 
              placeholder="Enter step name..." 
              @keyup.enter="addStep"
            />
            <button class="add-btn" @click="addStep" :disabled="!newStepName">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <DeleteWorkflowStepSheet 
        v-if="showDeleteSheet" 
        :step="stepToDelete"
        @close="showDeleteSheet = false"
        @confirm="handleMoveAndDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import DeleteWorkflowStepSheet from './DeleteWorkflowStepSheet.vue';

const props = defineProps(['steps']); 
const emit = defineEmits(['close']);
const store = useStore();

const steps = computed(() => store.getters.allWorkflowSteps);
const newStepName = ref('');
const showDeleteSheet = ref(false);
const stepToDelete = ref(null);

const moveStep = async (index, direction) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= steps.value.length) return;

  const newSteps = [...steps.value];
  const temp = newSteps[index];
  newSteps[index] = newSteps[newIndex];
  newSteps[newIndex] = temp;

  const orderedIds = newSteps.map(s => s.id);
  await store.dispatch('reorderWorkflowSteps', orderedIds);
};

const confirmDelete = async (step) => {
    // 1. Popup Alert (Image 1)
    if (!confirm("Are you sure you want to remove this status from your organization workflow?")) {
        return;
    }

    // 2. Check if items exist
    const items = store.getters.getListItems(step.type);
    if (items && items.length > 0) {
        stepToDelete.value = step;
        showDeleteSheet.value = true;
    } else {
        // No items, just delete
        await store.dispatch('deleteWorkflowStep', step.id);
    }
};

const handleMoveAndDelete = async ({ targetType, targetUserId }) => {
    if (!stepToDelete.value) return;
    
    await store.dispatch('deleteWorkflowStepAndMove', {
        id: stepToDelete.value.id,
        targetType,
        targetUserId
    });
    
    showDeleteSheet.value = false;
    stepToDelete.value = null;
};

const addStep = async () => {
    if (!newStepName.value.trim()) return;
    await store.dispatch('createWorkflowStep', newStepName.value);
    newStepName.value = '';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 1.2rem; }

.close-btn {
  background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;
}

.modal-body {
  padding: 15px;
  overflow-y: auto;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.step-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

.step-item.static {
  background: #f0f0f0;
  border-color: #e0e0e0;
}

.step-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-name { font-weight: 500; }

.static-badge {
  font-size: 0.7rem;
  background: #ccc;
  color: #333;
  padding: 2px 6px;
  border-radius: 4px;
}

.step-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.delete-btn {
  color: #d32f2f;
  border-color: #ffdce0;
  background: #fff5f5;
}

.add-step-section {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.add-step-section h4 { margin: 0 0 10px 0; font-size: 1rem; }

.input-group {
  display: flex;
  gap: 10px;
}

.input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.add-btn {
  background: #6200ea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
