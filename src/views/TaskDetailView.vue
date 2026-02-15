<template>
  <div class="task-detail-page">
    
    <!-- MAIN TASK VIEW -->
    <div v-if="!showNoteEditor" class="main-view">
        <div class="header">
            <div class="action-icon" @click="$router.back()">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </div>
            <div class="title">{{ pageTitle }}</div>
            <div class="action-icon" @click="saveTask">
                 <!-- Checkmark icon for save -->
                 <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        </div>

        <div class="task-form" v-if="!loading">
            <!-- Title Input -->
            <div class="input-row border-bottom">
                 <!-- Circle Icon (checkbox placeholder) -->
                 <div class="circle-icon" @click="toggleComplete">
                    <svg v-if="isCompleted" viewBox="0 0 24 24" width="24" height="24" fill="#6200ea" stroke="none"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 6-6" stroke="white" stroke-width="2" fill="none"></path></svg>
                    <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6200ea" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
                 </div>

                <input v-model="taskTitle" placeholder="Task name" class="task-input main" />
                 <span class="icon-btn star" @click="isStarred = !isStarred" :class="{ active: isStarred }">
                    <svg viewBox="0 0 24 24" width="24" height="24" :fill="isStarred ? '#6200ea' : 'none'" stroke="#6200ea" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                 </span>
            </div>

            <!-- Assignees List -->
            <div v-for="(assignee, index) in assignees" :key="index" class="input-row border-bottom">
                 <div class="avatar-circle" :style="{ backgroundColor: assignee.color || '#6200ea' }">{{ assignee.initial }}</div>
                 <span class="row-text flex-1">{{ assignee.name }}</span>
                 <span class="icon-btn close" @click="removeAssignee(index)">✕</span>
            </div>

            <!-- Reminder Row -->
            <div v-if="reminder" class="input-row border-bottom">
                <span class="icon purple">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </span>
                <span class="row-text flex-1 purple-text">{{ formatReminderText(reminder) }}</span>
                <span class="icon-btn close" @click="reminder = null">✕</span>
            </div>

            <!-- Due Date Row -->
            <div v-if="dueDate" class="input-row border-bottom">
                <span class="icon purple">
                     <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </span>
                <span class="row-text flex-1 purple-text">{{ formatDueDateText(dueDate) }}</span>
                <span class="icon-btn close" @click="dueDate = null">✕</span>
            </div>

            <!-- Note Row / Input -->
            <div class="input-row border-bottom" @click="openNoteEditor">
                <span class="icon purple">
                     <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </span>
                <span v-if="taskNote" class="row-text flex-1">
                    {{ taskNote }}
                    <span class="note-time">Edited {{ noteTime || 'now' }}</span>
                </span>
                <input v-else placeholder="Add note" class="task-input sub" readonly />
                 <span v-if="taskNote" class="icon-btn close" @click.stop="taskNote = ''">✕</span>
            </div>

            <!-- Tools / Actions to Add -->
             <div class="tools-row">
                 <div class="tool-btn" @click="openReminderPicker" v-if="!reminder">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    Reminder
                 </div>
                 <div class="tool-btn" @click="openDateTimePicker" v-if="!dueDate">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Due Date
                 </div>
             </div>
        </div>
        <div v-else class="loading-state">
            Loading task...
        </div>
    </div>

    <!-- NOTE EDITOR VIEW -->
    <div v-else class="note-view">
        <div class="header">
            <div class="action-icon" @click="showNoteEditor = false">
                 <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                 </svg>
            </div>
            <div class="title">Note</div>
            <div class="action-icon" @click="saveNote">
                 <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        </div>
        <div class="note-editor">
            <textarea v-model="tempNote" placeholder="Type your note..." class="note-textarea"></textarea>
        </div>
    </div>

    
    <!-- Date/Reminder Picker Sheet -->
    <Teleport to="body">
        <div v-if="showPickerSheet" class="sheet-overlay" @click="showPickerSheet = false">
            <div class="sheet-content" @click.stop>
                 <div class="sheet-option" @click="setDateOption('today')">
                    Today ({{ getDayName(0) }})
                 </div>
                 <div class="sheet-option" @click="setDateOption('tomorrow')">
                    Tomorrow ({{ getDayName(1) }})
                 </div>
                 <div class="sheet-option" @click="setDateOption('next_week')">
                    Next week ({{ getDayName(7) }})
                 </div>
                 <div class="sheet-option pick-custom" @click="openNativePicker">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Pick a date & time
                 </div>
            </div>
        </div>
    </Teleport>
    
    <input type="datetime-local" ref="dateInput" style="display:none" @change="onNativeDateSelected" />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { LocalNotifications } from '@capacitor/local-notifications';

