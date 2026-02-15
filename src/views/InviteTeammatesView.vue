<template>
  <div class="invite-page">
    <div class="header">
        <div class="back-icon" @click="handleBack">
            <!-- Back arrow -->
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </div>
        <h2>Invite</h2>
        <div class="user-icon" v-if="step === 'review'">
             <!-- Checkmark or User Icon -->
             <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 6L9 17l-5-5"></path></svg>
        </div>
        <div class="user-icon" v-else>
             <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        </div>
    </div>

    <!-- STEP 1: SPLASH SCREEN -->
    <div class="content centralized" v-if="step === 'splash'">
        <div class="illustration">
             <svg viewBox="0 0 200 150" width="200" height="150">
                 <circle cx="100" cy="50" r="30" fill="#00E5FF" />
                 <circle cx="70" cy="90" r="30" fill="#FF4081" />
                 <circle cx="130" cy="90" r="30" fill="#7C4DFF" />
                 <circle cx="100" cy="45" r="10" fill="#FFD180" />
                 <circle cx="70" cy="85" r="10" fill="#FFD180" />
                 <circle cx="130" cy="85" r="10" fill="#FFD180" />
                 <text x="100" y="140" text-anchor="middle" font-size="14" fill="#6200ea" font-weight="bold">Invite your teammates</text>
             </svg>
        </div>
        
        <h2 class="title">Invite your teammates</h2>
        <p class="description">
            Add your teammates and start manage all your leads and customers together.
        </p>

        <button class="action-btn" @click="step = 'input'">INVITE</button>
    </div>

    <!-- STEP 2: INPUT EMAILS -->
    <div class="content top-aligned" v-if="step === 'input'">
        <div class="input-group">
            <input 
                type="email" 
                v-model="currentEmail" 
                placeholder="name@example.com" 
                class="email-input"
                @keyup.enter="addEmail"
            />
            <button class="add-btn-mini" @click="addEmail" :disabled="!isValidEmail">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        </div>

        <div class="suggestions" v-if="currentEmail.length > 1 && !isValidEmail">
             <!-- <div class="suggestion-item">Suggestions...</div> -->
        </div>

        <div class="list-container" v-if="emailsToInvite.length > 0">
            <h4 class="list-title">Teammates to add</h4>
            <div class="invite-item" v-for="(email, idx) in emailsToInvite" :key="idx">
                <div class="avatar-circle">{{ email.charAt(0).toUpperCase() }}</div>
                <div class="invite-details">
                    <div class="invite-email">{{ email }}</div>
                    <div class="invite-sub">{{ email }}</div>
                </div>
                <div class="remove-icon" @click="removeEmail(idx)">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="#888" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
            </div>
        </div>
        
        <div class="spacer"></div>

        <!-- Permission Selection for Invites -->
        <div class="permissions-card" @click="cardOpen = !cardOpen">
             <div class="permissions-header">
                 <span>Member Permissions</span>
                 <span class="current-perm">{{ selectedAccessLevel }} Access</span>
                 <svg viewBox="0 0 24 24" width="20" height="20" stroke="#888" stroke-width="2" fill="none" class="chevron" :class="{ rotated: cardOpen }"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </div>
             <p class="perm-desc" v-if="selectedAccessLevel === 'Limited'">Limited, only to content the member is assigned to</p>
             <p class="perm-desc" v-else>Full access to all leads and activities</p>

             <div class="perm-options" v-if="cardOpen">
                 <div class="perm-option" @click.stop="selectedAccessLevel = 'Limited'; cardOpen = false" :class="{ active: selectedAccessLevel === 'Limited' }">
                     Limited Access
                 </div>
                 <div class="perm-option" @click.stop="selectedAccessLevel = 'Full'; cardOpen = false" :class="{ active: selectedAccessLevel === 'Full' }">
                     Full Access
                 </div>
             </div>
         </div>

        <div class="footer-action" v-if="emailsToInvite.length > 0">
             <button class="action-btn" @click="sendInvites">SEND INVITE ({{ emailsToInvite.length }})</button>
        </div>
    </div>

    <!-- STEP 3: MEMBER LIST (REVIEW/MANAGE) -->
    <div class="content top-aligned" v-if="step === 'review'">
         
         <div class="members-list">
             <div class="member-item" v-for="member in members" :key="member.id">
                 <div class="avatar-circle" :style="{ background: getAvatarColor(member.name || member.email) }">
                     {{ (member.name || member.email || '?').charAt(0).toUpperCase() }}
                 </div>
                 <div class="member-info">
                     <div class="member-name">{{ member.name || member.email }}</div>
                     <div class="member-email" v-if="member.name && member.email !== member.name">
                        {{ member.email }} 
                        <span class="pending-label" v-if="member.status === 'Pending'">Pending</span>
                     </div>
                     <div class="member-email" v-else-if="member.status === 'Pending'">
                        <span class="pending-label">Pending</span>
                     </div>
                 </div>
                 
                 <div class="member-role">
                     <span v-if="member.isOwner" class="owner-pill">Owner</span>
                     <div v-else class="role-display">
                         <span class="role-text">{{ member.role }}</span>
                         <span class="access-text" v-if="member.accessLevel">({{ member.accessLevel }})</span>
                     </div>
                 </div>

                 <div class="menu-dots" v-if="!member.isOwner">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                 </div>
             </div>
         </div>

         <!-- Add more button at bottom of list -->
         <div class="add-more-row" @click="step = 'input'">
             <div class="add-icon-circle">
                 <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
             </div>
             <span class="add-text">Add more teammates</span>
         </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const route = useRoute();
const step = ref(route.query.step || 'splash'); // splash, input, review
const currentEmail = ref('');
const emailsToInvite = ref([]);
const members = ref([]);
const selectedAccessLevel = ref('Limited'); // Default to Limited
const cardOpen = ref(false);

