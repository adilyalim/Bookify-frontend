<template>
  <div class="book-list">
    <h2>📚 Meine Bücher</h2>

    <form @submit.prevent="addBook">
      <input v-model="newBook.title" placeholder="Titel" required />
      <input v-model="newBook.author" placeholder="Autor" required />
      <input v-model.number="newBook.pages" type="number" placeholder="Seiten" required />
      <button type="submit">Hinzufügen</button>
    </form>

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
      books: [] as any[],
      newBook: {
        title: '',
        author: '',
        pages: 0
      }
    }
  },
  mounted() {
    const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
    fetch(`${baseUrl}/books`)
      .then(response => response.json())
      .then(data => {
        this.books = data
      })
      .catch(error => console.log(error))
  },
  methods: {
    addBook() {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

      fetch(`${baseUrl}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newBook)
      })
        .then(response => response.json())
        .then(book => {
          this.books.push(book)
          this.newBook = { title: '', author: '', pages: 0 }
        })
        .catch(error => console.log(error))
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

form {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
input {
  flex: 1;
  padding: 8px;
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
