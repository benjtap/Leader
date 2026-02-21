<template>
  <div class="labels-page properties-list-page">
    <div class="top-bar">
      <div class="back-icon" @click="$router.back()">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </div>
      <div class="title">Properties list</div>
    </div>

    <!-- Sub Header Action -->
    <div class="sub-header" @click="openAddProperty">
        <span class="plus-text">+ ADD PROPERTY</span>
    </div>

    <div class="labels-list">
        <div 
            v-for="prop in allProperties" 
            :key="prop.id" 
            class="label-item"
        >
            <div class="label-left">
                <!-- Drag Handle Visual -->
                <div class="drag-handle-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line></svg>
                </div>
                
                <div class="label-color" :style="{ backgroundColor: prop.color || '#4CAF50' }">
                    <span style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: white;">🏠</span>
                </div>
                
                <span class="label-name">{{ prop.address }}</span>
            </div>
            
            <div class="label-right">
                <span class="edit-icon" @click.stop="openEditProperty(prop)">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#6200ea" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </span>
                 <span class="delete-icon" @click.stop="confirmDelete(prop)">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b39ddb" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </span>
            </div>
        </div>
    </div>

    <!-- FAB -->
    <button class="fab-btn" @click="openAddProperty">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" stroke-width="3" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>

    <!-- Add/Edit Property Sheet -->
    <div v-if="showSheet" class="sheet-overlay" @click="closeSheet">
        <div class="sheet-content" @click.stop>
            <div class="sheet-header">
                <h3>{{ editingProp ? 'Edit Property' : 'Add Property' }}</h3>
            </div>
            <div class="sheet-body">
                
                <div class="form-group">
                    <input 
                        v-model="propForm.address" 
                        type="text" 
                        placeholder="Property Address / Name" 
                        class="label-input"
                        ref="addressInput"
                    />
                </div>

                <div class="form-group">
                    <input 
                        v-model="propForm.mandateNumber" 
                        type="text" 
                        placeholder="N° Mandat de vente" 
                        class="label-input"
                    />
                </div>

                <div class="form-group required">
                    <select v-model="propForm.sellerContactId" class="label-input" :class="{ error: submitted && !propForm.sellerContactId }">
                        <option value="" disabled>Select Owner (Seller) *</option>
                        <option v-for="seller in sellers" :key="seller.id" :value="seller.id">
                            {{ seller.name }} ({{ seller.phone || seller.email }})
                        </option>
                    </select>
                    <span v-if="submitted && !propForm.sellerContactId" class="error-text">Owner is required</span>
                </div>

                <div class="form-group">
                    <input 
                        v-model="propForm.sellerPrice" 
                        type="text" 
                        placeholder="Seller Price (Prix Vendeur)" 
                        class="label-input"
                    />
                </div>

                <div class="form-group">
                    <input 
                        v-model="propForm.estimatedPrice" 
                        type="text" 
                        placeholder="Estimated Price (Prix Estimé)" 
                        class="label-input"
                    />
                </div>

                <!-- Color Picker (Optional, maybe for map pin color) -->
                <div class="color-section-title">Color</div>
                <div class="color-picker">
                    <div 
                        v-for="color in colors" 
                        :key="color" 
                        class="color-circle"
                        :style="{ backgroundColor: color }"
                        :class="{ selected: propForm.color === color }"
                        @click="propForm.color = color"
                    >
                        <span v-if="propForm.color === color" class="check">✓</span>
                    </div>
                </div>
                
                <button class="save-btn" @click="saveProperty" :disabled="!propForm.address">
                    SAVE
                </button>

            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();


onMounted(() => {
    store.dispatch('fetchProperties');
    
    // Auto-open if create param exists
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('create')) {
        openAddProperty();
    }
});

const showSheet = ref(false);
const editingProp = ref(null);
const addressInput = ref(null);

const submitted = ref(false);

const propForm = ref({
    address: '',
    mandateNumber: '',
    sellerContactId: '',
    sellerPrice: '',
    estimatedPrice: '',
    color: '#4CAF50',
    status: 'Lead' // Default to 'Lead' as requested
});

const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', 
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', 
    '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#000000'
];

const allProperties = computed(() => store.getters.allProperties);
const sellers = computed(() => {
    // Filter contacts to find sellers. Assuming we have allContacts getter.
    const contacts = store.getters.allContacts || [];
    return contacts.filter(c => 
        (c.role && c.role.toLowerCase() === 'seller') || 
        (c.tags && (c.tags.includes('Seller') || c.tags.includes('Vendeur')))
    );
});

onMounted(() => {
    store.dispatch('fetchProperties');
    store.dispatch('fetchContacts'); // Ensure we have contacts for the seller dropdown

    // Auto-open if create param exists
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('create')) {
        openAddProperty();
    }
});

