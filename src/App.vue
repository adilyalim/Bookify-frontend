<script setup lang="ts">
import BookList from './components/BookList.vue'
</script>

<template>
  <div id="app">
    <header class="app-header">
    <h1>📚 Bookify</h1>
    </header>
    <BookList />
  </div>
</template>

<style scoped>
#app {
  font-family: 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}
.app-header {
  padding: 20px 40px;
  text-align: left;
  border-bottom: 1px solid #eee;
  width: 100%;
  box-sizing: border-box;
}
.app-header h1 {
  margin: 0;
  font-size: 1.5em;
  color: #2c3e50;
}
</style>