const route = useRoute();
const router = useRouter();
const store = useStore();

// State
const loading = ref(true);
const taskId = route.params.taskId;
const activity = ref(null);

const showNoteEditor = ref(false);
const isStarred = ref(false);
const isCompleted = ref(false);
const taskTitle = ref('');
const taskNote = ref('');
const tempNote = ref('');
const noteTime = ref('');
const reminder = ref(null);
const dueDate = ref(null);
const assignees = ref([]);

// UI State
const showPickerSheet = ref(false);
const pickerMode = ref(null); // 'reminder' or 'duedate'
const dateInput = ref(null);

const pageTitle = computed(() => 'Task Details'); // Or taskTitle.value

onMounted(async () => {
    await fetchTask();
    
    // Request Notification Permissions
    try {
        await LocalNotifications.requestPermissions();
    } catch (e) {
        console.warn("LocalNotifications permission denied", e);
    }
});

const fetchTask = async () => {
    loading.value = true;
    try {
        // Find activity in store
        // Ensure activities are fetched
        if (!store.getters.allActivities.length) {
             await store.dispatch('fetchActivities');
        }
        
        const all = store.getters.allActivities;
        // Search by ID (string or number comparison)
        const found = all.find(a => String(a.id) === String(taskId));
        
        if (found) {
            activity.value = found;
            taskTitle.value = found.name || '';
            taskNote.value = found.description || '';
            isStarred.value = found.isStarred || false;
            isCompleted.value = found.status === 'completed'; // Assuming status field exists? Or check type?
            
            if (found.reminder) reminder.value = new Date(found.reminder);
            if (found.dueDate || found.date) dueDate.value = new Date(found.dueDate || found.date);
            
            // Note Time: Mock relative time for now if not stored
            noteTime.value = '1 hour ago'; // Dynamic calculation removed for brevity
            
            // Assignee from number/Lead
            if (found.number) {
                 const lead = store.getters.allLeads.find(l => l.phone === found.number || l.id === found.number);
                 if (lead) {
                     assignees.value = [{
                         name: lead.name || found.number,
                         initial: (lead.name || 'U').charAt(0).toUpperCase(),
                         color: lead.color || '#6200ea'
                     }];
                 } else {
                     // If number exists but no lead, might be raw number
                     assignees.value = [{
                         name: found.number,
                         initial: '#',
                         color: '#666'
                     }];
                 }
            }
        } else {
            // Task not found
            store.dispatch('showToast', { message: 'Task not found', type: 'error' });
            router.back();
        }
    } catch (e) {
        console.error("Error fetching task", e);
    } finally {
        loading.value = false;
    }
};

// Note Logic
const openNoteEditor = () => {
    tempNote.value = taskNote.value;
    showNoteEditor.value = true;
};

const saveNote = () => {
    taskNote.value = tempNote.value;
    showNoteEditor.value = false;
};

const toggleComplete = () => {
    isCompleted.value = !isCompleted.value;
    saveTask(true); // Auto-save on complete?
};

// Picker Logic
const openReminderPicker = () => {
    pickerMode.value = 'reminder';
    showPickerSheet.value = true;
};

const openDateTimePicker = () => {
    pickerMode.value = 'duedate';
    showPickerSheet.value = true;
};

const getDayName = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
};

const setDateOption = (type) => {
    const now = new Date();
    let rDate = new Date();
    rDate.setSeconds(0);
    
    if (type === 'today') {
        // If today, set to later today or default 09:00? 
        // Image implies "Today" is an option. Usually +1 hour or set time.
        // Let's defaut to later today 18:00 or next hour.
        // But user asked "Today, 09:00" in prompt text? No, image text says "Reminder Today, 09:00".
        // Let's stick to simple logic: logic relative to now or just set date part.
        
        // If it's already past 9am, set to +1 hour?
        rDate.setHours(9, 0, 0, 0);
        if (rDate < now) {
           rDate = new Date();
           rDate.setHours(now.getHours() + 1, 0, 0, 0);
        }
    } else if (type === 'tomorrow') {
        rDate.setDate(rDate.getDate() + 1);
        rDate.setHours(9, 0, 0, 0);
    } else if (type === 'next_week') {
        rDate.setDate(rDate.getDate() + 7);
        rDate.setHours(9, 0, 0, 0);
    }
    
    // Apply to field
    if (pickerMode.value === 'reminder') {
        reminder.value = rDate;
    } else {
        dueDate.value = rDate;
    }
    showPickerSheet.value = false;
};

const openNativePicker = () => {
    showPickerSheet.value = false;
    if (dateInput.value) {
        dateInput.value.showPicker ? dateInput.value.showPicker() : dateInput.value.click();
    }
};

