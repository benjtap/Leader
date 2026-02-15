<template>
  <div class="page-container">
    <div class="header">
      <h1>My Notes</h1>
    </div>
    <div class="content">
      <div class="placeholder-message">
        <p>Your personal notes will appear here.</p>
        <button @click="$router.push('/dashboard')" class="back-btn">Back to Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  margin-bottom: 20px;
}

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.placeholder-message {
  text-align: center;
  color: #666;
}

.back-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #6200ea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
