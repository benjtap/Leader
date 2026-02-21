<template>
  <div class="details-page">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="back-icon" @click="$router.back()">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
         </svg>
      </div>
      <div class="title"></div>
      <div class="actions">
         <span class="edit-icon" @click="openEditLead">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
         </span>
         <div class="menu-container">
            <span class="dots-icon" @click.stop="toggleActionMenu">⋮</span>
            <div v-if="showActionMenu" class="dropdown-menu">
                <div class="menu-item" @click="handleAction('send_card')">Send business card</div>
                <div class="menu-item" @click="handleAction('move_to')">Move to</div>
                <div class="menu-item" @click="handleAction('hide_leader')">Don't show in LEADer</div>
                <div class="menu-item" @click="handleAction('delete')">Delete</div>
            </div>
         </div>
      </div>
    </div>

    <!-- Profile Header -->
    <div class="profile-header">
       <div class="profile-avatar" :style="{ backgroundColor: getAvatarColor(leadName) }">
           {{ getInitial(leadName) }}
       </div>
        <div class="profile-info">
            <h2 class="profile-name">{{ leadName }}</h2>
            <span class="profile-phone">{{ number }}</span>
            
            <div class="labels-container">
                <!-- Tags/Labels for Property -->
                 <span v-if="currentProperty && currentProperty.tags" 
                    v-for="tag in currentProperty.tags" 
                    :key="tag" 
                    class="label-chip"
                >
                    {{ tag }}
                </span>
            </div>
            
            <!-- Role Qualifier -->
            <!-- Property Address as subtitle if needed -->
             <div class="role-qualifier">
                <!-- Status Display - READ ONLY -->
                <div class="status-badge" style="background:#e0e0e0; color:#555; padding:5px 12px; border-radius:12px; display:inline-block; margin-top:5px; font-weight:500;">
                    Status: {{ currentStageName || 'Lead' }} <span style="font-size:0.8em">🔒</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
        <div class="tabs">
        <div 
            v-for="tab in tabs" 
            :key="tab" 
            class="tab-item" 
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
        >
            {{ tab }}
        </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
      
      <!-- Call Log Tab -->
      <div v-if="activeTab === 'Call Log'" class="call-log-view">
        <div class="log-header-section">
           <span class="log-title">Call Log</span>
           <span class="badge">{{ callHistory.length }}</span>
        </div>

        <div class="log-list">
          <div v-for="log in callHistory" :key="log.id" class="log-item">
             <div class="log-icon-container">
                <svg v-if="log.type === 'outgoing'" class="icon outgoing" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                     <line x1="7" y1="17" x2="17" y2="7"></line>
                     <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
                <svg v-else-if="log.type === 'incoming'" class="icon incoming" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                    <line x1="17" y1="7" x2="7" y2="17"></line>
                    <polyline points="17 17 7 17 7 7"></polyline>
                </svg>
                <svg v-else class="icon missed" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                     <line x1="7" y1="17" x2="17" y2="7"></line>
                     <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
             </div>
             
             <div class="log-details">
                <div class="log-top-row">
                    <span class="log-time">{{ log.time }}</span>
                </div>
                <div class="log-bottom-row">
                    <span v-if="log.type === 'incoming'">Incoming call</span>
                    <span v-else-if="log.type === 'outgoing'">Outgoing call</span>
                    <span v-else>Missed call</span>
                </div>
             </div>

             <div class="log-right">
                <span class="duration" v-if="log.duration">{{ formatDuration(log.duration) }}</span>
                <span class="dots-icon" @click.stop="openCallActions(log)">⋮</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Actions Sheets and Label Selection Sheet -->
      <Teleport to="body">
          <ActionsSheet 
            v-if="showCallActionsSheet" 
            mode="default"
            @close="showCallActionsSheet = false" 
            @select="handleCallAction" 
          />
          
          <ActionsSheet 
            v-if="showQuoteActionsSheet" 
            mode="quote"
            @close="showQuoteActionsSheet = false" 
            @select="handleQuoteAction" 
          />

          <div v-if="showLabelSelectSheet" class="label-sheet-overlay" @click="showLabelSelectSheet = false">
              <div class="label-sheet-content" @click.stop>
                  <h3>Select Label</h3>
                  <div class="label-options">
                      <div 
                          v-for="label in availableLabels" 
                          :key="label.id" 
                          class="label-option"
                          @click="addLabelToCurrentLead(label)"
                      >
                           <div class="label-dot" :style="{ backgroundColor: label.color }"></div>
                           <span>{{ label.name }}</span>
                      </div>
                  </div>
                   <div class="create-new-label" @click="createNewLabel">
                      <span>+ Create New Label</span>
                  </div>
              </div>
          </div>
      </Teleport>

      <!-- Details Tab -->
      <div v-if="activeTab === 'Details'" class="details-view">
        <!-- Status Card -->
        <div class="card-section no-padding">
             <div class="row-item full-width-clickable border-bottom" @click="toggleStatusDropdown">
              <span class="label">Status</span>
              <div class="value-container">
                <span class="value-text">{{ currentStageName }}</span>
                <span class="chevron">›</span>
              </div>
               <!-- Dropdown removed -->
            </div>

            <!-- Assigned To Row -->
            <div class="row-item full-width-clickable" @click="toggleAssignDropdown">
               <div class="assigned-container">
                   <div class="sub-label-small">Assigned to</div>
                   <div class="assignee-info">
                       <div class="mini-avatar" v-if="assignedMemberName" :style="{ backgroundColor: getAvatarColor(assignedMemberName) }">
                            {{ getInitial(assignedMemberName) }}
                        </div>
                         <div class="mini-avatar unassigned" v-else>?</div>
                       <span class="assignee-name">{{ assignedMemberName }}</span>
                   </div>
               </div>
               <!-- Dropdown removed -->
           </div>
        </div>

        <!-- Contact Info Section -->
        <div class="card-section margin-top">
           <div class="section-header-row">
                <h4 class="section-title">Property Details</h4>
                <span class="manage-link">Edit</span>
           </div>
           
           <!-- Mandate Number -->
           <div class="info-row contact-content">
              <div class="info-left">
                 <span class="sub-label">N° Mandat</span>
                 <span class="main-text big">{{ number || 'N/A' }}</span>
              </div>
           </div>

           <!-- Seller Price -->
           <div class="info-row contact-content border-top">
               <div class="info-left full-width">
                   <span class="sub-label">Prix Vendeur (Seller Price)</span>
                   <input 
                       type="text" 
                       :value="currentProperty?.sellerPrice" 
                       @change="savePropertyField('sellerPrice', $event.target.value)" 
                       class="inline-edit"
                       placeholder="e.g. 500,000"
                   />
               </div>
           </div>

           <!-- Estimated Price -->
           <div class="info-row contact-content border-top">
               <div class="info-left full-width">
                   <span class="sub-label">Prix Estimé (Estimated)</span>
                    <input 
                       type="text" 
                       :value="currentProperty?.estimatedPrice" 
                       @change="savePropertyField('estimatedPrice', $event.target.value)" 
                       class="inline-edit"
                       placeholder="e.g. 520,000"
                   />
               </div>
           </div>

            <!-- Owner Seller -->
           <div class="info-row contact-content border-top">
               <div class="info-left full-width">
                   <span class="sub-label">Owner (Seller)</span>
                   <div v-if="propertySeller" class="main-text">
                        {{ propertySeller.name }} <br/>
                        <span style="font-size: 0.9rem; color: #666;">{{ propertySeller.phone }}</span>
                   </div>
                   <div v-else class="main-text" style="color: #999;">
                       No seller linked
                   </div>
               </div>
           </div>

        </div>

        <!-- Quotes Section -->
        <div class="card-section">
           <div class="quote-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
               <div style="display: flex; align-items: center; gap: 10px;">
                   <span class="icon-label icon-bg-purple-light" style="color: #6200ea; background: #ede7f6;">$</span>
                   <span class="header-text">הצעת מחיר</span>
                   <span v-if="quotes && quotes.length" class="badge-small" style="background: #6200ea; color: white; border-radius: 4px; padding: 0 6px; font-size: 0.8rem;">{{ quotes.length }}</span>
               </div>
                  <span class="plus-text" @click="createQuote">+ הצעת מחיר חדשה</span>
           </div>
           
           <div v-if="quotes && quotes.length > 0" class="quotes-list">
               <div v-for="quote in quotes" :key="quote.id" class="quote-item" @click="openQuote(quote.id)" style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer;">
                   <div class="quote-left">
                       <div class="quote-title" style="font-weight: 500; color: #333; margin-bottom: 5px;">{{ quote.title || 'Quote' }}</div>
                       <div class="quote-date" style="font-size: 0.85rem; color: #999;">{{ formatDate(quote.createdAt) }} • {{ formatTime(quote.createdAt) }}</div>
                   </div>
                   <div class="quote-right" style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                       <div class="quote-amount" style="font-weight: 500; color: #999; font-size: 0.95rem;">{{ quote.currency || '$' }} {{ formatCurrency(quote.total || quote.amount) }}</div>
                       <span class="dots-icon" @click.stop="openQuoteActions(quote)">⋮</span>
                   </div>
               </div>
           </div>
        </div>

        <!-- Actions Sheet for Quotes -->
        <Teleport to="body">
            <ActionsSheet 
              v-if="showQuoteActionsSheet" 
              mode="quote"
              @close="showQuoteActionsSheet = false" 
              @select="handleQuoteAction" 
            />
        </Teleport>

         <!-- Notes Section -->
         <div class="card-section">
            <div class="section-header space-between">
                <div class="left-head">
                    <span class="icon-label icon-bg-purple-light">📝</span>
                    <span class="header-text">Notes</span>
                    <span v-if="notes.length > 0" class="badge-count">{{ notes.length }}</span>
                </div>
                <div class="right-head">
                    <span class="plus-text-small" @click="createNote">+ Create Note</span>
                </div>
            </div>
            
            <div v-if="notes.length === 0" class="empty-state-row">
                 <!-- Empty state creates note -->
            </div>

            <div v-else class="notes-list">
                <div 
                    v-for="note in notes" 
                    :key="note.id || note._id || note.timestamp" 
                    class="note-item" 
                    @touchstart="startPress(note, 'note')"
                    @touchend="endPress"
                    @mousedown="startPress(note, 'note')"
                    @mouseup="endPress"
                    @click="handleItemClick(note, openNote)"
                >
                    <div class="note-meta">
                       <span class="edit-icon">📝</span>
                       <span>Updated {{ formatDate(note.date || note.timestamp) }} · {{ formatTime(note.date || note.timestamp) }}</span>
                    </div>
                    <div class="note-body">{{ note.description || note.body }}</div>
                </div>
            </div>
         </div>

        <!-- Files Section -->
        <div class="card-section">
           <div class="section-header space-between">
               <div class="left-head">
                   <span class="icon-label icon-bg-purple-light">📄</span>
                   <span class="header-text">Files</span>
                   <span v-if="files.length > 0" class="badge-count">{{ files.length }}</span>
               </div>
               <div class="right-head">
                   <span class="plus-text-small" @click="openFileSource">+ Add Files</span>
               </div>
           </div>
           
           <div v-if="files.length > 0" class="files-list">
               <div 
                   v-for="file in files" 
                   :key="file.id" 
                   class="file-item" 
                   @touchstart="startPress(file, 'file')"
                   @touchend="endPress"
                   @mousedown="startPress(file, 'file')"
                   @mouseup="endPress"
                   @click="handleItemClick(file, openFile)"
               >
                   <div class="file-icon-wrapper">
                       <svg viewBox="0 0 24 24" width="24" height="24" fill="none" class="file-icon" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                   </div>
                   <div class="file-info">
                       <div class="file-name">{{ file.fileName || file.name || 'Unknown File' }}</div>
                       <div class="file-meta">
                           {{ formatDate(file.date || file.timestamp) }}
                           <span v-if="file.fileSize"> · {{ formatFileSize(file.fileSize) }}</span>
                       </div>
                   </div>
                   <div class="file-action">
                       <div class="circle-outline"></div>
                   </div>
               </div>
           </div>
        </div>

        <!-- Tasks Section -->
        <div class="card-section">
           <div class="section-header space-between">
                <div class="left-head">
                    <span class="icon-label icon-bg-purple-light">✓</span>
                    <span class="header-text">Tasks</span>
                     <span v-if="tasks.length > 0" class="badge-count">{{ tasks.length }}</span>
                </div>
                <div class="right-head">
                    <span class="plus-text-small" @click="createTask">+ Create Task</span>
                </div>
           </div>

           <div v-if="tasks.length === 0" class="empty-state-row">
                 <!-- Empty state -->
           </div>

           <div v-else class="tasks-list">
                <div 
                    v-for="task in tasks" 
                    :key="task.id || task._id || task.timestamp" 
                    class="task-item" 
                    @touchstart="startPress(task, 'task')"
                    @touchend="endPress"
                    @mousedown="startPress(task, 'task')"
                    @mouseup="endPress"
                    @click="handleItemClick(task, openTask)"
                >
                    <div class="task-left">
                        <div class="circle-checkbox"></div>
                    </div>
                    <div class="task-content">
                         <div class="task-row-top">
                             <div class="task-name">{{ task.name || task.description }}</div>
                             <span class="star-icon" v-if="task.isStarred">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#6200ea" stroke-width="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                             </span>
                         </div>
                         <div class="task-meta">
                             <span v-if="task.reminder" class="meta-item">
                                 <svg viewBox="0 0 24 24" width="14" height="14" fill="none" class="meta-icon" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                 <span class="meta-text">Reminder {{ formatReminderShort(task.reminder) }}</span>
                             </span>
                             <span v-if="task.reminder && task.description" class="separator">•</span>
                             <span v-if="task.description" class="meta-item">
                                 <svg viewBox="0 0 24 24" width="14" height="14" fill="none" class="meta-icon" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                             </span>
                         </div>
                    </div>
                </div>
           </div>
        </div>
      </div>

       <!-- Insights Tab -->
      <div v-if="activeTab === 'Insights'" class="insights-view">
        <div class="section-title-simple">More contact details</div>
        <div class="card-section flat">
            <div class="info-row">
                <div class="info-left">
                    <span class="sub-label">Other</span>
                    <span class="main-text">054-677-7499</span>
                </div>
                <div class="insight-actions">
                    <span class="action-bubble">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </span>
                    <span class="action-bubble">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.26-.26.35-.65.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3.3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .69-.63.69-1.19v-3.44c0-.54-.45-.99-.99-.99z"/></svg>
                    </span>
                </div>
            </div>
        </div>
      </div>
      
      <!-- Quotes Tab -->
      <div v-if="activeTab === 'הצעת מחיר'" class="details-view">
          <div class="card-section">
             <div class="section-header">
                 <span class="icon-label icon-bg-purple-light">🏷️</span>
                 <span class="header-text">הצעת מחיר</span>
             </div>
             
             <!-- List of Quotes (if any) could go here -->
             <div class="action-row centered">
                  <span class="plus-text" @click="createQuote">+ הצעת מחיר חדשה</span>
             </div>
          </div>
      </div>

      <!-- Meetings Tab -->
      <div v-if="activeTab === 'Meetings'" class="details-view">
          <div class="card-section">
             <div class="section-header">
                 <span class="icon-label icon-bg-purple-light">📅</span>
                 <span class="header-text">Meetings</span>
             </div>
             
             <!-- List of Meetings (if any) could go here -->
             <div class="action-row centered">
                  <span class="plus-text">+ Create Meeting</span>
             </div>
          </div>
      </div>
      
      <!-- Fallback for other tabs -->
      <div v-else-if="!['Call Log', 'Details', 'Insights', 'הצעת מחיר', 'Meetings'].includes(activeTab)" class="tab-placeholder">
        <div class="placeholder-content">
            <h3>{{ activeTab }}</h3>
            <p>No content yet.</p>
        </div>
      </div>

    </div>
  </div>

    <!-- Status Action Sheet -->
    <div v-if="showStatusDropdown" class="sheet-overlay" @click="toggleStatusDropdown">
        <div class="sheet-content" @click.stop>
            <div class="sheet-header">
                <div class="drag-handle"></div>
                <div class="sheet-title">Status:</div>
            </div>
            <div class="sheet-body">
                <div 
                    v-for="step in workflowSteps.filter(s => s.name !== 'Create Price Quote')" 
                    :key="step.id" 
                    class="sheet-item"
                    @click="updateStatus(step)"
                >
                    <span>{{ step.name }}</span>
                     <span v-if="currentLead && currentLead.listType === step.type" class="check-icon">✓</span>
                </div>
                 <!-- Archive Option -->
                 <div class="sheet-item archive" @click="updateStatus({type: 'archive'})">
                    <span class="archive-icon">🗃️</span>
                    <span>Archive</span>
                 </div>
            </div>
        </div>
    </div>

    <!-- Assign Action Sheet -->
    <div v-if="showAssignDropdown" class="sheet-overlay" @click="toggleAssignDropdown">
        <div class="sheet-content" @click.stop>
            <div class="sheet-header">
                <div class="drag-handle"></div>
                <div class="sheet-title">Assign to</div>
            </div>
            <div class="sheet-body">
                <div 
                    v-for="member in tenantMembers" 
                    :key="member.id || member.Id" 
                    class="sheet-item member"
                    @click="assignMember(member)"
                >
                    <div class="member-left">
                        <div class="member-avatar" :style="{ backgroundColor: getAvatarColor(getMemberName(member)) }">
                            {{ member.initial || member.Initial || getInitial(getMemberName(member)) }}
                        </div>
                        <span class="member-name">{{ getMemberName(member) }}</span>
                    </div>
                     <span v-if="isAssigned(member.id || member.Id)" class="check-icon">✓</span>
                </div>
            </div>
        </div>
    </div>
    
    <FileSourceSheet 
        v-if="showFileSourceSheet" 
        @close="showFileSourceSheet = false"
        @select="handleFileSourceSelect"
    />

    <!-- Property Selection Sheet -->
    <div v-if="showPropertySheet" class="sheet-overlay" @click="showPropertySheet = false">
        <div class="sheet-content" @click.stop>
            <div class="sheet-header">
                <div class="drag-handle"></div>
                <div class="sheet-title">Link Property</div>
            </div>
            <div class="sheet-body">
                 <div class="sheet-item" @click="createPropertyShort">
                    <span class="plus-icon">+</span>
                    <span>Create New Property</span>
                 </div>
                 <div 
                    v-for="prop in allProperties" 
                    :key="prop.id" 
                    class="sheet-item"
                    @click="linkProperty(prop)"
                 >
                    <span class="home-icon">🏠</span>
                    <span>{{ prop.address }}</span>
                 </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
            <h3>Delete {{ itemToDelete?.type }}?</h3>
            <p>Are you sure you want to remove this record?</p>
            <div class="modal-actions">
                <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
                <button class="delete-btn" @click="confirmDelete">Delete</button>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import FileSourceSheet from '../components/FileSourceSheet.vue';
