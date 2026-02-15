<template>
  <div class="create-note-page">
    <div class="header">
      <div class="action-icon left" @click="saveNote">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="title">Note</div>
      <div class="action-icon right" @click="$router.back()">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
         </svg>
      </div>
    </div>
    
    <div class="note-content">
      <textarea 
        v-model="noteText" 
        placeholder="Start typing your note..." 
        class="note-textarea"
        autofocus
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const store = useStore();

const noteText = ref('');
const leadId = route.params.leadId;
const noteId = route.query.noteId;
const existingActivity = ref(null);

// Load existing note if editing
if (noteId) {
    const act = store.getters.allActivities.find(a => String(a.id) === String(noteId));
    if (act) {
        existingActivity.value = act;
        noteText.value = act.description || act.body || '';
    }
}

const saveNote = async () => {
    // If empty text, maybe delete or just return? 
    // Usually save if changed. If empty, maybe confirm delete?
    // Let's just return for now if empty to avoid saving empty notes.
    if (!noteText.value.trim()) {
        router.back();
        return;
    }

    try {
        if (existingActivity.value) {
            // Update
            const updated = {
                ...existingActivity.value,
                description: noteText.value,
                // Update timestamp? Typically yes for 'Last Updated'
                timestamp: Date.now(),
                date: new Date(),
                time: new Date().toLocaleTimeString()
            };
            await store.dispatch('updateActivity', { id: existingActivity.value.id, activity: updated });
            store.dispatch('showToast', { message: 'Note updated', type: 'success' });
        } else {
             // Create New
            const activity = {
                userId: store.getters.currentUser?.id, 
                number: '', 
                type: 'note',
                name: 'Note',
                initial: 'N',
                color: '#6200ea',
                timestamp: Date.now(),
                date: new Date(),
                time: new Date().toLocaleTimeString(),
                duration: 0,
                isIcon: true,
                description: noteText.value
            };

            // Find lead to get phone number
            const lead = store.getters.allLeads.find(l => l.id === leadId || l.phone === leadId);
            if (lead) {
                activity.number = lead.phone || leadId; 
                if (!activity.name) activity.name = lead.name; // Keep 'Note' as name or use lead name? Activity name is usually the title.
                // Notes usually don't have a title, just description. 
                // Let's keep name generic or lead name? 
                // Existing code had 'Note' or lead.name. 
                // If I look at create logic:
                // activity.name = lead.name passed in original code? 
                // Original: activity.name = 'Note' then overwritten by lead.name if found.
                // Let's stick to that.
                activity.name = lead.name || 'Note'; 
            } else {
                activity.number = leadId;
            }

            await store.dispatch('createActivity', activity);
            store.dispatch('showToast', { message: 'Note saved', type: 'success' });
        }
        router.back();
    } catch (e) {
        console.error(e);
        store.dispatch('showToast', { message: 'Failed to save note', type: 'error' });
    }
};
</script>

<style scoped>
.create-note-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
  font-family: 'Roboto', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.action-icon {
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
}

.note-content {
  flex: 1;
  padding: 20px;
}

.note-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-size: 1.1rem;
  resize: none;
  font-family: inherit;
  color: #333;
}

.note-textarea::placeholder {
  color: #aaa;
}
</style>
