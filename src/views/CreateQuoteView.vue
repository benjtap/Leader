<template>
  <div class="create-quote-page">
    <!-- Header -->
    <div class="header">
      <div class="close-icon" @click="$router.back()">
         <span class="x-icon">×</span>
         <span class="header-title">{{ leadName || 'Client' }}</span>
      </div>
       <div class="right-icons">
           <div class="header-action" @click="openSettings">
               <span class="gear-icon">⚙️</span>
           </div>
           <div class="header-avatar" :style="{ backgroundColor: getAvatarColor(leadName) }">
               {{ getInitial(leadName) }}
           </div>
       </div>
    </div>

    <div class="form-content">
      
      <!-- Quote Title -->
      <div class="input-group">
          <input v-model="quoteTitle" placeholder="Quote title" class="input-field" />
          <!-- Purple underline is default focus state or border bottom -->
      </div>

      <!-- To Client Name -->
      <div class="input-group">
          <label class="floating-label">To: Client Name:</label>
          <div class="client-name-display">{{ leadName }}</div>
          <div class="static-input-line"></div>
      </div>

      <!-- Status Dropdown -->
      <div class="input-group dropdown">
          <div class="select-wrapper">
             <span class="selected-value">{{ status }}</span>
             <select v-model="status" class="hidden-select">
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
            </select>
             <span class="chevron">∨</span>
          </div>
          <div class="static-input-line"></div>
      </div>

      <!-- Items List -->
      <div class="items-list">
          <div class="items-header-row">
              <span class="ih-desc">Description</span>
              <span class="ih-qty">Qty</span>
              <span class="ih-price">Price</span>
              <span class="ih-total">Total</span>
          </div>
          <div v-for="(item, index) in items" :key="index" class="item-row">
              <div class="input-wrapper desc">
                  <input v-model="item.description" class="clean-input" placeholder="Item name" />
              </div>
              <div class="input-wrapper qty">
                  <input v-model.number="item.quantity" type="number" class="clean-input center" @focus="handleFocus" />
              </div>
              <div class="input-wrapper price">
                  <input v-model.number="item.price" type="number" class="clean-input right" placeholder="0.00" @focus="handleFocus" />
              </div>
              <div class="item-total">
                  {{ formatCurrency(item.price * item.quantity) }}
              </div>
               <button class="remove-btn" @click="removeItem(index)" v-if="items.length > 1">×</button>
          </div>
          <button class="add-btn" @click="addItem">+ Add Item</button>
      </div>

      <!-- Totals -->
      <div class="totals-section">
          <h3>Total</h3>
          
          <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
          </div>
          
          <div class="summary-row">
              <span>Discount</span>
              <div class="discount-control">
                  <div class="currency-selector">
                      <select v-model="discountType">
                          <option value="amount">{{ currencySymbol }}</option>
                          <option value="percent">%</option>
                      </select>
                      <span>{{ discountType === 'amount' ? currencySymbol : '%' }}</span>
                      <span class="arrow">∨</span>
                  </div>
                  <input v-model.number="discount" type="number" class="discount-input" placeholder="0" @focus="handleFocus" />
              </div>
          </div>

          <div class="summary-row total">
              <span>Total Amount</span>
              <span>{{ formatCurrency(totalAmount) }}</span>
          </div>
      </div>

      <!-- Footer Comment -->
      <div class="footer-comment">
          <input v-model="comment" placeholder="Add a comment that will appear at the bottom of the document" class="input-line full" />
      </div>

    </div>

    <!-- Bottom Action -->
    <div class="bottom-action" @click="saveQuote">
        <span class="send-icon">➤</span>
        <span class="action-text">Preview & Send</span>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const store = useStore();

const leadId = route.params.leadId;
const currentLead = computed(() => store.getters.allLeads.find(l => l.id === leadId || l.phone === leadId));
const leadName = computed(() => currentLead.value?.name || currentLead.value?.phone || '');

const quoteTitle = ref('');
const status = ref('Draft');
const items = ref([
    { description: '', price: 0, quantity: 1 }
]);
const discount = ref(0);
const discountType = ref('amount'); 
const comment = ref('');

const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';
const getAvatarColor = (name) => '#000080'; // Dark blue

const currencySymbol = computed(() => {
    const code = store.getters.quoteSettings.currency || 'USD';
    const map = { 'USD': '$', 'EUR': '€', 'ILS': '₪' };
    return map[code] || '$';
});

const openSettings = () => {
    const user = store.getters.currentUser;
    if (user && (parseInt(user.role) === 1 || user.role === 'Owner' || user.role === 'Admin')) { // check role string or value
        router.push({ name: 'quote-settings' });
    } else {
        store.dispatch('showToast', { message: 'Access denied: Admin or Owner only', type: 'error' });
    }
};

const handleFocus = (event) => {
    const val = Number(event.target.value);
    if (val === 0) {
        event.target.value = '';
        event.target.dispatchEvent(new Event('input')); // Update v-model
    } else {
        event.target.select();
    }
};

const addItem = () => {
    items.value.push({ description: '', price: 0, quantity: 1 });
};
const removeItem = (index) => {
    items.value.splice(index, 1);
};

const subtotal = computed(() => items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0));
const totalAmount = computed(() => {
    let d = 0;
    if (discountType.value === 'amount') d = discount.value;
    else d = subtotal.value * (discount.value / 100);
    return Math.max(0, subtotal.value - d);
});

const formatCurrency = (val) => `${currencySymbol.value} ${Number(val).toFixed(2)}`;

const editQuoteId = route.query.quoteId;