import ActionsSheet from '../components/ActionsSheet.vue'; 
import api from '../services/api'; 

// Call Log Actions
const showCallActionsSheet = ref(false);
const selectedCallLog = ref(null);

const openCallActions = (log) => {
    selectedCallLog.value = log;
    showCallActionsSheet.value = true;
};

const handleCallAction = (action) => {
    // Implement actions for call log (similar to Lead Actions)
    const log = selectedCallLog.value;
    const phone = log.number || number.value; // Use log number or lead number
    
    if (action === 'call') {
        window.location.href = `tel:${phone}`;
    } else if (action === 'sms') {
        window.location.href = `sms:${phone}`;
    } else if (action === 'whatsapp') {
        const clean = String(phone).replace(/\D/g, '');
        window.open(`https://wa.me/${clean}`, '_system');
    } else if (action === 'hide') {
        // Hide log logic? Or just show toast
        store.dispatch('showToast', { message: 'Don\'t show in LEADer selected', type: 'info' });
        // store.dispatch('hideActivity', log.id);
    }
    showCallActionsSheet.value = false;
}; 

const showLabelSelectSheet = ref(false);

const allLabels = computed(() => store.getters.allLabels);
const currentLeadLabels = computed(() => {
    if (currentLead.value && currentLead.value.labels) {
        return currentLead.value.labels;
    }
    return [];
});

