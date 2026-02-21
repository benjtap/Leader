<template>
  <div class="create-contact-page">
    <!-- Header -->
    <div class="header">
      <div class="close-icon" @click="$router.back()">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
         </svg>
      </div>
      <div class="header-title">Add Contact Lead</div>
      <div class="save-icon" @click="saveContact">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
         </svg>
      </div>
    </div>

    <div class="form-content">
        <!-- Avatar -->
        <div class="avatar-section">
            <div class="avatar-circle">
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
        </div>

        <!-- Name Fields -->
        <div class="form-group">
            <input type="text" v-model="form.lastName" placeholder="Name" class="form-input main-input" />
        </div>

        <div class="form-group">
            <input type="text" v-model="form.firstName" placeholder="Prénom" class="form-input" />
        </div>

        <!-- Role Selection -->
        <div class="role-section">
            <div class="section-label">Role</div>
            <div class="role-options">
                <div 
                    class="role-chip" 
                    :class="{ selected: form.role === 'Buyer' }"
                    @click="form.role = 'Buyer'"
                >
                    Acheteur
                </div>
                <div 
                    class="role-chip" 
                    :class="{ selected: form.role === 'Seller' }"
                    @click="form.role = 'Seller'"
                >
                    Vendeur
                </div>
            </div>
        </div>

        <!-- Property Section -->
        <div class="property-section" v-if="form.role">
            <div class="section-label" v-if="form.role === 'Seller'">Qualify Property</div>
            <div class="section-label" v-else>Interested In</div>
            
            <div class="property-selector">
                <select v-model="form.propertyId" class="form-select">
                    <option value="" disabled selected>Select existing property</option>
                    <option v-for="prop in properties" :key="prop.id" :value="prop.id">
                        {{ prop.address }}
                    </option>
                </select>
                
                <button v-if="form.role === 'Seller'" class="add-property-btn" @click="showAddPropertyModal = true">
                    + Add New Property
                </button>
            </div>
        </div>

        <!-- Contact Info -->
        <div class="contact-row">
            <div class="type-selector">
                <span class="type-text">Mobile</span>
            </div>
            <div class="input-wrapper">
                 <input type="tel" v-model="form.phone" class="contact-input" placeholder="Phone" />
            </div>
        </div>

        <div class="contact-row">
            <div class="type-selector static-label">
                <span class="type-text">Email</span>
            </div>
             <div class="input-wrapper">
                 <input type="email" v-model="form.email" class="contact-input" placeholder="Email" />
            </div>
        </div>

        <div class="contact-row">
             <div class="type-selector static-label">
                <span class="type-text">Address</span>
             </div>
             <div class="input-wrapper">
                 <input type="text" v-model="form.address" class="contact-input" placeholder="Address" />
            </div>
        </div>
        
        <!-- Assignment (Mandatory) -->
        <div class="assign-section">
            <div class="section-label required">Assign to *</div>
            <select v-model="form.assignedTo" class="form-select" :class="{ 'error': showError && !form.assignedTo }">
                <option value="" disabled selected>Select User</option>
                <option v-for="member in tenantMembers" :key="member.id || member.Id" :value="member.id || member.Id">
                    {{ member.name || member.Name || member.email || member.Email }}
                </option>
            </select>
            <div v-if="showError && !form.assignedTo" class="error-text">Assignment is required</div>
        </div>

    </div>

    <!-- Add Property Modal -->
    <div v-if="showAddPropertyModal" class="modal-overlay">
        <div class="modal-content">
            <h3>Add New Property</h3>
            <input v-model="newProperty.address" placeholder="Address" class="input-field" />
            <input v-model="newProperty.price" placeholder="Seller Price" class="input-field" type="number" />
            <div class="modal-actions">
                <button @click="createProperty">Save</button>
                <button @click="showAddPropertyModal = false">Cancel</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const form = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    role: 'Buyer', // Default
    propertyId: '',
    assignedTo: ''
});

const showAddPropertyModal = ref(false);
const newProperty = ref({ address: '', price: '' });
const showError = ref(false);

const properties = computed(() => store.getters.allProperties);
const tenantMembers = computed(() => store.getters.tenantMembers);

onMounted(() => {
    store.dispatch('fetchProperties');
    store.dispatch('fetchTenantMembers');
    
    // Auto-select current user if available to be helpful
    const currentUser = store.getters.currentUser;
    if (currentUser) {
        form.value.assignedTo = currentUser.id;
    }
});

const createProperty = async () => {
    if (!newProperty.value.address) return;
    try {
        const res = await store.dispatch('createProperty', {
            address: newProperty.value.address,
            sellerPrice: newProperty.value.price,
            status: 'New'
        });
        if (res && res.id) {
            form.value.propertyId = res.id; // Auto select key
        }
        showAddPropertyModal.value = false;
        newProperty.value = { address: '', price: '' };
    } catch (e) {
        console.error("Failed to create property", e);
    }
};

