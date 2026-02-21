<template>
  <div class="contacts-page">
    <div class="top-bar">
      <div class="menu-icon" @click="showSidebar = true">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="#5f6368" stroke-width="2" fill="none">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
      <div class="page-title">Contacts Directory</div>
      <div class="top-actions">
           <div class="icon-btn" @click="showAddContact = true">
               <span style="font-size: 1.5rem;">+</span>
           </div>
      </div>
    </div>

    <div class="contacts-list">
        <div v-for="contact in contacts" :key="contact.id" class="contact-card">
            <div class="avatar" :style="{ backgroundColor: getContactColor(contact) }">
                <span class="custom-icon" v-html="getUserIcon()"></span>
            </div>
            <div class="info">
                <div class="name">{{ contact.name }}</div>
                <div class="details">{{ contact.phone }}</div>
                <div class="role-badge">{{ contact.role }}</div>
            </div>
             <div class="actions">
                <button class="icon-btn" @click="call(contact.phone)">📞</button>
            </div>
        </div>
    </div>

    <SidebarMenu :visible="showSidebar" @close="showSidebar = false" />
    
    <!-- Add Contact Modal -->
    <div v-if="showAddContact" class="modal-overlay">
        <div class="modal-content">
            <h3>Add Contact</h3>
            <input v-model="newContact.name" placeholder="Name" class="input-field" />
            <input v-model="newContact.phone" placeholder="Phone" class="input-field" />
            <select v-model="newContact.role" class="input-field">
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Partner">Partner</option>
            </select>
            <div class="modal-actions">
                <button @click="createContact">Save</button>
                <button @click="showAddContact = false">Cancel</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import SidebarMenu from '../components/SidebarMenu.vue';

const store = useStore();
const showSidebar = ref(false);
const showAddContact = ref(false);

const newContact = ref({
    name: '',
    phone: '',
    role: 'Buyer'
});

onMounted(() => {
    store.dispatch('fetchContacts');
});

const contacts = computed(() => store.getters.allContacts);

const createContact = async () => {
    if (!newContact.value.name) return;
    await store.dispatch('createContact', newContact.value);
    showAddContact.value = false;
    newContact.value = { name: '', phone: '', role: 'Buyer' };
};

const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

const getUserIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

const getContactColor = (contact) => {
    // Seller = Orange (#FF9800), Buyer = Green (#4CAF50), Partner = Blue (#2196F3) or Default
    const role = (contact.role || '').toLowerCase();
    
    // Check tags as well if needed, but role is primary
    if (role.includes('seller') || role.includes('vendeur')) return '#FF9800'; // Orange
    if (role.includes('buyer') || role.includes('acheteur')) return '#4CAF50'; // Green
    
    return '#9E9E9E'; // Gray for others
};

const call = (phone) => {
    window.location.href = `tel:${phone}`;
};
</script>

<style scoped>
.contacts-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f6fa;
}
.top-bar {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-bottom: 3px solid #FF9800; /* Orange for contacts */
  justify-content: space-between;
}
.page-title { font-weight: bold; font-size: 1.2rem; }
.contacts-list {
    flex: 1; overflow-y: auto; padding: 15px;
}
.contact-card {
    background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px;
    display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.avatar {
    width: 40px; height: 40px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;
}
.info { flex: 1; }
.name { font-weight: 500; font-size: 1rem; }
.details { font-size: 0.85rem; color: #666; }
.role-badge { 
    display: inline-block; background: #eee; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; margin-top: 4px; 
}
.actions {
    display: flex; gap: 10px;
}
.icon-btn {
    background: none; border: none; cursor: pointer; font-size: 1.2rem;
}
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 3000;
}
.modal-content {
    background: white; padding: 20px; border-radius: 8px; width: 80%; max-width: 400px;
}
.input-field {
    width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;
}
.modal-actions {
    display: flex; justify-content: flex-end; gap: 10px;
}
.custom-icon {
    display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;
}
</style>
