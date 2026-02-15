<template>
  <div class="login-container">
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="login-card" dir="rtl">
      <div class="card-header">
        <h1>Welcome</h1>
        <p v-if="isLoading">Connecting...</p>
        <p v-else>Please sign in</p>
      </div>

      <div v-if="!isLoading" class="google-login-container">
          <button @click="handleGoogleLogin" class="btn-google">
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
              </svg>
              <span>Sign in with Google</span>
          </button>
      </div>
    </div>

    <!-- OTP Modal Popup -->
    <transition name="fade">
      <div v-if="showOtpModal" class="modal-overlay">
        <div class="modal-content" dir="rtl">
          <div class="modal-header">
            <h3>קוד אימות</h3>
            <p>קוד נשלח למספר שלך.</p>
          </div>
          
          <form @submit.prevent="handleCodeVerification">
            <div class="form-group">
              <input 
                type="text" 
                class="otp-input"
                v-model="verificationCode" 
                placeholder="123456"
                autofocus
                required
                maxlength="6"
              />
            </div>

            <div class="modal-actions">
              <button type="button" @click="showOtpModal = false" class="btn-secondary">ביטול</button>
              <button type="button" @click="simulateSmsReceived" class="btn-secondary" style="font-size: 0.8rem;">הדמיית SMS</button>
              <button type="submit" class="btn-primary">אישור</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import api from '../services/api'

const router = useRouter()
const store = useStore()

const isLoading = ref(false)
const showOtpModal = ref(false)
const verificationCode = ref('')
const authContext = ref('inscription') // 'inscription' or 'connexion'

const form = reactive({
  idNumber: '',
  phoneNumber: ''
})



const handleIdentityCheck = async () => {
    // Legacy form submit
    console.log("Manual identity check triggered");
};

// --- AUTO GOOGLE LOGIN ---
import mobileSyncService from '../services/mobileSyncService';

onMounted(async () => {
    // 1. Check if already logged in (persistence)
    if (store.getters.isAuthenticated) {
        router.push({ name: 'activities' });
        return;
    }

    // 2. Auto-trigger Google Sync
    console.log("Auto-triggering Google Login...");
    isLoading.value = true;
    
    try {
        const result = await mobileSyncService.syncGoogleAccount(true);
        if (result.error) {
            console.log("Auto Google Login Skipped/Failed:", result.msg);
            
            // Check for specific backend mismatch error regarding 'DuplicateKey: { telephone: "" }'
            if (result.msg && result.msg.includes('DuplicateKey') && result.msg.includes('telephone')) {
                alert("Backend Error: The server is running outdated code that creates duplicate empty phone numbers.\n\nPlease deploy the updated LeaderAPI to your production server to fix this.");
            }

            // Fallback: Stay on login page with form
            isLoading.value = false;
        } else {
            console.log("Google Synced (Auto):", result.data);
             if (result.data.token && result.data.utilisateur) {
                 store.dispatch('loginSuccess', {
                     token: result.data.token,
                     user: result.data.utilisateur
                 });

                 // Check for pending invite
                 const pendingToken = localStorage.getItem('pending_invite_token');
                 if (pendingToken) {
                     localStorage.removeItem('pending_invite_token');
                     await store.dispatch('joinTenant', pendingToken).catch(e => console.error("Auto-join failed", e));
                 }

                 router.push({ name: 'activities' });
            } else {
                alert("Login incomplete: " + JSON.stringify(result.data));
                isLoading.value = false;
            }
        }
    } catch (e) {
        console.error("Auto Login Error:", e);
        isLoading.value = false;
    }
});

const doInscription = async () => {
    try {
        const payload = {
            Username: form.idNumber,
            Telephone: form.phoneNumber
        }
        const response = await api.post('/Auth/InscriptionIsrael', payload)
        
        if (response.data.succes) {
            authContext.value = 'inscription'
            showOtpModal.value = true
        } else {
            // Si le message dit que l'utilisateur existe déjà mais doit être vérifié
             if (response.data.message && response.data.message.includes('vérifi')) { // Adaptez le check selon le message exact du backend
                 await resendInscriptionCode()
             } else {
                 alert(response.data.message || "שגיאה בהרשמה")
             }
        }
    } catch (e) {
        console.error("Inscription failed", e)
        alert("שגיאה ביצירת חשבון.")
    }
}

const resendInscriptionCode = async () => {
    try {
        const response = await api.post('/Auth/inscription/renvoyer-code', { 
            Username: form.idNumber 
        })
        if (response.data.succes) {
            authContext.value = 'inscription' 
            showOtpModal.value = true
        } else {
            alert(response.data.message)
        }
    } catch (e) {
        alert("לא ניתן לשלוח קוד שוב.")
    }
}

