<template>
  <div class="book-list">
    <h2>📚 Meine Bücher</h2>
    <ul>
      <li v-for="book in books" :key="book.id" class="book-item">
        <strong>{{ book.title }}</strong>
        <span> – {{ book.author }}</span>
        <span class="pages">({{ book.pages }} Seiten)</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BookList',
  data() {
    return {
      books: [
        { id: 1, title: 'Der kleine Prinz', author: 'Antoine de Saint-Exupéry', pages: 96 },
        { id: 2, title: '1984', author: 'George Orwell', pages: 384 },
        { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', pages: 443 },
      ]
    }
  }
})
</script>

<style scoped>
.book-list {
  max-width: 500px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
}

ul {
  list-style: none;
  padding: 0;
}

.book-item {
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.pages {
  color: gray;
  margin-left: 8px;
  font-size: 0.9em;
}
</style>
