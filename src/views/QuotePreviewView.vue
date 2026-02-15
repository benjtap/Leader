<template>
  <div class="quote-preview-page">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="back-icon" @click="$router.back()">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
         </svg>
      </div>
      <div class="title">{{ quoteTitle }}</div>
      <div class="actions">
         <span class="settings-icon">⚙️</span>
         <span class="dots-icon" @click.stop="toggleMenu">⋮</span>
      </div>
    </div>

    <!-- Document Preview -->
    <div class="document-container">
        <!-- Header Strip -->
        <div class="doc-header">
            {{ quoteTitle }}
        </div>

        <div class="doc-body">
            <div class="to-section">
                <span class="label">To: </span>
                <span class="value">{{ leadName }}</span>
            </div>

            <!-- Items Table -->
            <div class="items-table">
                <div class="table-header">
                    <div class="col index">#</div>
                    <div class="col desc">Description</div>
                    <div class="col qty">Qty</div>
                    <div class="col price">Unit Price:</div>
                    <div class="col amount">Amount</div>
                </div>

                <div v-for="(item, index) in items" :key="index" class="table-row">
                    <div class="col index">{{ index + 1 }}</div>
                    <div class="col desc">{{ item.description }}</div>
                    <div class="col qty">{{ item.quantity }}</div>
                    <div class="col price">{{ formatCurrency(item.price) }}</div>
                    <div class="col amount">{{ formatCurrency(item.price * item.quantity) }}</div>
                </div>
            </div>

            <!-- Total -->
             <div class="total-row">
                <span class="total-label">Total</span>
                <span class="total-amount">{{ formatCurrency(totalAmount) }}</span>
            </div>

            <!-- Dates -->
             <div class="dates-section">
                <div class="date-row">
                    <span class="date-label">Date:</span>
                    <span class="date-value">{{ formatDate(currentDate) }}</span>
                </div>
                <div class="date-row">
                    <span class="date-label">Valid until:</span>
                    <span class="date-value">{{ getValidityDate(currentDate) }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Action Buttons -->
    <div class="bottom-bar" v-if="isDraft">
        <div class="btn-text" @click="saveAndFinish">Save & Finish</div>
        <button class="btn-primary" @click="saveAndSend">Save & Send</button>
    </div>
    <div class="bottom-bar" v-else>
         <!-- View Only / Sent Actions -->
         <button class="btn-primary full" @click="shareQuote">Share</button>
    </div>

    <!-- Menu Actions -->
    <div v-if="showMenu" class="dropdown-menu">
        <div class="menu-item" @click="handleAction('edit')">
            <span class="icon">✎</span> Edit Quote
        </div>
        <div class="menu-item" @click="handleAction('duplicate')">
            <span class="icon">❐</span> Duplicate Quote
        </div>
        <div class="menu-item delete" @click="handleAction('delete')">
            <span class="icon">🗑</span> Delete Quote
        </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const store = useStore();

const quoteId = route.params.quoteId;
const isDraft = quoteId === 'draft';
const showMenu = ref(false);

// Quote Data Source
const quoteData = computed(() => {
    if (isDraft) {
        return store.state.draftQuote;
    }
    return store.state.quotes.find(q => q.id === quoteId);
});

// Computed Properties
const quoteTitle = computed(() => quoteData.value?.title || 'Quote');
const items = computed(() => quoteData.value?.items || []);
const totalAmount = computed(() => quoteData.value?.amount || quoteData.value?.total || 0);
const currentDate = computed(() => quoteData.value?.createdAt || new Date());
const currencySymbol = computed(() => quoteData.value?.currency || '$');

const currentLead = computed(() => {
    const lid = quoteData.value?.leadId;
    if (!lid) return null;
    return store.getters.allLeads.find(l => l.id === lid || l.phone === lid);
});

const leadName = computed(() => currentLead.value?.name || currentLead.value?.phone || 'Unknown Client');

// Formatters
const formatCurrency = (val) => {
    return `${currencySymbol.value} ${Number(val).toFixed(2)}`;
};

const formatDate = (dateInput) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getValidityDate = (dateInput) => {
    const d = new Date(dateInput);
    const validity = store.getters.quoteSettings.validityDays || 30;
    d.setDate(d.getDate() + validity);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Actions
const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};

const handleAction = async (action) => {
    showMenu.value = false;
    if (!quoteData.value) return;

    if (action === 'edit') {
        const lid = quoteData.value.leadId;
        router.push({ 
            name: 'create-quote', 
            params: { leadId: lid }, 
            query: { quoteId: quoteData.value.id } 
        });
    } else if (action === 'duplicate') {
        const copy = { 
            ...quoteData.value, 
            id: null, // Clear ID to create new
            title: `${quoteData.value.title} (Copy)`,
            createdAt: new Date(),
            status: 'Draft'
        };
        try {
            await store.dispatch('createQuote', copy);
            store.dispatch('showToast', { message: 'Quote duplicated', type: 'success' });
        } catch (e) {
            store.dispatch('showToast', { message: 'Failed to duplicate', type: 'error' });
        }
    } else if (action === 'delete') {
        if (confirm("Are you sure you want to delete this quote?")) {
            try {
                await store.dispatch('deleteQuote', { id: quoteData.value.id, leadId: quoteData.value.leadId });
                store.dispatch('showToast', { message: 'Quote deleted', type: 'success' });
                router.back();
            } catch (e) {
                store.dispatch('showToast', { message: 'Failed to delete', type: 'error' });
            }
        }
    }
};

const finalizeQuote = async (status) => {
    if (!quoteData.value) return;

    const finalData = {
        ...quoteData.value,
        status: status,
        createdAt: new Date()
    };

    try {
        if (finalData.id && finalData.id !== 'draft') {
            await store.dispatch('updateQuote', { id: finalData.id, quote: finalData });
            store.dispatch('showToast', { message: 'Quote updated', type: 'success' });
        } else {
            await store.dispatch('createQuote', finalData);
            store.dispatch('showToast', { message: `Quote ${status === 'Sent' ? 'sent' : 'saved'} successfully!`, type: 'success' });
        }
        
        // Move Item Logic (Handling Lead Status Change)
        if (currentLead.value) {
             const steps = store.getters.allWorkflowSteps;
             const quoteStep = steps.find(s => 
                s.type.toLowerCase().includes('quote') || 
                s.name.includes('הצעת מחיר')
             );
             
             const targetType = quoteStep ? quoteStep.type : 'quote';
             
             const currentUser = store.getters.currentUser;
             const isAssigned = currentLead.value.assignedTo && currentLead.value.assignedTo.length > 0;
             const targetUserId = !isAssigned && currentUser ? currentUser.id : null;

             if (currentLead.value.listType !== targetType || targetUserId) {
                 await store.dispatch('moveItem', {
                    item: currentLead.value,
                    target: targetType,
                    targetUserId: targetUserId
                });
            }
        }

        // Clear draft & Navigate
        store.commit('SET_DRAFT_QUOTE', null);
        
        if (isDraft) {
            router.go(-2); 
        } else {
             router.back();
        }

    } catch (e) {
        console.error("Failed to finalize quote", e);
        store.dispatch('showToast', { message: 'Failed to save quote', type: 'error' });
    }
};

const saveAndFinish = () => finalizeQuote('Draft'); // Or 'Saved'
const saveAndSend = () => finalizeQuote('Sent');

const shareQuote = () => {
    // Logic to share existing quote
    console.log("Sharing quote...");
    // Native share logic could go here
};

onMounted(() => {
    if (!quoteData.value) {
        // If no data (refresh on draft page?), redirect back
        if (isDraft) {
            router.back();
        } else {
            // Fetch quotes if missing?
             const lid = currentLead.value?.id; 
             // Can't get lid if quoteData missing. 
             // Maybe fetch all quotes? Or redirect.
             // If navigating directly to /quote/:id, we might need to fetch.
             // But we don't have leadId in URL here easily unless we fetch all.
        }
    }
});

</script>

<style scoped>
.quote-preview-page {
    background-color: #f5f5f5;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Roboto', sans-serif;
}

.top-bar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  z-index: 10;
}