const availableLabels = computed(() => {
    // Labels not yet assigned to this lead
    const current = currentLeadLabels.value;
    return allLabels.value.filter(l => !current.includes(l.id));
});

const getLabelName = (id) => {
    const l = allLabels.value.find(x => x.id === id);
    return l ? l.name : 'Unknown';
};

const getLabelColor = (id) => {
    const l = allLabels.value.find(x => x.id === id);
    return l ? l.color : '#ccc';
};

const addLabelToCurrentLead = async (label) => {
    const leadId = currentLead.value ? currentLead.value.id : null;
    if (!leadId) return;

    await store.dispatch('addLabelToLead', { leadId, labelId: label.id });
    showLabelSelectSheet.value = false;
};

const removeLabel = async (labelId) => {
    if (!confirm('Remove label?')) return;
    const leadId = currentLead.value ? currentLead.value.id : null;
    if (!leadId) return;
    
    await store.dispatch('removeLabelFromLead', { leadId, labelId });
};


const createNewLabel = () => {
    router.push({ name: 'labels' });
};

// Property Logic
const showPropertySheet = ref(false);
const showAddPropertyModal = ref(false);
const allProperties = computed(() => store.getters.allProperties);

const leadRole = ref('');

// Init role
watch(currentLead, (newVal) => {
    if (newVal) {
        if (newVal.role) {
            leadRole.value = newVal.role;
        } else {
            // Check labels fallback
            if (newVal.labels) {
                if (newVal.labels.includes('Buyer') || newVal.labels.some(l => l.includes('Buyer'))) leadRole.value = 'Buyer';
                else if (newVal.labels.includes('Seller') || newVal.labels.some(l => l.includes('Seller'))) leadRole.value = 'Seller';
            }
        }
    }
}, { immediate: true });