const saveQuote = async () => {
    // Validation
    const invalidItem = items.value.find(i => !i.description || !i.description.trim() || i.price <= 0);
    if (items.value.length === 0) {
        store.dispatch('showToast', { message: 'Please add at least one item', type: 'error' });
        return;
    }
    if (invalidItem) {
        store.dispatch('showToast', { message: 'All items must have a description and price greater than 0', type: 'error' });
        return;
    }

    const quoteData = {
        id: editQuoteId, // Include ID if editing
        leadId: currentLead.value?.id || leadId,
        title: quoteTitle.value || 'New Quote',
        status: status.value,
        items: items.value.map(i => ({...i})), // Deep copy items
        subtotal: subtotal.value,
        discount: discount.value,
        discountType: discountType.value,
        amount: totalAmount.value, 
        total: totalAmount.value, 
        comment: comment.value,
        currency: currencySymbol.value
    };
    
    // Store draft and navigate to preview
    store.commit('SET_DRAFT_QUOTE', quoteData);
    router.push({ name: 'quote-preview', params: { quoteId: 'draft' } });
};

onMounted(async () => {
    if (!currentLead.value) await store.dispatch('fetchLeads');
    
    // If editing, load data
    if (editQuoteId) {
        // Ensure quotes for this lead are loaded
        if (store.state.quotes.length === 0) {
             await store.dispatch('fetchQuotes', leadId);
        }
        
        const quote = store.state.quotes.find(q => q.id === editQuoteId);
        if (quote) {
            quoteTitle.value = quote.title;
            status.value = quote.status;
            items.value = quote.items ? JSON.parse(JSON.stringify(quote.items)) : [];
            discount.value = quote.discount || 0;
            discountType.value = quote.discountType || 'amount';
            comment.value = quote.comment || '';
        }
    }
});
</script>

<style scoped>
.create-quote-page {
    background: #fdfdfd;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Roboto', sans-serif;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.close-icon {
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
}

.x-icon {
    font-size: 1.2rem;
    color: #fff;
    background: #000080;
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
}

.header-title {
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
}

.header-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem;
    font-weight: bold;
}

.right-icons {
    display: flex;
    align-items: center;
    gap: 15px;
}
.header-action {
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
}

.form-content {
    padding: 25px 20px;
    flex: 1;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
}

.input-group {
    margin-bottom: 30px;
}

.input-field {
    width: 100%;
    border: none;
    border-bottom: 2px solid #6200ea;
    padding: 10px 0;
    font-size: 1.2rem;
    outline: none;
    background: transparent;
    color: #333;
}
.input-field::placeholder { color: #aaa; }

.floating-label {
    color: #777;
    font-size: 0.85rem;
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
}

.client-name-display {
    font-size: 1.1rem;
    color: #333;
    padding: 5px 0 10px 0;
    border-bottom: 1px solid #e0e0e0;
}

.static-input-line { display: none; }

/* Dropdown */
.dropdown .select-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    position: relative;
    border-bottom: 1px solid #e0e0e0;
}
.hidden-select {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    opacity: 0;
    cursor: pointer;
}
.selected-value {
    font-size: 1.1rem;
    color: #333;
}

/* Items List */
.items-list {
    margin-top: 10px;
}
.items-header-row {
    display: flex;
    padding-bottom: 10px;
    border-bottom: 2px solid #eee;
    margin-bottom: 15px;
    font-size: 0.85rem;
    color: #888;
    font-weight: 500;
}
.ih-desc { flex: 3; }
.ih-qty { flex: 1; text-align: center; }
.ih-price { flex: 1.5; text-align: right; }
.ih-total { flex: 1.5; text-align: right; padding-right: 30px; }

.item-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    background: #fff;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.input-wrapper {
    border-bottom: 1px solid #ddd;
    padding-bottom: 2px;
}
.input-wrapper.desc { flex: 3; }
.input-wrapper.qty { flex: 1; }
.input-wrapper.price { flex: 1.5; }

.clean-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 1rem;
    padding: 5px 0;
    color: #333;
    background: transparent;
}
.clean-input.center { text-align: center; }
.clean-input.right { text-align: right; }

.item-total {
    flex: 1.5;
    text-align: right;
    font-size: 1rem;
    color: #333;
    font-weight: 500;
}

.remove-btn {
    background: none; border: none; color: #ff5252;
    font-size: 1.5rem; line-height: 1;
    cursor: pointer;
    padding: 0 5px;
}
.add-btn {
    background: none; border: none;
    font-size: 1rem; color: #6200ea;
    margin-top: 10px; cursor: pointer;
    font-weight: 500;
}

/* Totals */
.totals-section {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}
.totals-section h3 {
    font-size: 1.2rem;
    margin-bottom: 20px;
}
.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: #555;
}
.summary-row.total {
    margin-top: 25px;
    font-weight: bold;
    color: #000;
    font-size: 1.3rem;
    border-top: 2px solid #eee;
    padding-top: 15px;
}

.discount-control {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 6px;
    padding: 5px;
}
.currency-selector {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 4px;
    padding: 4px 8px;
    margin-right: 8px;
    font-size: 0.9rem;
    position: relative;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.discount-input {
    border: none;
    outline: none;
    width: 60px;
    text-align: right;
    background: transparent;
    font-size: 1.1rem;
}

/* Footer & Bottom Action */
.footer-comment { margin-top: 40px; margin-bottom: 80px; }

.bottom-action {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    padding: 20px;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #6200ea;
    font-weight: 600;
    font-size: 1.2rem;
    cursor: pointer;
    border-top: 1px solid #eee;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}
.send-icon {
    font-size: 1.4rem;
    margin-right: 12px;
    transform: rotate(-45deg);
}
</style>
