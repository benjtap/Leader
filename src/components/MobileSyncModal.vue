<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <div class="icon-wrapper">
        📱
      </div>
      <h3>Sync Mobile Contacts</h3>
      <p>
        To provide a better experience, we can import your mobile contacts directly into the app.
        <br><br>
        <small>We need your permission to access your contact list.</small>
      </p>
      
      <div class="actions">
        <button class="btn secondary" @click="close">Later</button>
        <button class="btn primary" @click="syncContacts">Sync Now</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import mobileSyncService from '../services/mobileSyncService';
import { useStore } from 'vuex';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['close', 'synced']);
const store = useStore();

const close = () => {
    emit('close');
};

const syncContacts = async () => {
    try {
        const result = await mobileSyncService.getContacts();
        
        if (result.error) {
            if (result.error === 'not_supported') {
                 alert('Contact access is not supported on this device via web.');
            } else {
                 alert('Could not access contacts: ' + result.msg);
            }
        } else {
            console.log("Contacts gathered:", result.data);
            // Here you would typically send to backend
            // await store.dispatch('uploadContacts', result.data);
            
            store.dispatch('showToast', { message: `Synced ${result.data.length} contacts!`, type: 'success' });
            emit('synced', result.data);
        }
    } catch (e) {
        console.error(e);
        alert('Sync failed');
    } finally {
        emit('close');
    }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.icon-wrapper {
  font-size: 3rem;
  margin-bottom: 15px;
}

h3 {
  margin: 0 0 10px 0;
  color: #333;
}

p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 25px;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 15px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
}

.btn.primary {
  background: #6200ea;
  color: white;
}

.btn.secondary {
  background: #f3f4f6;
  color: #333;
}
</style>