const updateLeadRole = async () => {
    if (!currentLead.value) return;
    const lead = { ...currentLead.value, role: leadRole.value };
    // Also manage labels for backward compat?
    // Let's assume we store Role in `role` field mainly.
    // If backend doesn't support 'role' field, stick to labels.
    // Since backend Lead model doesn't explicitly have 'Role' but 'Labels', we might need to sync labels.
    /*
    Backend Lead Model:
    public string Role { get; set; } // Wait, did we add Role? 
    We added it to Contact model. Lead model has Labels.
    Let's assume we use Labels for now or strict Role field if I added it.
    Start of conversation mentioned "Lead model ... propertyId ... contactId".
    Did we add "Role" to Lead? No, we added "SellerPrice", "BuyerOffer".
    So we must use Labels for Role on Lead.
    */
    
    // Logic: Remove conflicting label, add new one.
    // Assuming labels have IDs.
    // If 'Buyer' label exists, add it.
    const allLabels = store.getters.allLabels;
    const buyerLabel = allLabels.find(l => l.name === 'Buyer' || l.type === 'Buyer');
    const sellerLabel = allLabels.find(l => l.name === 'Seller' || l.type === 'Seller');
    
    let labels = [...(currentLead.value.labels || [])];
    
    // Remove old role labels
    if (buyerLabel) labels = labels.filter(l => l !== buyerLabel.id);
    if (sellerLabel) labels = labels.filter(l => l !== sellerLabel.id);
    
    // Add new role label
    if (leadRole.value === 'Buyer' && buyerLabel) labels.push(buyerLabel.id);
    if (leadRole.value === 'Seller' && sellerLabel) labels.push(sellerLabel.id);
    
    await store.dispatch('updateLead', { id: currentLead.value.id, lead: { labels } });
}

const linkProperty = async (prop) => {
    if (!currentLead.value) return;
    try {
        await store.dispatch('updateLead', { 
            id: currentLead.value.id, 
            lead: { propertyId: prop.id } 
        });
        showPropertySheet.value = false;
        store.dispatch('showToast', { message: 'Property linked', type: 'success' });
    } catch (e) {
        console.error("Link property failed", e);
    }
};

const createPropertyShort = async (propData) => {
    // Implement modal logic if needed or redirect
    router.push({ name: 'properties', query: { create: true } });
};

// Quote Log Actions ...
const showQuoteActionsSheet = ref(false);
const selectedQuote = ref(null);

const openQuoteActions = (quote) => {
    selectedQuote.value = quote;
    showQuoteActionsSheet.value = true;
};

const handleQuoteAction = (action) => {
    // console.log("Quote action:", action, selectedQuote.value);
    const quote = selectedQuote.value;
    const phone = number.value || quote.phone;
    
    // Communication Actions
    if (action === 'call') {
        window.location.href = `tel:${phone}`;
    } else if (action === 'sms') {
        window.location.href = `sms:${phone}`;
    } else if (action === 'whatsapp') {
         const clean = String(phone).replace(/\D/g, '');
         window.open(`https://wa.me/${clean}`, '_system');
    }
    // Quote Specific Actions
    else if (action === 'share_url') {
        // Implement share logic (Web Share API?)
        const url = `${window.location.origin}/quote/${quote.id}/preview`; // Hypothetical public URL
        if (navigator.share) {
            navigator.share({
                title: 'Quote',
                text: `View quote from ${quote.businessName || 'us'}`,
                url: url
            }).catch(console.error);
        } else {
             // Fallback copy to clipboard
             navigator.clipboard.writeText(url);
             store.dispatch('showToast', { message: 'Link copied to clipboard', type: 'success' });
        }
    } else if (action === 'resend_quote') {
        // Trigger resend logic
        store.dispatch('showToast', { message: 'Quote resent successfully', type: 'success' });
    } else if (action === 'edit_quote') {
        router.push({ name: 'create-quote', params: { leadId: number.value }, query: { edit: quote.id } }); 
        // Note: Needs route/component support for editing existing quote
    } else if (action === 'duplicate_quote') {
        // Duplicate logic
        store.dispatch('duplicateQuote', quote.id); // Assume this action exists or implement
        store.dispatch('showToast', { message: 'Quote duplicated', type: 'success' });
    } else if (action === 'delete_quote') {
        if (confirm("Delete this quote?")) {
             store.dispatch('deleteQuote', { id: quote.id, leadId: number.value });
        }
    }

    showQuoteActionsSheet.value = false;
};

const props = defineProps(['propertyId']);

const currentProperty = computed(() => {
    return store.getters.allProperties.find(p => p.id === props.propertyId);
});

const propertySeller = computed(() => {
    if (!currentProperty.value || !currentProperty.value.sellerContactId) return null;
    return store.getters.allContacts.find(c => c.id === currentProperty.value.sellerContactId);
});

const leadName = computed(() => currentProperty.value ? currentProperty.value.address : 'Unknown Property');
const number = computed(() => currentProperty.value ? currentProperty.value.mandateNumber : '');
const currentStatus = computed(() => currentProperty.value ? (currentProperty.value.status || 'Leads') : 'Leads');

// Tabs for Property
const tabs = ['Details', 'Files', 'Tasks']; // Simplified for now

// Status logic (Visual mostly, or update Property Status)
const currentStageName = computed(() => currentStatus.value);

onMounted(() => {
    store.dispatch('fetchProperties');
    store.dispatch('fetchContacts'); // For seller info
    // Fetch related artifacts if supported (files, tasks linked to property)
});

// Stubs for missing lead-specific functions
const getInitial = (name) => '🏠';
const getAvatarColor = () => '#4CAF50';

const savePropertyField = (field, value) => {
    if (!currentProperty.value) return;
    store.dispatch('updateProperty', { 
        id: currentProperty.value.id, 
        [field]: value 
    });
};

const cameraInput = ref(null);
const galleryInput = ref(null);
const fileInput = ref(null);
const showFileSourceSheet = ref(false);

// Long Press & Delete Logic
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
let pressTimer = null;
let isLongPress = false;

const startPress = (item, type) => {
    isLongPress = false;
    pressTimer = setTimeout(() => {
        isLongPress = true;
        itemToDelete.value = { ...item, type };
        showDeleteModal.value = true;
    }, 800); // 800ms for long press
};

const endPress = () => {
    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
};