const onNativeDateSelected = (e) => {
    if (e.target.value) {
        const d = new Date(e.target.value);
        if (pickerMode.value === 'reminder') {
            reminder.value = d;
        } else {
            dueDate.value = d;
        }
    }
};

const formatReminderText = (date) => {
    if (!date) return '';
    const day = date.toDateString() === new Date().toDateString() ? 'Today' : date.toLocaleDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${time}`;
};

const formatDueDateText = (date) => {
    if (!date) return '';
    const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return `Due ${date.toLocaleDateString('en-US', opts)}`;
};

const removeAssignee = (idx) => {
    assignees.value.splice(idx, 1);
};


const saveTask = async (silent = false) => {
    if (!taskTitle.value.trim()) return;

    const updated = {
        ...activity.value,
        name: taskTitle.value,
        description: taskNote.value,
        isStarred: isStarred.value,
        status: isCompleted.value ? 'completed' : 'pending',
        reminder: reminder.value ? reminder.value.toISOString() : null,
        dueDate: dueDate.value ? dueDate.value.toISOString() : null,
        // Update display date/time to match due date if set
        date: dueDate.value || reminder.value || new Date(),
        time: (dueDate.value || reminder.value || new Date()).toLocaleTimeString()
    };

    try {
        // Dispatch store action (which calls service.updateActivity)
        // I need to add 'updateActivity' to store. Wait, I plan to add it.
        // If not added yet, I can call service directly or make store update activity in array.
        // Assuming store action 'updateActivity' exists now.
        
        await store.dispatch('updateActivity', { id: taskId, activity: updated });

        // Schedule Notification if reminder updated
        if (reminder.value) {
             const notifId = parseInt(String(taskId).replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 100000);
             try {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: taskTitle.value,
                            body: taskNote.value || `Reminder for Task`,
                            id: notifId,
                            schedule: { at: reminder.value },
                            sound: null,
                            attachments: null,
                            actionTypeId: "",
                            extra: null
                        }
                    ]
                });
             } catch(err) { console.error(err); }
        }

        if (!silent) {
            store.dispatch('showToast', { message: 'Task updated', type: 'success' });
            router.back();
        }
    } catch (e) {
        console.error("Update error", e);
        store.dispatch('showToast', { message: 'Failed to update task', type: 'error' });
    }
};
</script>

<style scoped>
.task-detail-page {
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
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

.action-icon {
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
}

.task-form, .note-view {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.input-row {
    display: flex;
    align-items: center;
    padding: 15px 0;
    gap: 15px;
    position: relative;
    min-height: 56px;
}
.input-row.border-bottom {
    border-bottom: 1px solid #f5f5f5;
}

.circle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.task-input {
    border: none;
    outline: none;
    font-size: 1.1rem;
    flex: 1;
    color: #333;
    font-family: inherit;
}
.task-input.main {
    font-size: 1.3rem;
}

.icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
}
.icon.purple {
    color: #6200ea;
}

.icon-btn {
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
}
.icon-btn.star {
    margin-left: auto;
}
.icon-btn.close {
    color: #6200ea;
    font-size: 1.2rem;
    margin-left: auto;
    padding: 5px;
}

.avatar-circle {
    width: 32px; height: 32px;
    border-radius: 50%;
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: bold;
    font-size: 0.9rem;
}

.purple-text {
    color: #6200ea;
}
.row-text {
    font-size: 1rem;
    color: #6200ea;
}
.row-text.flex-1 {
    flex: 1;
}

.note-time {
    color: #ccc;
    font-size: 0.8rem;
    margin-left: 10px;
}

.tools-row {
    margin-top: 20px;
    display: flex;
    gap: 15px;
}
.tool-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 20px;
    color: #666;
    font-size: 0.9rem;
    cursor: pointer;
}

/* Note Editor */
.note-editor {
    flex: 1;
    display: flex;
}
.note-textarea {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1.1rem;
    resize: none;
    font-family: inherit;
    padding-top: 20px;
}

/* Sheets */
.sheet-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    display: flex;
    align-items: flex-end; /* Show at bottom like sheet */
    justify-content: center;
}
.sheet-content {
    background: white;
    width: 100%;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    padding: 10px 0;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    padding-bottom: 20px; /* Safe area */
}
.sheet-option {
    padding: 15px 20px;
    font-size: 1rem;
    color: #333;
    cursor: pointer;
    border-bottom: 1px solid #f9f9f9;
}
.sheet-option:hover {
    background: #f5f5f5;
}
.sheet-option.pick-custom {
    color: #333; /* Or specific color if needed */
    display: flex;
    align-items: center;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: #999;
}
</style>
