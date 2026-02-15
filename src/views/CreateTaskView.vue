<template>
  <div class="create-task-page">
    
    <!-- MAIN TASK VIEW -->
    <div v-if="!showNoteEditor" class="main-view">
        <div class="header">
            <div class="action-icon" @click="$router.back()">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </div>
            <div class="title">Create new task</div>
            <div class="action-icon" @click="saveTask">
                 <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        </div>

        <div class="task-form">
            <!-- Title Input -->
            <div class="input-row border-bottom">
                <input v-model="taskTitle" placeholder="Add task" class="task-input main" autofocus />
                 <span class="icon-btn star" @click="isStarred = !isStarred" :class="{ active: isStarred }">
                    <svg viewBox="0 0 24 24" width="24" height="24" :fill="isStarred ? '#6200ea' : 'none'" stroke="#6200ea" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                 </span>
            </div>

            <!-- Assignees List -->
            <div v-for="(assignee, index) in assignees" :key="index" class="input-row border-bottom">
                 <div class="avatar-circle" :style="{ backgroundColor: assignee.color }">{{ assignee.initial }}</div>
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
                    <span class="note-time">now</span>
                </span>
                <input v-else placeholder="Add note" class="task-input sub" readonly />
                 <span v-if="taskNote" class="icon-btn close" @click.stop="taskNote = ''">✕</span>
            </div>

            <!-- Tools / Actions to Add (Hidden by default or shown?) -->
            <!-- The image implies distinct rows appear when added. Use mock defaults for now or hidden tools -->
             <div class="tools-row">
                 <div class="tool-btn" @click="openReminderPicker" v-if="!reminder">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    Reminder
                 </div>
                 <div class="tool-btn" @click="openDatePicker" v-if="!dueDate">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Due Date
                 </div>
             </div>
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
        <div v-if="showReminderSheet" class="sheet-overlay" @click="showReminderSheet = false">
            <div class="sheet-content" @click.stop>
                 <div class="sheet-option" @click="setReminder('today')">
                    Today ({{ getDayName(0) }})
                 </div>
                 <div class="sheet-option" @click="setReminder('tomorrow')">
                    Tomorrow ({{ getDayName(1) }})
                 </div>
                 <div class="sheet-option" @click="setReminder('next_week')">
                    Next week ({{ getDayName(7) }})
                 </div>
                 <div class="sheet-option pick-custom" @click="openNativePicker">
                    Pick a date & time
                 </div>
            </div>
        </div>
    </Teleport>
    
    <input type="datetime-local" ref="dateInput" style="display:none" @change="onDateSelected" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { LocalNotifications } from '@capacitor/local-notifications';

const route = useRoute();
const router = useRouter();
const store = useStore();

// State
const showNoteEditor = ref(false);
const isStarred = ref(false);
const taskTitle = ref('');
const taskNote = ref('');
const tempNote = ref('');
const reminder = ref(null);
const dueDate = ref(null);
const assignees = ref([]);

// UI State
const showReminderSheet = ref(false);
const dateInput = ref(null);
const pickerMode = ref('reminder'); // Track if setting reminder or due date

const leadId = route.params.leadId;

onMounted(async () => {
    // Mock Assignee: Assigned to current user or lead
    // For now, let's just add the current lead as assignee if it acts like a person
    const lead = store.getters.allLeads.find(l => l.id === leadId || l.phone === leadId);
    if (lead) {
        assignees.value.push({
            name: lead.name || 'Unknown',
            initial: (lead.name || 'U').charAt(0).toUpperCase(),
            color: lead.color || '#6200ea'
        });
    }
    
    // Request Notification Permissions
    try {
        await LocalNotifications.requestPermissions();
    } catch (e) {
        console.warn("LocalNotifications not available or permission denied", e);
    }
});

const getDayName = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
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

// Reminder Logic
const openReminderPicker = () => {
    pickerMode.value = 'reminder';
    showReminderSheet.value = true;
};

// Due Date Logic
const openDatePicker = () => {
    pickerMode.value = 'duedate';
    showReminderSheet.value = true;
};

const setReminder = (type) => {
    const now = new Date();
    let rDate = new Date();
    rDate.setSeconds(0);
    
    if (type === 'today') {
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
    
    if (pickerMode.value === 'reminder') {
        reminder.value = rDate;
    } else {
        dueDate.value = rDate;
    }
    showReminderSheet.value = false;
};

const openNativePicker = () => {
    showReminderSheet.value = false;
    if (dateInput.value) {
        dateInput.value.showPicker ? dateInput.value.showPicker() : dateInput.value.click();
    }
};

const onDateSelected = (e) => {
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
    // Simple format: Today, 09:00
    if (!date) return '';
    const day = date.toDateString() === new Date().toDateString() ? 'Today' : date.toLocaleDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${time}`;
};

const formatDueDateText = (date) => {
    if (!date) return '';
    // Format: Due Sun, Feb 22, 02:10
    const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return `Due ${date.toLocaleDateString('en-US', opts)}`;
};

const removeAssignee = (idx) => {
    assignees.value.splice(idx, 1);
};


const saveTask = async () => {
    if (!taskTitle.value.trim()) return;

    // Resolve Lead
    const lead = store.getters.allLeads.find(l => l.id === leadId || l.phone === leadId);

    const activity = {
        userId: store.getters.currentUser?.id,
        number: lead ? (lead.phone || leadId) : leadId,
        type: 'task',
        name: taskTitle.value, // Used as title
        initial: 'T',
        color: '#ff9800',
        timestamp: Date.now(),
        date: dueDate.value || reminder.value || new Date(),
        time: (dueDate.value || reminder.value || new Date()).toLocaleTimeString(),
        duration: 0,
        isIcon: true,
        isStarred: isStarred.value,
        description: taskNote.value, // Note content
        reminder: reminder.value ? reminder.value.toISOString() : null,
        dueDate: dueDate.value ? dueDate.value.toISOString() : null
    };

    try {
        const res = await store.dispatch('createActivity', activity);
        
        // Schedule Notification if reminder set
        if (reminder.value) {
             try {
                // Ensure ID is integer for LocalNotifications
                const notifId = Math.floor(Math.random() * 100000);
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: taskTitle.value,
                            body: taskNote.value || `Reminder for ${lead?.name || 'Lead'}`,
                            id: notifId,
                            schedule: { at: reminder.value },
                            sound: null,
                            attachments: null,
                            actionTypeId: "",
                            extra: null
                        }
                    ]
                });
            } catch (notifError) {
                console.error("Failed to schedule notification", notifError);
            }
        }

        store.dispatch('showToast', { message: 'Task saved', type: 'success' });
        router.back();
    } catch (e) {
        console.error("Save error", e);
        store.dispatch('showToast', { message: 'Failed to save task', type: 'error' });
    }
};
</script>

<style scoped>
.create-task-page {
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

.task-input {
    border: none;
    outline: none;
    font-size: 1.1rem;
    flex: 1;
    color: #333;
    font-family: inherit;
}
.task-input.main {
    font-size: 1.3rem; /* "Add task" is slightly larger */
    color: #999; /* Placeholder look initially? No, typed text is dark */
}
.task-input.main::placeholder {
    color: #ccc;
    font-size: 1.3rem;
}
.task-input.sub::placeholder {
    color: #ccc;
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

/* Sheets - Updated to Bottom Sheet Style */
.sheet-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    display: flex;
    align-items: flex-end; /* Show at bottom */
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
    color: #333; 
}
</style>
