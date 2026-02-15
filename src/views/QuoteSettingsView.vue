<template>
  <div class="quote-settings-page">
    <header class="header">
      <div class="back-btn" @click="$router.back()">←</div>
      <h1>Settings</h1>
      <div class="spacer"></div>
    </header>

    <div class="settings-content">
      
      <!-- Logo & Business Details -->
      <div class="setting-item" @click="toggleLogo">
        <div class="setting-info">
           <div class="setting-label">Logo & Business Details</div>
           <div class="setting-desc">Include your logo & business details in quotes</div>
        </div>
        <!-- Toggle Switch logic if user wants toggle, or maybe navigation to details? -->
        <!-- Image implies just text, maybe toggle? Let's use switch for enable/disable -->
         <label class="switch">
            <input type="checkbox" v-model="settings.includeLogo">
            <span class="slider round"></span>
        </label>
      </div>

      <!-- Start Quotes Number -->
      <div class="setting-item">
         <div class="setting-info">
            <div class="setting-label">Start Quotes Number</div>
            <input v-model.number="settings.startNumber" type="number" class="setting-input-inline" />
         </div>
      </div>

      <!-- Quotes Validity -->
      <div class="setting-item">
         <div class="setting-info">
            <div class="setting-label">Quotes Validity</div>
            <div class="setting-input-wrapper">
                <input v-model.number="settings.validityDays" type="number" class="setting-input-inline" /> 
                <span class="suffix">days</span>
            </div>
         </div>
      </div>

      <!-- Currency -->
      <div class="setting-item" @click="openCurrencyModal">
         <div class="setting-info">
            <div class="setting-label">Currency</div>
            <div class="setting-desc">{{ currencyLabel }}</div>
         </div>
      </div>

      <!-- Include Tax -->
      <div class="setting-item">
         <div class="setting-label">Include Tax</div>
         <label class="switch">
            <input type="checkbox" v-model="settings.includeTax">
            <span class="slider round"></span>
        </label>
      </div>

      <!-- Include Total Price -->
      <div class="setting-item">
         <div class="setting-label">Include total price</div>
         <label class="switch">
            <input type="checkbox" v-model="settings.includeTotal">
            <span class="slider round"></span>
        </label>
      </div>

      <!-- Tax Rate -->
      <div class="setting-item" :class="{ disabled: !settings.includeTax }">
         <div class="setting-info">
            <div class="setting-label">Tax Rate</div>
            <div class="setting-input-wrapper">
                 <input v-model.number="settings.taxRate" type="number" step="0.1" :disabled="!settings.includeTax" class="setting-input-inline" />
                 <span class="suffix">%</span>
            </div>
         </div>
      </div>

      <!-- Show Customer Details -->
      <div class="setting-item">
         <div class="setting-info">
             <div class="setting-label">Show Customer Details</div>
             <div class="setting-desc">Don't include details</div>
         </div>
         <!-- Implicit Switch or selection? Let's assume switch for simplicity as placeholder, or select -->
          <label class="switch">
            <input type="checkbox" v-model="settings.showCustomerDetails">
            <span class="slider round"></span>
        </label>
      </div>

      <!-- Footer Text -->
      <div class="setting-item column">
          <div class="setting-label">Footer Text</div>
          <textarea v-model="settings.footerText" placeholder="Enter footer text..." class="footer-input"></textarea>
      </div>

    </div>

    <!-- Currency Modal -->
    <div v-if="showCurrencyModal" class="modal-overlay" @click="showCurrencyModal = false">
        <div class="modal-content" @click.stop>
            <h3>Select Currency</h3>
            <div class="currency-option" @click="selectCurrency('USD')">
                <span>US Dollar ($)</span>
                <span v-if="settings.currency === 'USD'">✓</span>
            </div>
            <div class="currency-option" @click="selectCurrency('EUR')">
                <span>Euro (€)</span>
                <span v-if="settings.currency === 'EUR'">✓</span>
            </div>
             <div class="currency-option" @click="selectCurrency('ILS')">
                <span>Shekel (₪)</span>
                <span v-if="settings.currency === 'ILS'">✓</span>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const showCurrencyModal = ref(false);

const settings = ref({
    includeLogo: false,
    startNumber: 0,
    validityDays: 30,
    currency: 'USD',
    includeTax: false,
    includeTotal: true,
    taxRate: 0,
    showCustomerDetails: false, // boolean map to 'include'/'dont'
    footerText: ''
});

onMounted(() => {
    const current = store.getters.quoteSettings;
    if (current) {
        settings.value = { ...settings.value, ...current };
    }
});

watch(settings, (newVal) => {
    store.commit('SET_QUOTE_SETTINGS', newVal);
    // Optionally dispatch save if you want persistent cloud storage
    // store.dispatch('saveSettings'); 
}, { deep: true });

const currencyLabel = computed(() => {
    switch(settings.value.currency) {
        case 'USD': return 'US Dollar';
        case 'EUR': return 'Euro';
        case 'ILS': return 'Shekel';
        default: return settings.value.currency;
    }
});

const openCurrencyModal = () => showCurrencyModal.value = true;
const selectCurrency = (curr) => {
    settings.value.currency = curr;
    showCurrencyModal.value = false;
};

const toggleLogo = () => {
    // Navigate to logo upload if needed, or just toggle
};

</script>

<style scoped>
.quote-settings-page {
    background: #fff;
    min-height: 100vh;
    font-family: 'Roboto', sans-serif;
}

.header {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
}
.back-btn {
    font-size: 1.5rem;
    margin-right: 15px;
    cursor: pointer;
}
.header h1 {
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0;
}
.spacer { flex: 1; }

.settings-content {
    padding: 0;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer; /* Makes whole row clickable */
}
.setting-item.column {
    flex-direction: column;
    align-items: flex-start;
}
.setting-item.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.setting-info {
    flex: 1;
}
.setting-label {
    font-size: 1rem;
    color: #333;
    margin-bottom: 4px;
}
.setting-desc {
    font-size: 0.85rem;
    color: #888;
}

.setting-input-inline {
    border: none;
    border-bottom: 1px solid #ccc;
    width: 60px;
    font-size: 1rem;
    padding: 2px 0;
    outline: none;
}
.setting-input-wrapper {
    display: flex; align-items: center; gap: 5px;
}
.suffix { font-size: 0.9rem; color: #666; }

.footer-input {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 80px;
    font-family: inherit;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}
.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; top: 0;
  left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 20px; width: 20px;
  left: 4px; bottom: 4px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider {
  background-color: #6200ea; /* Purple accent */
}
input:checked + .slider:before {
  transform: translateX(22px);
}
.slider.round {
  border-radius: 34px;
}
.slider.round:before {
  border-radius: 50%;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
}
.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 300px;
}
.modal-content h3 { margin-top: 0; margin-bottom: 15px; }
.currency-option {
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    display: flex; justify-content: space-between;
    cursor: pointer;
}
.currency-option:last-child { border-bottom: none; }
</style>
