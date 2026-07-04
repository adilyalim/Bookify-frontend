<template>
  <div class="book-list">
    <h2>📚 Meine Bücher</h2>

    <form @submit.prevent="addBook">
      <input v-model="newBook.title" placeholder="Titel" required />
      <input v-model="newBook.author" placeholder="Autor" required />
      <input v-model.number="newBook.pages" type="number" placeholder="Seiten" required />
      <button type="submit">Hinzufügen</button>
    </form>

    <div v-if="editingBook" class="edit-form">
      <input v-model="editingBook.title" placeholder="Titel" />
      <input v-model="editingBook.author" placeholder="Autor" />
      <input v-model.number="editingBook.pages" type="number" placeholder="Seiten" />
      <button @click="updateBook">Speichern</button>
      <button @click="editingBook = null">Abbrechen</button>
    </div>

    <ul>
      <li v-for="book in books" :key="book.id" class="book-item">
        <span class="book-info">{{ book.title }} – {{ book.author }}</span>
        <span class="pages">({{ book.pages }} Seiten)</span>
        <button @click="startEdit(book)">✏️</button>
        <button @click="deleteBook(book.id)">🗑️</button>
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
      },
      editingBook: null as any
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
    },
    deleteBook(id: number) {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

      fetch(`${baseUrl}/books/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          this.books = this.books.filter(book => book.id !== id)
        })
        .catch(error => console.log(error))
    },
    startEdit(book: any) {
      this.editingBook = { ...book }
    },
    updateBook() {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

      fetch(`${baseUrl}/books/${this.editingBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.editingBook)
      })
        .then(response => response.json())
        .then(updated => {
          const index = this.books.findIndex(b => b.id === updated.id)
          this.books[index] = updated
          this.editingBook = null
        })
        .catch(error => console.log(error))
    }
  }
})
</script>

<style scoped>
.book-list {
  max-width: 700px;
  margin: 60px auto;
  padding: 0 20px;
  font-family: 'Segoe UI',Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

form, .edit-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}
input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95em;
}
input:focus {
  outline: none;
  border-color: #42b983;
}

form button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

form button:hover {
  background-color: #369870;
}

ul {
  list-style: none;
  padding: 0;
}

.book-item {
  padding: 16px 20px;
  margin: 10px 0;
  border: none;
  border-radius: 10px;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 16px;
}

.book-info {
  flex: 1;
}

.book-item button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  opacity: 0.5;
  margin-left: 12px;
}

.book-item button:hover {
  opacity: 1;
}

.pages {
  width: 100px;
  text-align: right;
  color: gray;
  font-size: 0.9em;
}
</style>