const isValidEmail = computed(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail.value);
});

const handleBack = () => {
    if (step.value === 'input') {
        step.value = 'splash';
    } else if (step.value === 'review') {
        router.push('/activities');
    } else {
        router.back();
    }
};

const addEmail = () => {
    if (isValidEmail.value) {
        if (!emailsToInvite.value.includes(currentEmail.value)) {
            emailsToInvite.value.push(currentEmail.value);
        }
        currentEmail.value = '';
    }
};

const removeEmail = (index) => {
    emailsToInvite.value.splice(index, 1);
};

const sendInvites = async () => {
    try {
        const res = await api.post('/invitations', { 
            emails: emailsToInvite.value,
            role: 'Member',
            accessLevel: selectedAccessLevel.value
        });
        
        if (res.data && res.data.results) {
             const withLink = res.data.results.find(r => r.link);
             if (withLink) {
                 console.log("INVITE LINK:", withLink.link);
             }
        }
        
        emailsToInvite.value = []; 
        await fetchMembers();
        step.value = 'review';
    } catch (e) {
        console.error("Invite failed", e);
        alert("Failed to send invites.");
    }
};

const fetchMembers = async () => {
    try {
        const res = await api.get('/invitations/members');
        members.value = res.data;
    } catch (e) {
        console.error("Fetch members failed", e);
    }
};

const getAvatarColor = (name) => {
    const colors = ['#BA68C8', '#4FC3F7', '#FFB74D', '#90A4AE', '#7986CB'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

onMounted(() => {
    fetchMembers().then(() => {
        if (members.value.length > 1) { 
             // Logic for existing members handled here if needed
        }
    });
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.invite-page {
    font-family: 'Roboto', sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f9f9f9; 
}

/* HEADER */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
}

.header h2 {
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0;
    color: #333;
}

.back-icon, .user-icon {
    cursor: pointer;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* CONTENT */
.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow-y: auto;
}

.centralized {
    align-items: center;
    justify-content: center;
    text-align: center;
    background: white; 
}

.top-aligned {
    align-items: flex-start;
}

/* SPLASH */
.illustration { margin-bottom: 30px; }
.title { color: #6200ea; font-size: 1.3rem; margin-bottom: 15px; }
.description { color: #333; margin-bottom: 40px; max-width: 300px; line-height: 1.5; }

/* ACTION BUTTON */
.action-btn {
    background: #6200ea;
    color: white;
    border: none;
    padding: 15px 80px; 
    border-radius: 30px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(98, 0, 234, 0.3);
}

.footer-action {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 20px;
}

/* INPUT STEP */
.input-group {
    width: 100%;
    display: flex;
    align-items: center;
    background: white;
    padding: 5px 15px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.email-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1.1rem;
    padding: 10px 0;
    background: transparent;
}

.add-btn-mini {
    background: #6200ea;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-left: 10px;
}
.add-btn-mini:disabled { background: #ccc; }

.list-container {
    width: 100%;
    margin-top: 20px;
    background: white;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.list-title {
    color: #666;
    font-size: 0.9rem;
    margin: 10px 10px 15px 10px;
    font-weight: 500;
}

.invite-item {
    display: flex;
    align-items: center;
    padding: 12px 10px;
    border-bottom: 1px solid #f0f0f0;
}
.invite-item:last-child { border-bottom: none; }

.invite-details {
    flex: 1;
    margin-left: 15px;
}

.invite-email { font-weight: 500; color: #333; }
.remove-icon { cursor: pointer; padding: 5px; }

/* PERMISSIONS CARD */
.permissions-card {
    background: white;
    width: 100%;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.permissions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    font-size: 1.1rem;
    color: #222;
    margin-bottom: 8px;
}

.current-perm {
    font-size: 0.9rem;
    color: #6200ea;
    font-weight: bold;
    margin-left: auto;
    margin-right: 10px;
}

.perm-desc {
    font-size: 0.85rem;
    color: #888;
    margin: 0;
    line-height: 1.4;
}

.chevron { transition: transform 0.3s; }
.chevron.rotated { transform: rotate(180deg); }

.perm-options {
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 10px;
}

.perm-option {
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 5px;
    cursor: pointer;
}
.perm-option.active {
    background: #f0ebfa;
    color: #6200ea;
    font-weight: 500;
}

/* MEMBER LIST */
.members-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px; 
    padding: 5px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.member-item {
    display: flex;
    align-items: center;
    background: white;
    padding: 16px 20px;
    border-bottom: 1px solid #f5f5f5;
}
.member-item:last-child { border-bottom: none; }

.avatar-circle {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #6200ea; 
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.member-info {
    flex: 1;
    margin-left: 15px;
    min-width: 0; 
}

.member-name {
    font-weight: 500;
    font-size: 1rem;
    color: #222;
    margin-bottom: 2px;
}

.member-email {
    font-size: 0.85rem;
    color: #777;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.pending-label {
    background: #eedeef; 
    color: #8E24AA;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 500;
}

.member-role {
    margin-left: 10px;
    display: flex;
    align-items: center;
    flex-direction: column;
    align-items: flex-end;
}

.owner-pill {
    background: #f0f0f0;
    color: #333;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
} 

.role-display {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 0.85rem;
    color: #333;
}
.access-text {
    font-size: 0.7rem;
    color: #888;
}

.menu-dots {
    padding: 8px;
    cursor: pointer;
    color: #888;
    margin-left: 5px;
}

.add-more-row {
    margin-top: 25px;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
}

.add-icon-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #6200ea;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6200ea;
}

.add-text {
    color: #6200ea;
    font-weight: 500;
    font-size: 1rem;
}

.spacer { flex: 1; }

</style>