.back-icon { margin-right: 20px; cursor: pointer; color: #333; }
.title { flex: 1; font-size: 1.1rem; font-weight: 500; color: #000; }
.actions { display: flex; gap: 15px; color: #555; cursor: pointer; align-items: center; position: relative; }

/* Menu Styles */
.dropdown-menu {
    position: absolute;
    top: 50px;
    right: 10px;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-radius: 8px;
    z-index: 100;
    min-width: 180px;
    overflow: hidden;
}
.menu-item {
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.95rem;
    color: #333;
    cursor: pointer;
    transition: background 0.2s;
}
.menu-item:hover { background: #f5f5f5; }
.menu-item .icon { width: 20px; text-align: center; color: #6200ea; font-size: 1.1rem; }
.menu-item.delete { color: #d32f2f; }
.menu-item.delete .icon { color: #d32f2f; }

.document-container {
    margin: 20px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    flex: 1;
    display: flex;
    flex-direction: column;
}

.doc-header {
    background: #e0e0e0;
    padding: 10px 15px;
    font-weight: bold;
    font-size: 0.9rem;
    color: #333;
    text-align: center;
}

.doc-body { padding: 20px; }

.to-section { margin-bottom: 25px; font-size: 0.9rem; }
.to-section .label { font-weight: bold; }

.items-table { border-top: 2px solid #eee; margin-bottom: 20px; }
.table-header {
    display: flex; font-weight: bold; font-size: 0.75rem; color: #333;
    padding: 10px 0; border-bottom: 1px solid #333;
}
.table-row {
     display: flex; padding: 10px 0; border-bottom: 1px solid #eee;
     font-size: 0.8rem; color: #555;
}

.col { padding: 0 5px; }
.col.index { width: 30px; }
.col.desc { flex: 2; }
.col.qty { width: 40px; text-align: center; }
.col.price { flex: 1; text-align: right; }
.col.amount { flex: 1; text-align: right; font-weight: 500; }

.total-row {
    display: flex; justify-content: flex-end; align-items: center;
    gap: 20px; margin-top: 10px; font-weight: bold; font-size: 0.9rem;
}
.total-label { color: #333; }
.total-amount { font-size: 1rem; }

.dates-section {
    margin-top: 40px; font-size: 0.8rem; font-weight: bold; color: #333;
}
.date-row { margin-bottom: 5px; }

/* Bottom Bar */
.bottom-bar {
    padding: 15px 20px;
    background: white;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.btn-text {
    color: #6200ea;
    font-weight: 500;
    cursor: pointer;
    font-size: 1rem;
    padding: 10px;
}

.btn-primary {
    background: #6200ea;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 25px; /* Rounded pill shape */
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    flex: 1;
    max-width: 200px;
    box-shadow: 0 2px 5px rgba(98, 0, 234, 0.3);
}
.btn-primary.full { width: 100%; max-width: none; }

</style>