const handleItemClick = (item, action) => {
    if (isLongPress) {
        // Long press triggered, ignore click
        isLongPress = false; 
        return;
    }
    if (action) action(item);
};

const confirmDelete = async () => {
    if (!itemToDelete.value) return;
    
    try {
        await store.dispatch('deleteActivity', itemToDelete.value.id);
        store.dispatch('showToast', { message: 'Item deleted', type: 'success' });
        showDeleteModal.value = false;
        itemToDelete.value = null;
    } catch (e) {
        console.error(e);
        store.dispatch('showToast', { message: 'Failed to delete', type: 'error' });
    }
};

const number = computed(() => route.params.number);
// ... existing computed properties ...
const callHistory = computed(() => store.getters.getCallHistory(number.value));
const currentLead = computed(() => store.getters.allLeads.find(l => l.phone === number.value || l.id === number.value));
const quotes = computed(() => {
    const allQuotes = store.state.quotes || [];
    const targetPhone = number.value; 
    const targetId = currentLead.value ? currentLead.value.id : null;
    
    return allQuotes.filter(q => {
        // Match by Lead ID (if quote is linked to a lead entity)
        if (targetId && (q.leadId === targetId || q.relatedTo === targetId)) return true;
        
        // Match by Phone (if quote is linked by phone, common for unsaved leads/calls)
        // Normalize phone numbers for comparison if possible, but strict match is a good start
        if (targetPhone && (q.phone === targetPhone || q.mobile === targetPhone || q.leadPhone === targetPhone || q.leadId === targetPhone)) return true;
        
        return false;
    });
});

// ... existing formatters ...
const leadName = computed(() => {
    if (currentLead.value && currentLead.value.name && currentLead.value.name !== 'Unknown' && currentLead.value.name !== 'Unknown User') {
        return currentLead.value.name;
    }
    
    if (callHistory.value.length > 0) {
        const first = callHistory.value[0];
        const name = first.name || first.cachedName;
        if (name && name !== 'Unknown' && name !== 'Unknown User') return name;
    }
    return number.value;
    return number.value;
});

const isSeller = computed(() => {
    if (!currentLead.value || !currentLead.value.labels) return false;
    return currentLead.value.labels.some(l => {
         const label = allLabels.value.find(x => x.id === l);
         return label && label.type === 'Seller';
    });
});
const isBuyer = computed(() => {
    if (!currentLead.value || !currentLead.value.labels) return false;
    return currentLead.value.labels.some(l => {
         const label = allLabels.value.find(x => x.id === l);
         return label && label.type === 'Buyer';
    });
});

const cachedSellerPrice = ref('');
const cachedBuyerOffer = ref('');

// Watch currentLead to init values
watch(currentLead, (newVal) => {
    if (newVal) {
        cachedSellerPrice.value = newVal.sellerPrice || '';
        cachedBuyerOffer.value = newVal.buyerOffer || '';
    }
}, { immediate: true });

const saveLeadField = async (field, value) => {
     if (!currentLead.value) return;
     const leadId = currentLead.value.id;
     await store.dispatch('updateLead', { id: leadId, [field]: value });
};

