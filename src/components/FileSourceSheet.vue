<template>
  <div class="sheet-overlay" @click="$emit('close')">
    <div class="sheet-content" @click.stop>
      <div class="sheet-header">
        <h3 class="sheet-title">File from...</h3>
      </div>
      
      <div class="sheet-options">
        <div class="option-item" @click="$emit('select', 'camera')">
            <div class="icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                </svg>
            </div>
            <span class="label">Camera</span>
        </div>
        
        <div class="option-item" @click="$emit('select', 'gallery')">
            <div class="icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            </div>
            <span class="label">Gallery</span>
        </div>
        
        <div class="option-item" @click="$emit('select', 'storage')">
            <div class="icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
            <span class="label">Storage</span>
        </div>
        
        <div class="option-item" @click="$emit('select', 'drive')">
            <div class="icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22.61 7H14l-2-3H3.29a1 1 0 0 0-.92.62L.18 11h23.64l-1.21-4z" opacity="0.3"></path>
                    <path d="M12 22h8.08a2 2 0 0 0 1.94-1.5l1.83-6.5H.15l2.6 7.42A2 2 0 0 0 4.67 22H12z"></path>
                    <circle cx="12" cy="13" r="3" fill="white" stroke="none" opacity="0.5"></circle> <!-- Cloud aesthetic --> 
                </svg>
             </div>
            <span class="label">Drive</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center; /* Centered modal as per sketch? Or bottom sheet? Let's do centered modal based on 'popup' feel, but name implies sheet. Let's do Centered Card based on usual mobile patterns for 'select source'. */
  z-index: 2000;
}

.sheet-content {
  background: white;
  width: 80%;
  max-width: 320px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  animation: popIn 0.2s ease-out;
}

@keyframes popIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.sheet-header {
  margin-bottom: 20px;
}

.sheet-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.sheet-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
  cursor: pointer;
  /* border-bottom: 1px solid #f0f0f0; optional */
}
.option-item:hover {
    background-color: #f9f9f9;
    border-radius: 8px;
}

.icon-box {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background: #f5f5f5; */
}

.label {
    font-size: 1rem;
    color: #333;
    font-weight: 500;
}
</style>
