<template>
  <div class="edit-lead-page">
    <div class="header">
      <div class="back-icon" @click="$router.back()">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
         </svg>
      </div>
      <div class="header-content">
          <div class="header-date">{{ formattedDate }}</div>
          <div class="header-time">{{ formattedTime }}</div>
      </div>
      <div class="save-icon" @click="saveChanges">
          <!-- Using a Check icon for Save, though image had a loop/refresh icon -->
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="20 6 9 17 4 12"></polyline>
         </svg>
      </div>
    </div>

    <div class="form-content">
        <!-- Avatar -->
        <div class="avatar-section">
            <div class="avatar-circle" :style="{ backgroundColor: getAvatarColor(leadName) }">
                {{ getInitial(leadName) }}
            </div>
        </div>

        <!-- Basic Info -->
        <div class="form-group">
            <input type="text" v-model="form.name" placeholder="Name" class="form-input main-input" />
            <span v-if="form.name" class="clear-icon" @click="form.name = ''">✕</span>
        </div>

        <div class="form-group">
            <input type="text" v-model="form.jobTitle" placeholder="Job title" class="form-input" />
        </div>

        <div class="form-group">
            <input type="text" v-model="form.company" placeholder="Company" class="form-input" />
        </div>

        <!-- Labels -->
        <div class="labels-section">
            <div class="label-title">Labels</div>
            <div class="labels-container">
                <div v-for="label in form.labels" :key="label" class="label-chip" :class="getLabelClass(label)">
                    {{ label }}
                </div>
                <button class="add-label-btn" @click="addLabel">Add Label</button>
            </div>
        </div>

        <!-- Contact Info -->
        <!-- Mobile -->
        <div class="contact-row">
            <div class="type-selector">
                <span class="type-text">Mobile</span>
                <span class="dropdown-arrow">▼</span>
            </div>
            <div class="input-wrapper">
                 <input type="tel" v-model="form.phone" class="contact-input" placeholder="Phone" />
            </div>
        </div>

        <!-- Phone 2 -->
        <div class="contact-row">
            <div class="type-selector">
                <span class="type-text">Mobile</span>
                <span class="dropdown-arrow">▼</span>
            </div>
             <div class="input-wrapper">
                 <input type="tel" v-model="form.phone2" class="contact-input" placeholder="Phone" />
            </div>
        </div>

        <!-- Email -->
        <div class="contact-row">
            <div class="type-selector"></div>
             <div class="input-wrapper">
                 <input type="email" v-model="form.email" class="contact-input" placeholder="Email" />
            </div>
        </div>

        <!-- Website -->
        <div class="contact-row">
             <div class="type-selector"></div>
             <div class="input-wrapper">
                 <input type="text" v-model="form.website" class="contact-input" placeholder="Website" />
            </div>
        </div>
        
         <!-- Address -->
        <div class="contact-row">
            <div class="type-selector">
                <span class="type-text">Home</span>
                <span class="dropdown-arrow">▼</span>
            </div>
             <div class="input-wrapper">
                 <input type="text" v-model="form.address" class="contact-input" placeholder="Address" />
            </div>
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

const store = useStore();
const route = useRoute();
const useRouterInstance = useRouter();

const leadId = route.params.id;

const form = ref({
    name: '',
    jobTitle: '',
    company: '',
    phone: '',
    phone2: '',
    email: '',
    website: '',
    address: '',
    labels: ['VIP', 'Customer', 'Supplier', 'Project A', 'Project B', 'gggg'] // Mock labels
});

// Mock formatted date/time matching the user's prompt style
const now = new Date();
const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const leadName = computed(() => form.value.name || form.value.phone || '?');

const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
};

const getAvatarColor = (name) => {
    if (!name) return '#ccc';
    const colors = ['#e0b0ff', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5']; 
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getLabelClass = (label) => {
    // Simple mock logic for colors
    if (label === 'VIP') return 'label-vip';
    if (label === 'Customer') return 'label-customer';
    return 'label-default';
};

const addLabel = () => {
    // Navigate to label picker or show modal
    console.log('Add label clicked');
};

const saveChanges = async () => {
    // Dispatch update
    try {
        const updatedLead = {
             id: leadId,
             ...form.value
        };
        // store.dispatch('updateLead', updatedLead);
        // Using existing generic update if available or specific
        store.commit('UPDATE_LEAD', updatedLead); // Optimistic update for demo
        useRouterInstance.back();
    } catch (e) {
        console.error(e);
    }
};

onMounted(() => {
    const lead = store.getters.allLeads.find(l => String(l.id) === String(leadId) || l.phone === leadId);
    if (lead) {
        form.value = {
            ...form.value,
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            // Populate others if available
        };
    } else {
        // leadId might be phone number
        form.value.phone = leadId;
    }
});
</script>

<style scoped>
.edit-lead-page {
    background: white;
    min-height: 100vh;
    font-family: 'Roboto', sans-serif;
    color: #333;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
}
.header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.header-date {
    font-size: 1.1rem;
    font-weight: 500;
}
.header-time {
    font-size: 0.9rem;
    color: #888;
}

.form-content {
    padding: 20px;
}

.avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
}
.avatar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #e0b0ff;
    color: white;
    font-size: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.form-group {
    margin-bottom: 20px;
    position: relative;
    border-bottom: 1px solid #eee;
}
.form-input {
    width: 100%;
    padding: 10px 0;
    font-size: 1rem;
    border: none;
    outline: none;
    color: #333;
}
.form-input::placeholder {
    color: #aaa;
}
.clear-icon {
    position: absolute;
    right: 0;
    top: 10px;
    color: #6200ea;
    font-weight: bold;
    cursor: pointer;
}

.labels-section {
    margin: 20px 0;
}
.label-title {
    font-size: 0.9rem;
    color: #999;
    margin-bottom: 10px;
}
.labels-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.label-chip {
    border: 1px solid #ddd;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.85rem;
    color: #666;
}
.label-vip { border-color: orange; color: orange; }
.label-customer { border-color: red; color: red; }
.add-label-btn {
    background: #6200ea;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.85rem;
    font-weight: 500;
}

.contact-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f9f9f9;
    padding: 15px 0;
}
.type-selector {
    width: 80px;
    color: #999;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}
.dropdown-arrow {
    font-size: 0.7rem;
}
.input-wrapper {
    flex: 1;
    padding-left: 10px;
    border-left: 1px solid #eee;
}
.contact-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 1rem;
    color: #333;
}
.contact-input::placeholder {
    color: #ccc;
}
</style>