const handleCodeVerification = async () => {
  if (!/^\d{6}$/.test(verificationCode.value)) {
    alert('הקוד חייב להכיל בדיוק 6 ספרות.')
    return
  }

  isLoading.value = true
  try {
    const endpoint = authContext.value === 'inscription' 
        ? '/Auth/inscription/verifier' 
        : '/Auth/connexion/verifier'

    const payload = {
        Username: form.idNumber,
        Code: verificationCode.value
    }
    
    const response = await api.post(endpoint, payload)

    if (response.data.succes) {
        const data = response.data.data
        const token = data.token || data.Token || data.Data?.Token

        if (token) {
            store.dispatch('saveToken', token)
            store.commit('SET_USER', data.utilisateur || data.Utilisateur || data.Data?.Utilisateur)

            // Check for pending invite
            const pendingToken = localStorage.getItem('pending_invite_token');
            if (pendingToken) {
                localStorage.removeItem('pending_invite_token');
                await store.dispatch('joinTenant', pendingToken).catch(e => console.error("Auto-join failed", e));
            }

            router.push({ name: 'activities' })
        } else {
             alert('אימות הצליח, אנא התחבר.')
             showOtpModal.value = false
        }
    } else {
        alert(response.data.message || 'קוד שגוי')
    }
  } catch (error) {
    console.error('Code verification failed:', error)
    alert(error.response?.data?.message || 'קוד שגוי או פג תוקף.')
  } finally {
    isLoading.value = false
  }
}




const handleGoogleLogin = async () => {
    isLoading.value = true;
    try {
        // False = Explicit (Show Prompt)
        const result = await mobileSyncService.syncGoogleAccount(false);
        
        if (result.error) {
             console.error("Manual Google Login Failed/Cancelled:", result);
             alert("Google Login Failed: " + (result.msg || "Unknown Error"));
             isLoading.value = false;
        } else {
             if (result.data.token && result.data.utilisateur) {
                 store.dispatch('loginSuccess', {
                     token: result.data.token,
                     user: result.data.utilisateur
                 });

                 // Check for pending invite
                 const pendingToken = localStorage.getItem('pending_invite_token');
                 if (pendingToken) {
                     localStorage.removeItem('pending_invite_token');
                     await store.dispatch('joinTenant', pendingToken).catch(e => console.error("Auto-join failed", e));
                 }

                 router.push({ name: 'activities' });
            } else {
                alert("Login incomplete: " + JSON.stringify(result.data));
                isLoading.value = false;
            }
        }
    } catch (e) {
        console.error("Manual Google Login Exception:", e);
        alert("An error occurred during login.");
        isLoading.value = false;
    }
};

const simulateSmsReceived = () => {
    verificationCode.value = '123456';
};
</script>

<style scoped>
.google-login-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.btn-google {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    color: #444;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: background-color 0.2s, box-shadow 0.2s;
    width: 100%;
}

.btn-google:hover {
    background-color: #f8f8f8;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.btn-google svg {
    margin-right: 10px;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-gradient);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.background-shapes .shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
}
.shape-1 {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.3);
  top: -50px;
  left: -50px;
}
.shape-2 {
  width: 400px;
  height: 400px;
  background: rgba(79, 70, 229, 0.4);
  bottom: -100px;
  right: -100px;
}

.login-card {
  background: var(--surface);
  backdrop-filter: blur(20px);
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.5);
  text-align: right; /* Ensure content alignment for RTL */
}

/* RTL Specific adjustments for inputs content */
.login-card[dir="rtl"] input {
    text-align: right;
    direction: ltr; /* Keep numbers LTR usually? Or RTL? Phone numbers are tricky. Let's keep it standard right align but direction ltr for digits often works better, but for general text rtl. */
    direction: rtl; 
}


.card-header {
  text-align: center;
  margin-bottom: 2rem;
}
.card-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}
.card-header p {
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  transition: all 0.2s;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  background: white;
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
  text-align: right;
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.otp-input {
  text-align: center;
  letter-spacing: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: 2px solid #e5e7eb;
  color: var(--text-main);
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: #f3f4f6;
}

/* Animations */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.loader {
    width: 20px;
    height: 20px;
    border: 3px solid #FFF;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}
@keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.btn-secondary-action {
  width: 100%;
  padding: 0.875rem;
  background: transparent;
  color: var(--text-muted);
  border: 1px dashed #ccc;
  border-radius: 0.75rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary-action:hover {
  background: rgba(0,0,0,0.05);
  color: var(--text-main);
  border-color: var(--text-muted);
}

.mode-toggle-container {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.mode-label {
    font-size: 0.9rem;
    color: var(--text-muted);
    font-weight: 500;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
