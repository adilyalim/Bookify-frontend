<script setup lang="ts">
import BookList from './components/BookList.vue'

function goTo(page: 'home' | 'search' | 'profile') {
  window.dispatchEvent(
    new CustomEvent('bookify-navigation', {
      detail: page
    })
  )
}
</script>

<template>
  <div id="app">
    <header class="app-header">
      <button class="logo" @click="goTo('home')">
        Bookify
      </button>

      <nav class="nav">
        <button @click="goTo('home')">Startseite</button>
        <button @click="goTo('search')">Suche</button>
        <button @click="goTo('profile')">Profil</button>
      </nav>
    </header>

    <BookList />
  </div>
</template>

<style scoped>
.app-header {
  width: 100%;
  padding: 18px 64px;
  background: #3b2112;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.logo {
  font-family: 'Times New Roman', Times, serif;
  font-size: 2rem;
  font-weight: bold;
  color: #f8f2e8;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav button {
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #e9ded1;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.nav button:hover {
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 700px) {
  .app-header {
    padding: 16px 24px;
    flex-direction: column;
    gap: 14px;
    align-items: flex-start;
  }

  .nav {
    width: 100%;
  }

  .nav button {
    padding: 10px 12px;
  }
}
</style>