const formatDuration = (seconds) => { /* ... */ if (!seconds) return ''; const min = Math.floor(seconds / 60); const sec = seconds % 60; if (min > 0) return `${min} min ${sec} sec`; return `${sec} sec`; };
const formatDate = (dateStr) => { /* ... */ if (!dateStr) return ''; const date = new Date(dateStr); return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
const formatTime = (dateStr) => { /* ... */ if (!dateStr) return ''; return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
const formatCurrency = (val) => { /* ... */ if (!val) return '0.00'; return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const formatFileSize = (bytes) => { /* ... */ if (!bytes) return '0 B'; const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]; };
const formatReminderShort = (dateStr) => { /* ... */ if (!dateStr) return ''; const date = new Date(dateStr); const now = new Date(); const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); if (isToday) return `Today, ${time}`; return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`; };

// ... existing functions ...
const createQuote = async () => { const identifier = currentLead.value ? (currentLead.value.id || currentLead.value.phone) : number.value; router.push({ name: 'create-quote', params: { leadId: identifier } }); };
const openEditLead = () => { const identifier = currentLead.value ? (currentLead.value.id || currentLead.value.phone) : number.value; router.push({ name: 'edit-lead', params: { id: identifier } }); };
const openQuote = (quoteId) => { router.push({ name: 'quote-preview', params: { quoteId } }); };
const createNote = () => { const identifier = currentLead.value ? (currentLead.value.id || currentLead.value.phone) : number.value; router.push({ name: 'create-note', params: { leadId: identifier } }); };

const notes = computed(() => { return callHistory.value.filter(a => a.type === 'note').sort((a,b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)); });
const tasks = computed(() => { return callHistory.value.filter(a => a.type === 'task').sort((a,b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)); });
const files = computed(() => { return callHistory.value.filter(a => a.type === 'file').sort((a,b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)); });

const createTask = () => { const identifier = currentLead.value ? (currentLead.value.id || currentLead.value.phone) : number.value; router.push({ name: 'create-task', params: { leadId: identifier } }); };
const openTask = (task) => { router.push({ name: 'task-detail', params: { taskId: task.id } }); };

const openNote = (note) => {
    // ... logic for note navigation ...
    const identifier = currentLead.value ? (currentLead.value.id || currentLead.value.phone) : number.value;
    router.push({ name: 'create-note', params: { leadId: identifier }, query: { noteId: note.id } });
};



// ... action menu ...
const showActionMenu = ref(false);
const toggleActionMenu = () => { showActionMenu.value = !showActionMenu.value; };
const handleAction = async (action) => {
    // ... existing handleAction logic ...
    showActionMenu.value = false;
    if (action === 'move_to') { toggleStatusDropdown(); }
    else if (action === 'delete') {
         if (confirm("Are you sure you want to delete this lead?")) {
             const idToDelete = currentLead.value ? (currentLead.value.id || currentLead.value.phone) : number.value;
             try {
                await store.dispatch('deleteItem', { itemId: idToDelete, type: 'lead' });
                store.dispatch('showToast', { message: 'Lead deleted', type: 'success' });
                router.back();
             } catch (e) {
                console.error(e);
                store.dispatch('showToast', { message: 'Failed to delete', type: 'error' });
             }
         }
    } else if (action === 'send_card') { 
        // Open Business Card Preview/Edit as requested
        router.push({ name: 'business-card' }); 
    }
    else if (action === 'hide_leader') { store.dispatch('showToast', { message: 'Hidden from LEADer (Simulated)', type: 'info' }); }
};

// Close menu when clicking outside
const closeMenu = (e) => {
    if (showActionMenu.value) {
        showActionMenu.value = false;
    }
};

onMounted(() => {
    window.addEventListener('click', closeMenu);
});
// Need to remove listener on unmount ideally, but for now simple

// Assignment Logic
const showAssignDropdown = ref(false);
const showStatusDropdown = ref(false);

const tenantMembers = computed(() => store.getters.tenantMembers);

const toggleAssignDropdown = () => {
    if (showStatusDropdown.value) showStatusDropdown.value = false;
    if (!showAssignDropdown.value && tenantMembers.value.length === 0) {
        store.dispatch('fetchTenantMembers');
    }
    showAssignDropdown.value = !showAssignDropdown.value;
};

const toggleStatusDropdown = () => {
    if (showAssignDropdown.value) showAssignDropdown.value = false;
    // ensure workflow steps are loaded?
    showStatusDropdown.value = !showStatusDropdown.value;
};

const updateStatus = async (step) => {

    // 1. Intercept Quote Creation
    const normalizedTarget = String(step.type).toLowerCase();
    const currentStatus = String(currentLead.value?.listType || '').toLowerCase();

    // Check if target is quote AND we are already in a quote status
    const isTargetQuote = normalizedTarget.includes('quote') || normalizedTarget.includes('הצעת מחיר');
    const isCurrentQuote = currentStatus.includes('quote') || currentStatus.includes('הצעת מחיר');

    if (isTargetQuote) {
        if (isCurrentQuote) {
            // Already in quote status - do NOT create new one
            showStatusDropdown.value = false;
            return;
        }

        // Otherwise, proceed to create quote
        const identifier = currentLead.value ? (currentLead.value.id || currentLead.value.phone) : number.value;
        router.push({ name: 'create-quote', params: { leadId: identifier } });
        showStatusDropdown.value = false;
        return;
    }

    // 2. Handle Unsaved Leads (Create on Move)
    if (!currentLead.value) {
         const fakeItem = {
            name: leadName.value,
            number: number.value,
            phone: number.value,
            initial: getInitial(leadName.value),
            color: getAvatarColor(leadName.value),
            source: 'mobile',
            id: 'temp_' + Date.now()
        };
        
        await store.dispatch('moveItem', {
            item: fakeItem,
            target: step.type
        });
    } else {
        await store.dispatch('moveItem', {
            item: currentLead.value,
            target: step.type
        });
    }
    showStatusDropdown.value = false;
};

const assignMember = async (member) => {
    let item = currentLead.value;
    
    // If no lead exists, create it first (by moving to default 'lead' list)
    if (!item) {
        const fakeItem = {
            name: leadName.value,
            number: number.value,
            phone: number.value,
            initial: getInitial(leadName.value),
            color: getAvatarColor(leadName.value),
            source: 'mobile',
            id: 'temp_' + Date.now()
        };
        
        // Create via Move (to 'lead')
        await store.dispatch('moveItem', { item: fakeItem, target: 'lead' });
        
        // Wait for store update to find the real item
        setTimeout(async () => {
             const newItem = store.getters.allLeads.find(l => l.phone === number.value);
             if (newItem) {
                  await store.dispatch('assignItem', { 
                    item: newItem, 
                    targetUserId: member.id || member.Id
                });
             }
        }, 500); 
        
    } else {
        await store.dispatch('assignItem', { 
            item: item, 
            targetUserId: member.id || member.Id
        });
    }
    
    showAssignDropdown.value = false;
};

const isAssigned = (memberId) => {
    if (!currentLead.value) return false;
    // Check if memberId is in assignedTo array or equals userId (owner)
    // The backend/store logic might vary, let's check both
    const assigned = currentLead.value.assignedTo;
    if (Array.isArray(assigned)) {
        return assigned.includes(memberId);
    }
    return assigned === memberId || currentLead.value.userId === memberId;
};

const getMemberName = (m) => {
    if (!m) return '';
    // Handle case sensitivity (backend might return Name or name)
    const name = m.name || m.Name;
    const email = m.email || m.Email;
    
    if (name && name !== 'Unknown' && name !== 'Unknown User') return name;
    return email || m.phone || m.Telephone || 'User';
};

const workflowSteps = computed(() => store.getters.allWorkflowSteps);

const currentStageName = computed(() => {
    if (!currentLead.value) return 'Not Saved'; // Explicitly show "Not Saved"
    if (!currentLead.value.listType) return 'New';
    
    const step = workflowSteps.value.find(s => s.type === currentLead.value.listType);
    return step ? step.name : currentLead.value.listType;
});
// ...
// In template (I will do separate edit for template)

const assignedMemberName = computed(() => {
    if (!currentLead.value) return '';
    // Find member who is assigned
    const member = tenantMembers.value.find(m => isAssigned(m.id || m.Id));
    
    if (member) return getMemberName(member);
    
    return ''; // Truly unassigned
});

const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
};

const getAvatarColor = (name) => {
    if (!name || name === 'Unknown' || name === 'Unknown User' || name === 'Unknown Member') return '#ccc';
    // Simple hash for color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const inviteTeammates = () => {
    router.push('/invite-teammates');
};



const handleFileSourceSelect = (source) => {
    showFileSourceSheet.value = false;
    if (source === 'camera') {
        if (cameraInput.value) cameraInput.value.click();
    } else if (source === 'gallery') {
        if (galleryInput.value) galleryInput.value.click();
    } else if (source === 'storage' || source === 'drive') {
        if (fileInput.value) fileInput.value.click();
    }
};

const onFileSelected = async (event) => {
    const file = event.target.files[0];
    if (file) {
        try {
            store.dispatch('showToast', { message: `Uploading ${file.name}...`, type: 'info' });
            
            // 1. Upload File
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResult = await store.dispatch('uploadFile', formData);
            
            if (uploadResult && uploadResult.path) {
                 // 2. Create Activity linking this file
                 const activity = {
                    userId: store.getters.currentUser?.id,
                    number: currentLead.value ? (currentLead.value.phone || currentLead.value.id) : number.value,
                    type: 'file',
                    name: 'File Upload',
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    initial: 'F',
                    color: '#00bcd4', // Cyan/Blue for files
                    timestamp: Date.now(),
                    date: new Date(),
                    time: new Date().toLocaleTimeString(),
                    isIcon: true,
                    description: `Uploaded file: ${file.name}`,
                    filePaths: [uploadResult.path]
                };

                await store.dispatch('createActivity', activity);
                store.dispatch('showToast', { message: 'File uploaded successfully', type: 'success' });
            }
        } catch (error) {
            console.error("Upload failed", error);
            store.dispatch('showToast', { message: 'Upload failed', type: 'error' });
        }
    }
    // Reset input
    event.target.value = '';
};

const openFileSource = () => {
    showFileSourceSheet.value = true;
};

const openFile = (file) => {
    // Construct the URL. Assuming backend serves files from /uploads or similar, but
    // the path returned by backend likely is relative or absolute on server.
    // FilesController returns: { path = path.Replace("\\", "/") }
    // Ideally we need a full URL.
    // If the backend assumes static file serving, we need the base URL.
    
    if (file.filePaths && file.filePaths.length > 0) {
        const path = file.filePaths[0];
        // Clean path if needed (remove leading slash if we append to base)
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        // Use the API base URL to construct the full link
        // Assuming api.defaults.baseURL is set
        const baseUrl = api.defaults.baseURL || 'https://api.leader.benjtap.co.il/api'; // Fallback
        
        // Wait, typical pattern if saved in wwwroot is to serve via static files middleware
        // If saved outside, we might need a controller action to download.
        // FilesController doesn't have a download action visible in my read.
        // It might be serving statically from the root if configured.
        
        // Let's assume it's served as a static resource relative to the domain root, NOT the API root, 
        // if the path is something like "uploads/..."
        // Or if it's "wwwroot/uploads/...", we strip wwwroot.
        
        // For now, let's try to open a new window with the path appended to the API domain (without /api if possible)
        // Actually, let's check if the path is a full URL. It likely isn't.
        
        // If the backend returns "uploads/guid.jpg", and we are on "localhost" or similar.
        
        // Let's rely on a helper or just try opening it.
        const fileUrl = `${baseUrl.replace('/api', '')}/${cleanPath}`;
        window.open(fileUrl, '_blank');
    }
};

onMounted(() => {
    // Ensure all data is available
    store.dispatch('fetchActivities');
    store.dispatch('fetchWorkflowAndLists');
    store.dispatch('fetchTenantMembers');
    store.dispatch('fetchLeads');

    if (number.value) {
        store.dispatch('fetchQuotes', number.value);
    }
});

watch(number, (newVal) => {
    if (newVal) {
        store.dispatch('fetchQuotes', newVal);
    }
});

watch(activeTab, (newTab) => {
    if (newTab === 'הצעת מחיר' && number.value) {
         store.dispatch('fetchQuotes', number.value);
    }
});

watch(currentLead, (newVal) => {
    if (newVal) {
        store.dispatch('fetchQuotes', newVal.id || newVal.phone);
    }
});
</script>

<style scoped>
.details-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white; /* Clean white bg as per Image 3 */
  font-family: 'Roboto', sans-serif;
}

.top-bar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  /* border-bottom: 1px solid #f0f0f0; Removed border to blend with tabs like in typical material design */
}

.back-icon {
  margin-right: 20px;
  cursor: pointer;
  color: #333;
}

.title {
  flex: 1;
  font-size: 1.25rem;
  font-weight: 500;
  color: #000;
}

.actions {
  display: flex;
  gap: 20px;
  color: #6200ea; /* Purple icons */
  cursor: pointer;
  align-items: center;
}
.actions .dots-icon {
    color: #333; /* Dots usually black/gray */
    font-size: 1.5rem;
}

/* Tabs */
.tabs-container {
    border-bottom: 1px solid #eee;
}
.tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 10px;
  white-space: nowrap;
  scrollbar-width: none; /* Hide scrollbar Firefox */
}
.tabs::-webkit-scrollbar { display: none; } /* Hide scrollbar Chrome */

.tab-item {
  padding: 15px 15px;
  color: #777;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 3px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.tab-item.active {
  color: #6200ea;
  border-bottom-color: #6200ea;
  font-weight: 500;
}

.content {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

/* Call Log View */
.call-log-view {
  padding: 20px;
}

.log-header-section {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.log-title {
    font-size: 1.1rem;
    font-weight: bold;
    color: #000;
    margin-right: 10px;
}

.badge {
  background: #6200ea;
  color: white;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.8rem;
  font-weight: bold;
}

.log-list {
    display: flex;
    flex-direction: column;
}

.log-item {
  display: flex;
  align-items: flex-start; /* Align top to match timestamps */
  padding: 15px 0;
  border-bottom: 1px solid #f9f9f9;
}

.log-icon-container {
    width: 30px;
    margin-right: 5px;
    padding-top: 2px; /* Slight visual alignment */
}

/* Arrow rotations/colors to match image */
.icon.incoming { color: #4caf50; transform: rotate(0deg); } /* Down-Left Green */
.icon.missed { color: #f44336; transform: rotate(180deg); } /* Red arrow, simplistic representation */
.icon.outgoing { color: #ff9800; transform: rotate(0deg); } /* Up-Right Orange */

.log-details {
  flex: 1;
}

.log-top-row {
    margin-bottom: 4px;
}
.log-time {
    font-size: 1rem;
    color: #333;
    font-weight: 500;
}

.log-bottom-row {
    font-size: 0.85rem;
    color: #999;
}

.log-right {
    text-align: right;
    padding-top: 2px;
}
.duration {
    font-size: 0.85rem;
    color: #777;
}

.tab-placeholder {
    padding: 50px;
    text-align: center;
    color: #ccc;
}
/* Details View Styles */
.details-view {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.row-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 15px;
    cursor: pointer;
}
.row-item:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom: 1px solid #f9f9f9;
}
.row-item.border-bottom {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}
.label { font-size: 1rem; color: #333; }
.value-container { display: flex; align-items: center; gap: 10px; }
.value-text { color: #666; font-size: 0.95rem; }
.chevron { color: #999; font-size: 1.2rem; }

.card-section {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.card-section.margin-top {
    margin-top: 5px;
}

.section-title {
    margin: 0 0 15px 0;
    font-size: 1rem;
    font-weight: 500;
    color: #333;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.sub-label {
    display: block;
    font-size: 0.75rem;
    color: #999;
    margin-bottom: 3px;
}
.main-text {
    font-size: 1rem;
    color: #333;
}
.purple-icon {
    color: #6200ea;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}
.icon-label {
    font-size: 1.1rem;
}
.icon-bg-purple-light {
    padding: 5px;
    border-radius: 6px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6200ea;
}
.header-text {
    font-weight: 500;
    font-size: 1rem;
}

.action-row {
    border-top: 1px solid #f5f5f5;
    padding-top: 15px;
}
.action-row.centered {
    text-align: center;
}
.plus-text {
    color: #6200ea;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
}

/* Insights View Styles */
.insights-view {
    padding: 10px;
}
.section-title-simple {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 10px;
    font-weight: 500;
}
.card-section.flat {
    box-shadow: none;
    border: 1px solid #eee;
}
.insight-actions {
    display: flex;
    gap: 15px;
}
.action-bubble {
    color: #6200ea;
    cursor: pointer;
}

/* Assign Dropdown Styles */
.assign-dropdown {
    background: #f9f9f9;
    border-bottom: 1px solid #eee;
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}
.member-item:hover {
    background: #f0f0f0;
}
.member-item.invite-item {
    color: #6200ea;
    font-weight: 500;
}

.member-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.member-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ccc;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
}
.member-avatar.invite-avatar {
    background: transparent;
    color: #6200ea;
    border: 1px solid #eee; /* Optional border */
}

.member-name {
    font-size: 1rem;
    color: #333;
}
.invite-item .member-name {
    color: #333; /* Keep name dark or specific color? Image implies dark text next to purple icon? */
}


/* Profile Header Styles */
.profile-header {
    background: white;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    /* No border bottom, flows into tabs */
}
.profile-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.labels-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 5px;
}

.label-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.label-chip .remove-x {
    margin-left: 5px;
    cursor: pointer;
    font-weight: bold;
    opacity: 0.7;
}

.add-label-btn {
    border: 1px dashed #6200ea;
    background: transparent;
    color: #6200ea;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    cursor: pointer;
}

.profile-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.profile-name {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}
.profile-phone {
    font-size: 0.9rem;
    color: #888;
    margin: 2px 0 8px 0;
}
.add-label-btn {
    border: 1px solid #6200ea;
    color: #6200ea;
    background: white;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.8rem;
    cursor: pointer;
    font-weight: 500;
}

/* Assigned Section Styles */
.card-section {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    margin-bottom: 10px;
}
.card-section.no-padding {
    padding: 0;
}
.sub-label-small {
    font-size: 0.75rem;
    color: #999;
    margin-bottom: 5px;
}
.assigned-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.assignee-info {
    display: flex;
    align-items: center;
    gap: 10px;
}
.mini-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #6200ea;
    color: white;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
.mini-avatar.unassigned {
    background: #ccc;
}
.assignee-name {
    font-size: 1rem;
    color: #333;
}

/* Contact Info Actions */
.section-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}
.manage-link {
    color: #6200ea;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
}
.contact-content {
    align-items: flex-end; /* Align actions to bottom if text wraps, or center */
    align-items: center;
}
.main-text.big {
    font-size: 1.1rem;
    margin-top: 5px;
}
.info-actions {
    display: flex;
    gap: 20px;
}
.action-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
}
.action-icon.whatsapp {
    color: #25D366;
}
.action-icon.message {
    color: #6200ea;
}
.action-icon.phone {
    color: #6200ea;
}

/* Dropdown embedded */
.assign-dropdown.embedded {
    position: static;
    border-top: 1px solid #f0f0f0;
    box-shadow: none;
    max-height: 200px;
    overflow-y: auto;
}

.check-icon {
    color: #6200ea;
    font-weight: bold;
}

.chevron {
    transition: transform 0.2s;
}
.chevron.rotated {
    transform: rotate(90deg);
}
/* Bottom Sheet Styles */
.sheet-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.sheet-content {
    background: white;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    padding-bottom: 20px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    animation: slideUp 0.3s ease-out;
    max-height: 80vh;
    overflow-y: auto;
}

.sheet-header {
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Title on left */
    position: relative;
    padding-top: 15px;
}

.drag-handle {
    width: 40px;
    height: 4px;
    background: #ccc;
    border-radius: 2px;
    align-self: center; /* Handle centered */
    margin-bottom: 20px;
    /* Position absolutely to center it? or just flex self center */
    align-self: center;
}

/* Ensure handle is centered while title is left */
.sheet-header {
    align-items: stretch; 
}
.drag-handle {
     margin: 0 auto 15px auto;
}

.sheet-title {
    font-size: 1.1rem;
    font-weight: bold;
    color: #000;
    margin-left: 10px;
    margin-bottom: 5px;
}

.sheet-body {
    padding: 0;
}

.sheet-item {
    padding: 15px 20px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f9f9f9;
    font-size: 1rem;
    color: #333;
    cursor: pointer;
}

.sheet-item.archive {
    color: #333;
    gap: 10px;
}

.sheet-item.member {
    justify-content: space-between;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

/* Notes Styles */
.section-header.space-between {
    justify-content: space-between;
    align-items: center;
}
.left-head, .right-head {
    display: flex;
    align-items: center;
    gap: 8px;
}
.badge-count {
    background: #6200ea;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 12px;
}
.plus-text-small {
    color: #6200ea;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
}
.empty-state-row {
     padding: 15px;
     text-align: center;
     border-top: 1px solid #f5f5f5;
}
.notes-list {
    margin-top: 10px;
}
.note-item {
    background: #fff;
    border-top: 1px solid #f5f5f5;
    padding: 15px 0;
}
.note-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #999;
    font-size: 0.8rem;
    margin-bottom: 5px;
}
.edit-icon {
    font-size: 0.9rem;
}
.note-body {
    color: #333;
    font-size: 1rem;
    line-height: 1.4;
}

.files-list {
  display: flex;
  flex-direction: column;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.file-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-right: 15px;
  color: #999;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.file-meta {
  color: #999;
  font-size: 0.8rem;
}

.file-action {
    display: flex;
    align-items: center;
}

.circle-outline {
    width: 20px;
    height: 20px;
    border: 1px solid #ddd;
    border-radius: 50%;
}

/* Tasks List Styles (New) */
.tasks-list {
    display: flex;
    flex-direction: column;
}
.task-item {
    display: flex;
    padding: 12px 15px; /* Added horizontal padding */
    border-bottom: 1px solid #f9f9f9;
}
.task-left {
    padding-right: 15px;
    display: flex; align-items: flex-start;
    padding-top: 2px;
}
.circle-checkbox {
    width: 20px; height: 20px;
    border: 2px solid #6200ea;
    border-radius: 50%;
    cursor: pointer;
}
.task-content {
    flex: 1;
}
.task-row-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 5px;
}
.task-name {
    font-size: 1rem;
    color: #333;
    line-height: 1.3;
}
.star-icon {
    color: #6200ea;
    display: flex; align-items: center;
}
.task-meta {
    display: flex;
    align-items: center;
    color: #999;
    font-size: 0.85rem;
    gap: 8px;
}
.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}
.separator {
    font-size: 1.2rem;
    line-height: 0;
}

/* Actions Menu Styles */
.menu-container {
    position: relative;
    display: flex;
    align-items: center;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    width: 220px;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    border-radius: 8px;
    z-index: 1000;
    padding: 8px 0;
    margin-top: 10px;
    transform-origin: top right;
}

.menu-item {
    padding: 12px 20px;
    font-size: 0.95rem;
    color: #333;
    cursor: pointer;
    background: white;
    white-space: nowrap;
    text-align: left;
    transition: background-color 0.2s;
}

.menu-item:hover {
    background-color: #f9f9f9;
}

/* Label Sheet */
.label-sheet-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.label-sheet-content {
    background: white;
    width: 80%;
    max-width: 300px;
    border-radius: 12px;
    padding: 20px;
    display: flex; flex-direction: column; gap: 10px;
}
.label-sheet-content h3 { margin: 0 0 10px 0; color: #333; }
.label-option {
    display: flex; align-items: center; gap: 10px;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    background: #f9f9f9;
}
.label-option:active { background: #eee; }
.label-dot { width: 12px; height: 12px; border-radius: 50%; }

.create-new-label {
    margin-top: 10px;
    text-align: center;
    color: #6200ea;
    font-weight: 500;
    padding: 10px;
    border-top: 1px solid #eee;
    cursor: pointer;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 80%;
    max-width: 320px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    text-align: center;
}

.modal-content h3 {
    margin: 0 0 10px 0;
    font-size: 1.2rem;
    color: #333;
}

.modal-content p {
    color: #666;
    margin-bottom: 20px;
    font-size: 0.95rem;
}

.modal-actions {
    display: flex;
    justify-content: space-between;
    gap: 15px;
}

.modal-actions button {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
}

.cancel-btn {
    background: #f0f0f0;
    color: #333;
}

.delete-btn {
    background: #ffcdd2; /* Light red */
    color: #d32f2f; /* Dark red */
}
.log-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
}

.log-right .dots-icon {
    font-size: 1.2rem;
    color: #999;
    padding: 0 5px;
    cursor: pointer;
}

.full-width {
    width: 100%;
}

.border-top {
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
    margin-top: 15px;
}

.inline-edit {
    border: none;
    border-bottom: 1px solid transparent;
    font-size: 1rem;
    color: #333;
    padding: 5px 0;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
}

.inline-edit:focus {
    border-bottom-color: #6200ea;
}

.inline-edit::placeholder {
    color: #ccc;
}
</style>
