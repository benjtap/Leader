<template>
  <div class="filtered-page">
    <div class="top-bar" :style="{ borderBottom: `3px solid ${currentLabel.color}` }">
      <div class="back-icon" @click="$router.back()">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <div class="title">{{ currentLabel.name }}</div>
      <div class="actions">
          <div class="circle-btn" @click="showAddLead = true">
             <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
      </div>
    </div>

    <!-- Stats or Filter info -->
    <div class="filter-info">
        <span>Filter by labels: {{ currentLabel.name }}</span>
    </div>

    <!-- Reuse ListComponent or simpler list -->
    <div class="leads-list">
        <div 
            v-for="lead in filteredLeads" 
            :key="lead.id" 
            class="lead-item"
            @click="openLead(lead)"
        >
            <div class="lead-left">
                <div class="lead-avatar" :style="{ backgroundColor: getAvatarColor(lead.name) }">
                    {{ getInitial(lead.name) }}
                </div>
                <div class="lead-details">
                    <span class="lead-name">{{ lead.name }}</span>
                    <div class="lead-labels">
                        <span 
                            class="label-chip" 
                            :style="{ backgroundColor: currentLabel.color, color: 'white' }"
                        >
                            {{ currentLabel.name }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="lead-right">
                <span class="count-badge">1</span> <!-- Placeholder for count -->
            </div>
        </div>

        <div v-if="filteredLeads.length === 0" class="empty-state">
            No leads with this label.
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

const store = useStore();
const route = useRoute();
const router = useRouter();

const labelId = computed(() => route.params.id);
const allLabels = computed(() => store.getters.allLabels);
const currentLabel = computed(() => allLabels.value.find(l => l.id === labelId.value) || { name: 'Label', color: '#ccc' });

const filteredLeads = computed(() => {
    return store.getters.allLeads.filter(l => l.labels && l.labels.includes(labelId.value));
});

const openLead = (lead) => {
    router.push({ name: 'lead-details', params: { id: lead.id } });
};

const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';
const getAvatarColor = (name) => {
    // ... same color logic ...
    return '#FFC107'; // placeholder
};

</script>

<style scoped>
.filtered-page {
    background: #f5f6fa;
    min-height: 100vh;
}

.top-bar {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.back-icon { margin-right: 15px; cursor: pointer; }
.title { flex: 1; font-size: 1.2rem; font-weight: 500; }

.circle-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: #6200ea;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    cursor: pointer;
}

.filter-info {
    padding: 15px;
    color: #666;
    font-size: 0.9rem;
}

.leads-list {
    padding: 0 15px;
    display: flex; flex-direction: column; gap: 10px;
}

.lead-item {
    background: white;
    padding: 12px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.lead-left { display: flex; gap: 12px; align-items: center; }
.lead-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: bold;
}
.lead-details { display: flex; flex-direction: column; }
.lead-name { font-weight: 500; font-size: 1rem; }
.label-chip {
    font-size: 0.7rem; padding: 2px 6px; border-radius: 10px;
    margin-top: 4px; display: inline-block;
}

.empty-state {
    text-align: center; padding: 30px; color: #999;
}
</style>