const openAddProperty = () => {
    editingProp.value = null;
    submitted.value = false;
    propForm.value = { 
        address: '', 
        mandateNumber: '',
        sellerContactId: '',
        sellerPrice: '',
        estimatedPrice: '',
        color: '#4CAF50',
        status: 'Lead'
    };
    showSheet.value = true;
    nextTick(() => addressInput.value?.focus());
};

const openEditProperty = (prop) => {
    editingProp.value = prop;
    propForm.value = { ...prop };
    showSheet.value = true;
};

const closeSheet = () => {
    showSheet.value = false;
    // Clean query param if exists
    if (window.location.search.includes('create')) {
         const url = new URL(window.location);
         url.searchParams.delete('create');
         window.history.replaceState({}, '', url);
    }
};

const saveProperty = async () => {
    submitted.value = true;
    if (!propForm.value.address || !propForm.value.sellerContactId) return;

    const payload = JSON.parse(JSON.stringify(propForm.value));
    payload.status = 'Lead'; // Enforce Lead status on creation/update from here unless specific override

    // Ensure we don't send an ID for creation, but keep it for updates
    if (!editingProp.value) {
        delete payload.id;
        delete payload._id;
    }

    let propertyId;
    if (editingProp.value) {
        propertyId = editingProp.value.id;
        await store.dispatch('updateProperty', { id: editingProp.value.id, ...payload });
    } else {
        const res = await store.dispatch('createProperty', payload);
        // Assuming createProperty returns the created object or ID
        // If not, we might need to modify store action to return it.
        // Usually axios response.data contains the object.
        if (res && res.data && res.data.id) {
            propertyId = res.data.id;
        } else if (res && res.id) {
            propertyId = res.id;
        }
    }
    closeSheet();

    // Redirect to Property Details (Image 2 styles)
    if (propertyId) {
        router.push({ name: 'property-details', params: { propertyId } });
    }
    closeSheet();
};

const confirmDelete = async (prop) => {
    if (confirm(`Delete property "${prop.address}"?`)) {
        // Assume delete property action exists or needs implementing
        // store.dispatch('deleteProperty', prop.id);
        console.log("Delete not implemented or use generic delete");
    }
};
</script>

<style scoped>
.labels-page {
    background: #f5f6fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    padding-bottom: 80px; 
}

.top-bar {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    background: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.back-icon {
    margin-right: 15px;
    cursor: pointer;
    color: #333;
}

.title {
    flex: 1;
    font-size: 1.1rem;
    font-weight: 500;
    color: #2c3e50;
}

.sub-header {
    padding: 15px 20px;
}

.plus-text {
    color: #6200ea;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    text-transform: uppercase;
}

.labels-list {
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.label-item {
    background: white;
    padding: 12px 15px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.label-left {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
}

.drag-handle-icon {
    color: #ccc;
    display: flex;
    align-items: center;
    cursor: grab;
}

.label-color {
    width: 28px;
    height: 28px;
    border-radius: 50%;
}

.label-name {
    font-size: 1rem;
    color: #333;
    font-weight: 400;
}

.label-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.edit-icon, .delete-icon {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px;
}

/* FAB */
.fab-btn {
    position: fixed;
    bottom: 30px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #6200ea;
    border: none;
    box-shadow: 0 4px 10px rgba(98, 0, 234, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
}

/* Sheet Styles */
.sheet-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
}

.sheet-content {
    background: white;
    width: 100%;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    padding: 20px;
    animation: slideUp 0.3s ease-out;
}

.sheet-header h3 {
    margin: 0 0 20px 0;
    color: #6200ea;
}

.label-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 20px;
}

.color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.color-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
}

.color-circle.selected {
    border-color: #333;
}

.check {
    color: white;
    font-size: 0.8rem;
}

.save-btn {
    width: 100%;
    padding: 12px;
    background: #6200ea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
}

.save-btn:disabled {
    background: #ccc;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

/* Type Selection Styles */
.type-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.type-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 12px;
    border: 1px solid #eee;
    cursor: pointer;
    transition: background 0.2s;
}

.type-item:active {
    background: #f0f0f0;
}

.type-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f0f0f0;
    pointer-events: none;
}

.exists-badge {
    background: #eee;
    color: #888;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 500;
}

.type-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    margin-right: 15px;
    font-size: 1.2rem;
}

.buyer-icon { background: #4CAF50; }
.seller-icon { background: #2196F3; }
.property-icon { background: #6200ea; }

.type-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.type-name {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
}

.type-desc {
    font-size: 0.8rem;
    color: #888;
}

.arrow-right {
    font-size: 1.5rem;
    color: #ccc;
}

/* Property Form Styles */
.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.label-input.disabled {
    background: #f0f0f0;
    color: #999;
}

.color-section-title {
    margin-bottom: 10px;
    font-weight: 500;
    color: #666;
    font-size: 0.9rem;
}

.label-input.error {
    border-color: #d32f2f;
}

.error-text {
    color: #d32f2f;
    font-size: 0.8rem;
    margin-top: 5px;
}
</style>
