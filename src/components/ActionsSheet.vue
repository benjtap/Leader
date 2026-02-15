<template>
  <div class="actions-sheet-overlay" @click="closeSheet">
    <div 
      class="actions-sheet" 
      :class="{ closing: closing }"
      @click.stop
      ref="sheetContent"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div class="drag-handle"></div>
      <div class="sheet-header">
        <h3>Actions</h3>
      </div>
      <div class="sheet-content">
        
        <div class="action-item" @click="selectAction('add_note')">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </span>
          <span class="label">Add note</span>
        </div>

        <div class="action-item" @click="selectAction('add_task')">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          </span>
          <span class="label">Add task</span>
        </div>

        <div class="action-item" @click="selectAction('add_labels')">
          <span class="icon">
             <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          </span>
          <span class="label">Add Labels</span>
        </div>

        <div class="action-item" @click="selectAction('add_file')">
          <span class="icon">
             <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
          </span>
          <span class="label">Add file</span>
        </div>

        <div class="action-item" @click="selectAction('send_card')">
           <span class="icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
           </span>
           <span class="label">Send business card</span>
        </div>

        <div class="action-item" @click="selectAction('add_quote')">
           <span class="icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
           </span>
           <span class="label">Add Quote</span>
        </div>
        
        <div class="action-item" @click="selectAction('create_meeting')">
           <span class="icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
           </span>
           <span class="label">Create Meeting</span>
        </div>

        <div class="action-item" @click="selectAction('edit_contact')">
           <span class="icon">
               <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
           </span>
           <span class="label">Edit contact</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const emit = defineEmits(['close', 'select'])

onMounted(() => {
  // ActionsSheet Component MOUNTED
});

const sheetContent = ref(null);
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isDragging = ref(false);
const closing = ref(false);

const closeSheet = () => {
    if (closing.value) return;
    closing.value = true;
    setTimeout(() => {
        emit('close');
    }, 280); 
};

const selectAction = (action) => {
    if (closing.value) return;
    closing.value = true;
    // Delay emit to allow animation to play
    setTimeout(() => {
        emit('select', action);
        emit('close');
    }, 280); 
};

const handleTouchStart = (e) => {
  const scrollable = sheetContent.value.querySelector('.sheet-content');
  if (scrollable && scrollable.scrollTop <= 0) {
      touchStartY.value = e.touches[0].clientY;
      isDragging.value = false;
  } else if (!scrollable) { 
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
         // Passive listener
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
.actions-sheet-overlay {
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

.actions-sheet {
  background: white;
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 10px 0 0 0;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.actions-sheet.closing {
    animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
  padding: 0 20px;
  margin-bottom: 20px;
  flex-shrink: 0;
  touch-action: none; 
}

.sheet-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.sheet-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  flex: 1;
  padding: 0 20px 20px 20px;
  overscroll-behavior-y: contain; 
}

.action-item {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  padding: 5px 0;
}

.icon {
  color: #6200ea;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
}

.label {
  font-size: 1rem;
  color: #333;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}
</style>
