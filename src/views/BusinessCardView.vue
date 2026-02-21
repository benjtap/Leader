
<template>
  <div class="business-card-page">
    <div class="top-bar">
      <div class="back-icon" @click="$router.back()">
         <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
         </svg>
      </div>
      <div class="title">My Business Card</div>
      <div class="actions">
          <!-- Maybe a share icon here later -->
      </div>
    </div>

    <div class="content">
        <!-- Card Preview / Image Upload Area -->
        <div class="card-upload-area" :style="{ backgroundImage: `url(${form.backgroundImageUrl})` }">
            <div class="upload-trigger background" @click="openFileSource('background')">
                <span class="plus-icon">+</span>
                <span class="upload-text">Add Background Image</span>
            </div>

            <div class="logo-upload-trigger" @click="openFileSource('logo')" :style="{ backgroundImage: `url(${form.logoUrl})` }">
                <span v-if="!form.logoUrl" class="upload-text-circle">Add logo</span>
            </div>
        </div>

        <!-- URL / Live Status -->
        <div class="status-bar">
            <div class="status-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#00c853"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <div class="url-display">
                <span class="url-text">https://leader.net/{{ form.slug || 'username' }}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#999"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </div>
        </div>

        <!-- Form Fields -->
        <div class="form-container">
            <div class="form-group">
                <input type="text" v-model="form.fullName" placeholder="Full Name" />
                <span class="required-star" v-if="!form.fullName">*</span>
            </div>
            
            <div class="form-group">
                <input type="text" v-model="form.businessName" placeholder="Business Name" />
                <span class="required-star" v-if="!form.businessName">*</span>
            </div>

            <div class="form-group">
                <input type="text" v-model="form.jobTitle" placeholder="Job Title" />
            </div>

            <div class="form-group">
                 <textarea v-model="form.description" placeholder="Business Description" rows="3"></textarea>
            </div>
            
            <!-- Phone with Dropdown (Simulated) -->
            <div class="form-group phone-group">
                <div class="country-select">
                    <span>▼</span>
                </div>
                <input type="tel" v-model="form.phone" placeholder="Phone" />
                <span class="required-star" v-if="!form.phone">*</span>
            </div>

            <div class="form-group toggle-group">
                <span class="label">Show WhatsApp</span>
                <label class="switch">
                    <input type="checkbox" v-model="form.showWhatsapp">
                    <span class="slider round"></span>
                </label>
            </div>

            <div class="form-group">
                <input type="email" v-model="form.email" placeholder="Email" />
                <span class="required-star" v-if="!form.email">*</span>
            </div>

             <div class="form-group">
                <input type="text" v-model="form.address" placeholder="Address" />
            </div>
            
             <div class="form-group">
                <input type="text" v-model="form.openingHours" placeholder="Opening Hours" />
            </div>
        </div>
    </div>

    <!-- Footer Action -->
    <div class="footer-action">
        <button class="save-btn" @click="saveCard">PREVIEW & SAVE</button>
    </div>

    <!-- File Source Sheet -->
    <FileSourceSheet 
        v-if="showFileSourceSheet" 
        @close="showFileSourceSheet = false"
        @select="handleFileSourceSelect"
    />
    
    <!-- Hidden Inputs for File Upload -->
    <input type="file" ref="cameraInput" accept="image/*" capture="environment" style="display:none" @change="onFileSelected" />
    <input type="file" ref="galleryInput" accept="image/*" style="display:none" @change="onFileSelected" />
    <input type="file" ref="fileInput" accept="image/*" style="display:none" @change="onFileSelected" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import businessCardService from '../services/businessCardService';
import FileSourceSheet from '../components/FileSourceSheet.vue'; 

const router = useRouter();
const store = useStore();

const form = ref({
    fullName: '',
    businessName: '',
    jobTitle: '',
    description: '',
    phone: '',
    showWhatsapp: true,
    email: '',
    address: '',
    openingHours: '',
    backgroundImageUrl: '',
    logoUrl: '',
    slug: ''
});

const showFileSourceSheet = ref(false);
const activeUploadType = ref(null); // 'background' or 'logo'

const cameraInput = ref(null);
const galleryInput = ref(null);
const fileInput = ref(null);

onMounted(async () => {
    try {
        store.commit('SET_LOADING_ROUTE', true);
        const res = await businessCardService.getMyCard();
        if (res.data) {
            form.value = { ...form.value, ...res.data };
        }
    } catch (e) {
        console.error("Failed to load business card", e);
    } finally {
        store.commit('SET_LOADING_ROUTE', false);
    }
});

