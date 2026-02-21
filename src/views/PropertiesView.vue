<template>
  <div class="properties-page">
    <div class="top-bar">
      <div class="menu-icon" @click="showSidebar = true">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="#5f6368" stroke-width="2" fill="none">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
      <div class="page-title">Properties Pipeline</div>
      <div class="top-actions">
        <div class="icon-btn" @click="showAddProperty = true">
            <span style="font-size: 1.5rem;">+</span>
        </div>
      </div>
    </div>

    <div class="swiper-container">
        <!-- Defined Columns for Property Pipeline -->
        <div class="slide" v-for="col in columns" :key="col.id">
            <ListComponent 
                :title="col.name" 
                :items="getPropertiesByStatus(col.id)"
                :statusOptions="columns"
                @create="handleCreate(col.id)"
            />
        </div>
    </div>

    <SidebarMenu :visible="showSidebar" @close="showSidebar = false" />
    
    <!-- Add Property Modal (Simplified) -->
    <div v-if="showAddProperty" class="modal-overlay">
        <div class="modal-content">
            <h3>Add Property</h3>
            <input v-model="newProperty.address" placeholder="Address" class="input-field" />
            <input v-model="newProperty.price" placeholder="Seller Price" class="input-field" />
            <div class="modal-actions">
                <button @click="createProperty">Save</button>
                <button @click="showAddProperty = false">Cancel</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import SidebarMenu from '../components/SidebarMenu.vue';
import ListComponent from '../components/ListComponent.vue';

const store = useStore();
const showSidebar = ref(false);
const showAddProperty = ref(false);

const newProperty = ref({
    address: '',
    price: ''
});


const columns = [
    { id: 'New', name: 'Nouveau Mandat' },
    { id: 'Visit', name: 'Visites Planifiées' },
    { id: 'Offer', name: 'Offres Reçues' },
    { id: 'Signed', name: 'Compromis Signé' },
    { id: 'Sold', name: 'Vendu' }
];

onMounted(() => {
    store.dispatch('fetchProperties');
    // Check for create query param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('create')) {
        showAddProperty.value = true;
    }
});

const properties = computed(() => store.getters.allProperties);

const getPropertiesByStatus = (status) => {
    return properties.value
        .filter(p => (p.status || 'New') === status)
        .map(p => ({
            ...p,
            name: p.address, // Map address to name for ListComponent
            // House Icon
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
            color: '#2196F3', // Blue for Properties, or keep as Green if preferred. Let's stick with Green if that was default, but generally Homes are Blue/Green.
            // Wait, previous color was #4CAF50. Let's keep it consistent unless requested otherwise. 
            // The "Property Buyer Entity" comment said replace face with house.
            textColor: 'white',
            listType: status // For ListComponent to know current status
        }));
};

const createProperty = async () => {
    if (!newProperty.value.address) return;
    await store.dispatch('createProperty', {
        address: newProperty.value.address,
        sellerPrice: newProperty.value.price,
        status: newProperty.value.status || 'New'
    });
    showAddProperty.value = false;
    newProperty.value = { address: '', price: '' };
};

// Handle Create from ListComponent header
const handleCreate = (status) => {
    newProperty.value.status = status;
    showAddProperty.value = true;
};

// Handle Move (Need to listen to move event from ListComponent or Store action?)
// ListComponent calls store.dispatch('moveItem') 
// I need to implement 'moveItem' action in store to handle Properties too, or 'moveProperty'.
// Current ListComponent.vue calls 'moveItem'. 
// I should probably update ListComponent to emit 'move' properly or handle Property moves in store 'moveItem'.

</script>

<style scoped>
.properties-page {
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
  border-bottom: 3px solid #4CAF50; /* Green theme for properties */
  justify-content: space-between;
}
.page-title {
    font-weight: bold;
    font-size: 1.2rem;
    color: #333;
}
.swiper-container {
  flex: 1;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.slide {
  flex: 0 0 85vw; /* Slightly smaller than full width */
  width: 85vw;
  scroll-snap-align: start;
  height: 100%;
  border-right: 1px solid #eee;
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
</style>