const saveContact = async () => {
    showError.value = true;
    if (!form.value.lastName && !form.value.phone) {
        alert("Please enter a name or phone number.");
        return;
    }
    if (!form.value.assignedTo) {
        // Validation: Assignment required
        return; 
    }

    try {
        // 1. Create Lead
        const name = `${form.value.firstName} ${form.value.lastName}`.trim();
        const leadData = {
             name: name || form.value.phone,
             phone: form.value.phone,
             email: form.value.email,
             address: form.value.address,
             status: 'New', // Default status for new leads
             listType: 'lead', // Ensure it goes to 'Leads'
             assignedTo: [form.value.assignedTo], // Correct array format
             userId: store.getters.currentUser?.id,
             // Custom fields logic needs to handle role/property linking
             // We can use the 'labels' mechanism or direct fields if supported
        };

        // Create the lead
        // Note: 'createLead' action usually returns the created lead
        // We need to implement 'createLead' to return data if it doesn't already
        // Assuming store.dispatch returns the result from api call
        
        // Wait, we need to adapt 'createLead' to return the item. 
        // Let's implement it here directly through service if needed, OR trust the store.
        // I'll assume store action returns result. If not, I'll fix store.
        
        // Assuming we handle labels for Role
        // Let's first create the lead, then add role label and property link.
        
        /* 
           Simpler approach: Passing everything to createLead if backend supports it. 
           If not, we create then update. 
           Existing 'createLead' just posts to /Leads.
           Let's double check if we can pass labels/propertyId directly.
           The Lead model has PropertyId.
        */

        // Map Role to Label? Or does Lead have a Role field? 
        // Lead model has `PropertyId` and `ContactId`. 
        // If this is a "Contact Lead", it serves as a proto-Contact.
        // Let's stick to Labels for Role for now as per previous logic (Seller/Buyer labels).
        // OR distinct logic:
        
        // Actually, we are creating a LEAD. 
        // If Role is Seller -> Add 'Seller' Label. Link Property as Seller?
        // If Role is Buyer -> Add 'Buyer' Label. Link Property as Interest?
        
        // Let's find/create labels for Buyer/Seller first?
        // Or just assume they exist?
        // Better: Just add string labels if backend supports creating them on fly 
        // or fetch allLabels and find ID.
        
        const allLabels = store.getters.allLabels;
        let roleLabel = allLabels.find(l => l.name === form.value.role || l.type === form.value.role);
        
        // Fallback if label doesn't exist?
        // For now, let's create the Lead first.
        
        // Add propertyId to leadData if backend supports it
        if (form.value.propertyId) {
            leadData.propertyId = form.value.propertyId;
        }

        const res = await store.dispatch('createLead', leadData);
        // Assuming res is the response object or data
        const createdLead = res && res.data ? res.data : res;
        
        if (createdLead && createdLead.id) {
             // Add Role Label
             if (roleLabel) {
                 await store.dispatch('addLabelToLead', { leadId: createdLead.id, labelId: roleLabel.id });
             } else {
                 // Try to create label on fly? Or just skip?
                 // Let's try to find by Name loosely
                 const looseLabel = allLabels.find(l => l.name.toLowerCase().includes(form.value.role.toLowerCase()));
                 if (looseLabel) {
                     await store.dispatch('addLabelToLead', { leadId: createdLead.id, labelId: looseLabel.id });
                 }
             }
             
             // If Seller, and Property Linked, we might want to update the Property with SellerId too?
             // Not strictly required by prompt ("ajoute une section...").
             // Let's stick to redirects.
        }

        router.push({ name: 'home' }); // Redirect to Leads (Dashboard/Home)
    } catch (e) {
        console.error(e);
        alert("Failed to create contact");
    }
};
</script>

<style scoped>
.create-contact-page {
    background: white;
    min-height: 100vh;
    font-family: 'Roboto', sans-serif;
    color: #333;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.header-title { font-size: 1.2rem; font-weight: 500; color: #333; }
.close-icon, .save-icon { cursor: pointer; color: #333; }
.form-content { padding: 20px; }
.avatar-section { display: flex; justify-content: center; margin: 20px 0 30px; }
.avatar-circle {
    width: 90px; height: 90px; border-radius: 50%; background: #6200ea;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 10px rgba(98, 0, 234, 0.3);
}
.form-group { margin-bottom: 20px; border-bottom: 1px solid #eee; }
.form-input { width: 100%; padding: 10px 0; font-size: 1rem; border: none; outline: none; color: #333; }
.section-label { font-size: 0.9rem; color: #999; margin-bottom: 10px; }
.section-label.required { color: #d32f2f; }
.role-options { display: flex; gap: 10px; margin-bottom: 25px; }
.role-chip {
    padding: 8px 20px; border-radius: 20px; border: 1px solid #ddd; color: #666; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.role-chip.selected {
    background-color: #e8eaf6; color: #3f51b5; border-color: #3f51b5;
}
.contact-row { display: flex; align-items: center; border-bottom: 1px solid #f9f9f9; padding: 15px 0; }
.type-selector { width: 80px; color: #aaa; font-size: 0.9rem; }
.input-wrapper { flex: 1; padding-left: 15px; border-left: 1px solid #eee; }
.contact-input { width: 100%; border: none; outline: none; font-size: 1rem; color: #333; }
.form-select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; background: white; font-size: 1rem; }
.form-select.error { border-color: #d32f2f; }
.add-property-btn { margin-top: 10px; background: none; border: none; color: #6200ea; font-weight: 500; cursor: pointer; padding: 0; }
.assign-section { margin-top: 20px; }
.error-text { color: #d32f2f; font-size: 0.8rem; margin-top: 5px; }

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
