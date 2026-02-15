<template>
  <div class="tenant-setup-page">
    <!-- Header removed -->

    <div class="content">
      <h3 class="title">Before we start</h3>
      <p class="subtitle">Help us to give you and you team the best experience</p>

      <div class="form-group">
        <input type="text" v-model="companyName" placeholder="Company name" class="input-field" />
      </div>

      <div class="form-group" @click="showIndustryModal = true">
        <div class="input-field select-like">
          {{ industry || 'Industry' }}
        </div>
      </div>

      <div class="form-group" @click="showSizeModal = true">
        <div class="input-field select-like">
           {{ companySize || 'Company size' }}
        </div>
      </div>

    </div>

    <div class="footer">
      <button class="continue-btn" @click="handleContinue" :disabled="!isValid">Continue</button>
    </div>

    <!-- Modals -->
    <Teleport to="body">
        <!-- Industry Modal -->
        <div v-if="showIndustryModal" class="modal-overlay">
            <div class="modal-content">
                <h3 class="modal-title">Industry</h3>
                <div class="options-list">
                    <div v-for="opt in industryOptions" :key="opt" class="option-item" @click="selectIndustry(opt)">
                        {{ opt }}
                    </div>
                </div>
                <div class="modal-actions">
                     <button @click="showIndustryModal = false" class="text-btn">Cancel</button>
                     <button @click="showIndustryModal = false" class="text-btn confirm">OK</button>
                </div>
            </div>
        </div>

        <!-- Size Modal -->
        <div v-if="showSizeModal" class="modal-overlay">
            <div class="modal-content">
                <h3 class="modal-title">Company size</h3>
                <div class="options-list">
                    <div v-for="opt in sizeOptions" :key="opt" class="option-item" @click="selectSize(opt)">
                        {{ opt }}
                    </div>
                </div>
                <div class="modal-actions">
                     <button @click="showSizeModal = false" class="text-btn">Cancel</button>
                     <button @click="showSizeModal = false" class="text-btn confirm">OK</button>
                </div>
            </div>
        </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

const companyName = ref('');
const industry = ref('');
const companySize = ref('');
const inviteCode = ref('');

const showIndustryModal = ref(false);
const showSizeModal = ref(false);

const industryOptions = [
    'Agriculture', 'Architecture', 'Business Services', 'Consulting', 
    'Consumer Goods', 'Design', 'Financial Services', 
    'General maintenance and repair', 'Human Resource Management', 
    'Health Service', 'Manufacturing', 'Media & Advertising', 
    'Real Estate', 'Retail Industry', 'Technology', 
    'Travel and Tourism', 'Other'
];

const sizeOptions = [
    '1', '2-5', '6-10', '11-20', '21-50', '51-200'
];

const isValid = computed(() => {
    return companyName.value.trim() !== '' && industry.value !== '' && companySize.value !== '';
});

const goBack = () => {
    router.back();
};

const selectIndustry = (val) => {
    industry.value = val;
    showIndustryModal.value = false;
};

const selectSize = (val) => {
    companySize.value = val;
    showSizeModal.value = false;
};

const handleContinue = async () => {
    if (!isValid.value) return;

    try {
        await store.dispatch('createTenant', {
            companyName: companyName.value,
            industry: industry.value,
            companySize: companySize.value
        });
        
        router.push('/invite-teammates');
    } catch (e) {
        alert('Failed to create workspace. Please try again.');
    }
};

const handleJoin = async () => {
    if (!inviteCode.value) return;
    try {
        await store.dispatch('joinTenant', inviteCode.value);
        router.push('/activities');
        // Ideally show success message
    } catch (e) {
        console.error(e);
        alert('Failed to join team. Check the code.');
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.tenant-setup-page {
    font-family: 'Roboto', sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
}

.header {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
}

.close-icon {
    margin-right: 15px;
    cursor: pointer;
}

.header h2 {
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0;
}

.content {
    flex: 1;
    padding: 30px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.title {
    color: #6200ea; /* Purple */
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
}

.subtitle {
    text-align: center;
    color: #333;
    margin-bottom: 40px;
    font-size: 0.95rem;
    max-width: 250px;
}

.form-group {
    width: 100%;
    margin-bottom: 15px;
    position: relative;
}

.input-field {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    font-size: 1rem;
    background: #fff;
    color: #333;
    outline: none;
    box-sizing: border-box; /* IMPORTANT */
}

.input-field::placeholder {
    color: #888;
}

.select-like {
    color: #888;
    cursor: pointer;
}

.footer {
    padding: 20px;
    display: flex;
    justify-content: flex-end;
}

.continue-btn {
    background: #b388ff; /* Lighter purple initially/disabled */
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
}

.continue-btn:not(:disabled) {
    background: #a855f7; /* Matching image purple */
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    width: 85%;
    max-width: 350px;
    max-height: 80vh;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 20px;
}

.modal-title {
    font-size: 1.1rem;
    margin-bottom: 15px;
    font-weight: 500;
}

.options-list {
    overflow-y: auto;
    flex: 1;
}

.option-item {
    padding: 12px 0;
    font-size: 1rem;
    cursor: pointer;
}

.option-item:hover {
    background: #f5f5f5;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
    gap: 20px;
}

.text-btn {
    background: none;
    border: none;
    color: #6200ea;
    font-weight: bold;
    cursor: pointer;
    font-size: 0.9rem;
}

.separator-or {
    margin: 20px 0;
    color: #888;
    font-size: 0.9rem;
    font-weight: 500;
}

.join-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-top: 1px solid #eee;
    padding-top: 20px;
}

.join-title {
    color: #333;
    margin-bottom: 15px;
}

.join-btn {
    background: #4facfe;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 10px;
}
.join-btn:disabled { background: #ccc; }
</style>
