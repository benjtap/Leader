<template>
  <div class="list-view-content">
    <div class="panel list-panel">
      <div class="panel-header">
        <div>
          <h2>{{ title }} <span v-if="items.length">({{ items.length }})</span></h2>
        </div>
        <div class="header-actions">
           <span class="dots-icon">⋮</span>
        </div>
      </div>

      <div class="list-items">
        <div v-if="items.length === 0" class="empty-state">
           No items found.
        </div>
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="list-item"
        >
          <div class="item-row">
            <div class="avatar" :style="{ backgroundColor: item.color || '#ccc' }">
              <span v-if="!item.isIcon">{{ item.initial }}</span>
              <span v-else>👤</span>
            </div>
            
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="sub-text">{{ item.phone || item.sub }}</div>
              <div v-if="item.vip" class="vip-badge">VIP</div>
            </div>

            <div class="meta">
              <span class="more-options">⋮</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  items: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.list-view-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}

.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 15px;
  flex: 1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.header-actions {
  font-size: 1.25rem;
  color: #666;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  background: white;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.info {
  flex: 1;
}

.name {
  font-weight: 500;
  font-size: 1rem;
}

.sub-text {
  font-size: 0.85rem;
  color: #888;
}

.vip-badge {
    display: inline-block;
    background: #ffc107;
    color: #333;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    margin-top: 2px;
}

.meta {
  color: #888;
}

.empty-state {
    text-align: center;
    color: #999;
    margin-top: 50px;
}
</style>