const openFileSource = (type) => {
    activeUploadType.value = type;
    showFileSourceSheet.value = true;
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
            store.dispatch('showToast', { message: 'Uploading image...', type: 'info' });
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResult = await store.dispatch('uploadFile', formData);
            
            if (uploadResult && uploadResult.path) {
                // Determine full URL (assuming backend returns relative path, prepend API URL if needed)
                // If path is full URL, use it directly. 
                // For this example, assuming uploadFile returns a usable URL or path.
                // Assuming path is like /uploads/filename.jpg
                const fullUrl = uploadResult.path; // You might need to prepend base URL if it's relative
                
                if (activeUploadType.value === 'background') {
                    form.value.backgroundImageUrl = fullUrl;
                } else {
                    form.value.logoUrl = fullUrl;
                }
                store.dispatch('showToast', { message: 'Image uploaded', type: 'success' });
            }
        } catch (e) {
            console.error(e);
            store.dispatch('showToast', { message: 'Upload failed', type: 'error' });
        }
    }
    // reset inputs
    if (event.target) event.target.value = '';
};

const saveCard = async () => {
    if (!form.value.fullName || !form.value.businessName || !form.value.phone) {
        store.dispatch('showToast', { message: 'Please fill in required fields', type: 'error' });
        return;
    }

    try {
        store.commit('SET_LOADING_ROUTE', true);
        await businessCardService.saveCard(form.value);
        store.dispatch('showToast', { message: 'Business Card Saved!', type: 'success' });
        // Maybe navigate to preview or just stay here?
    } catch (e) {
        console.error("Failed to save card", e);
        store.dispatch('showToast', { message: 'Failed to save', type: 'error' });
    } finally {
        store.commit('SET_LOADING_ROUTE', false);
    }
};
</script>

<style scoped>
.business-card-page {
    background-color: #fff;
    min-height: 100vh;
    padding-bottom: 80px; /* Space for footer */
}

.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
}

.title {
    font-size: 1.1rem;
    font-weight: 500;
}

.actions {
    width: 24px;
}

.content {
    padding: 0;
}

/* Card Preview Area */
.card-upload-area {
    width: 100%;
    height: 180px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eee;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
}

.upload-trigger.background {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px dashed #ccc;
    padding: 20px;
    border-radius: 8px;
    cursor: pointer;
    background: rgba(255,255,255,0.7);
}

.plus-icon {
    font-size: 2rem;
    color: #6200ea;
     line-height: 1;
}

.upload-text {
    font-size: 0.85rem;
    color: #888;
}

.logo-upload-trigger {
    position: absolute;
    right: 20px;
    bottom: -25px; /* Halfway out */
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    background-size: cover;
    background-position: center;
    z-index: 2;
}

.upload-text-circle {
    font-size: 0.7rem;
    color: #aaa;
    text-align: center;
}

/* Status Bar */
.status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    margin-top: 25px; /* Space for logo overlap */
}

.url-display {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    color: #666;
}

/* Form Container */
.form-container {
    padding: 20px;
}

.form-group {
    margin-bottom: 20px;
    position: relative;
    border-bottom: 1px solid #eee;
}

.form-group input, 
.form-group textarea {
    width: 100%;
    border: none;
    padding: 10px 0;
    font-size: 1rem;
    outline: none;
    color: #333;
    font-family: inherit;
}

.form-group textarea {
    resize: none;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
    color: #999;
}

.required-star {
    position: absolute;
    right: 0;
    top: 10px;
    color: #ef5350;
    font-size: 0.8rem;
}

/* Specific Field Styles */
.phone-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.country-select {
    width: 40px;
    /* Simulate dropdown chevron */
    text-align: center;
    color: #666;
}

.toggle-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: none;
    padding: 10px 0;
}

.label {
    color: #666;
    font-size: 1rem;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input { 
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
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #6200ea;
}

input:focus + .slider {
  box-shadow: 0 0 1px #6200ea;
}

input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Footer Button */
.footer-action {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 15px 20px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    z-index: 10;
}

.save-btn {
    width: 100%;
    background-color: #8c9eff; /* Light purple from image */
    color: white;
    border: none;
    padding: 15px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    text-transform: uppercase;
    cursor: pointer;
}

.save-btn:hover {
    background-color: #7c8def;
}
</style>
