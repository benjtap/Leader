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
        
        <template v-if="mode !== 'quote'">
            <div class="action-item" @click="selectAction('call')">
            <span class="icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.26-.26.35-.65.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3.3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .69-.63.69-1.19v-3.44c0-.54-.45-.99-.99-.99z"/></svg>
            </span>
            <span class="label">Call</span>
            </div>

            <div class="action-item" @click="selectAction('sms')">
            <span class="icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </span>
            <span class="label">Send SMS</span>
            </div>

            <div class="action-item" @click="selectAction('whatsapp')">
            <span class="icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </span>
            <span class="label">Send WhatsApp</span>
            </div>

            <div class="action-item dangerous" @click="selectAction('hide')">
            <span class="icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </span>
            <span class="label">Don't show in LEADer</span>
            </div>
        </template>

        <template v-if="mode === 'quote'">
            <div class="action-item" @click="selectAction('call')">
              <span class="icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.26-.26.35-.65.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3.3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .69-.63.69-1.19v-3.44c0-.54-.45-.99-.99-.99z"/></svg>
              </span>
              <span class="label">Call</span>
            </div>

            <div class="action-item" @click="selectAction('sms')">
              <span class="icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </span>
              <span class="label">Send SMS</span>
            </div>

            <div class="action-item" @click="selectAction('whatsapp')">
              <span class="icon">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </span>
              <span class="label">Send WhatsApp</span>
            </div>

            <div class="action-item" @click="selectAction('share_url')">
              <span class="icon">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </span>
              <span class="label">Share by url</span>
            </div>

            <div class="action-item" @click="selectAction('resend_quote')">
              <span class="icon">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </span>
              <span class="label">Resend Quote</span>
            </div>

            <div class="action-item" @click="selectAction('edit_quote')">
              <span class="icon">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </span>
              <span class="label">Edit Quote</span>
            </div>

            <div class="action-item" @click="selectAction('duplicate_quote')">
              <span class="icon">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </span>
              <span class="label">Duplicate Quote</span>
            </div>

            <div class="action-item dangerous" @click="selectAction('delete_quote')">
               <span class="icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
               </span>
               <span class="label">Delete Quote</span>
            </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
    mode: {
        type: String,
        default: 'default' // 'default' or 'quote'
    }
})

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

.action-item.dangerous .label,
.action-item.dangerous .icon {
    color: #ef5350; /* Red color */
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
