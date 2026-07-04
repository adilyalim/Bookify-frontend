<template>
  <div class="book-list">
    <h2>📚 Meine Bücher</h2>

    <!-- Buch Suche -->
    <div class="search-section">
      <div class="search-bar">
        <input v-model="googleQuery" placeholder="🔍 Buch suchen..." />
        <button @click="searchBooks">Suchen</button>
      </div>

      <div v-if="searchResults.length > 0" class="search-results">
        <div v-for="result in searchResults" :key="result.id" class="search-result-item">
          <img v-if="result.thumbnail" :src="result.thumbnail" alt="cover" class="book-cover" />
          <div class="result-info">
            <strong>{{ result.title }}</strong>
            <span>{{ result.author }}</span>
            <span class="result-pages">{{ result.pages }} Seiten</span>
          </div>
          <button @click="addFromSearch(result)" class="add-btn">+ Hinzufügen</button>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <input v-model="searchQuery" placeholder="📚 Meine Bücher filtern..." class="filter-input" />

    <!-- Edit Form -->
    <div v-if="editingBook" class="edit-form">
      <div class="edit-fields">
        <input v-model="editingBook.title" placeholder="Titel" />
        <input v-model="editingBook.author" placeholder="Autor" />
        <input v-model.number="editingBook.pages" type="number" placeholder="Seiten" />
      </div>
      <div class="edit-buttons">
        <button @click="updateBook">Speichern</button>
        <button @click="editingBook = null" class="cancel-btn">Abbrechen</button>
      </div>
    </div>

    <!-- Buch Liste -->
    <ul>
      <li v-for="book in filteredBooks" :key="book.id" class="book-item">
        <img v-if="book.thumbnail" :src="book.thumbnail" alt="cover" class="book-cover-small" />
        <div class="book-info">
          <div class="book-title-row">
            <strong>{{ book.title }}</strong>
            <span class="author"> – {{ book.author }}</span>
            <span class="pages">{{ book.pages }} Seiten</span>
          </div>
          <div v-if="Number(book.bewertung) > 0" class="sterne">
            {{ '⭐'.repeat(Number(book.bewertung)) }}
          </div>
          <div v-if="book.kommentar" class="kommentar">„{{ book.kommentar }}"</div>

          <!-- Bewertung Form -->
          <div v-if="bewertungBook && bewertungBook.id === book.id" class="bewertung-form">
            <div class="stern-auswahl">
              <span
                v-for="stern in 5"
                :key="stern"
                @click="bewertungBook.bewertung = stern"
                :class="{ aktiv: stern <= bewertungBook.bewertung }"
                class="stern"
              >⭐</span>
            </div>
            <input v-model="bewertungBook.kommentar" placeholder="Kommentar..." class="kommentar-input" />
            <div class="bewertung-buttons">
              <button @click="saveBewertung(book)" class="save-btn">Speichern</button>
              <button @click="bewertungBook = null" class="cancel-btn">Abbrechen</button>
            </div>
          </div>
        </div>

        <div class="book-actions">
          <button @click="openBewertung(book)" title="Bewerten">⭐</button>
          <button @click="startEdit(book)">✏️</button>
          <button @click="deleteBook(book.id)">🗑️</button>
        </div>
      </li>
    </ul>

    <!-- Manuel Hinzufügen -->
    <details class="manual-add">
      <summary>➕ Manuell hinzufügen</summary>
      <form @submit.prevent="addBook">
        <input v-model="newBook.title" placeholder="Titel" required />
        <input v-model="newBook.author" placeholder="Autor" required />
        <input v-model.number="newBook.pages" type="number" placeholder="Seiten" required />
        <button type="submit">Hinzufügen</button>
      </form>
    </details>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BookList',
  data() {
    return {
      books: [] as any[],
      newBook: { title: '', author: '', pages: 0 },
      editingBook: null as any,
      bewertungBook: null as any,
      searchQuery: '',
      googleQuery: '',
      searchResults: [] as any[]
    }
  },
  computed: {
    filteredBooks() {
      return this.books.filter(book =>
        book.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
    fetch(`${baseUrl}/books`)
      .then(response => response.json())
      .then(data => { this.books = data })
      .catch(error => console.log(error))
  },
  methods: {
    searchBooks() {
      if (!this.googleQuery) return
      const apiKey = 'AIzaSyDEKn3e7zOp8h37gM0yPqf-2TA7ddr-u_0'
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(this.googleQuery)}&maxResults=5&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          this.searchResults = (data.items || []).map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title || 'Unbekannt',
            author: (item.volumeInfo.authors || ['Unbekannt']).join(', '),
            pages: item.volumeInfo.pageCount || 0,
            thumbnail: item.volumeInfo.imageLinks?.thumbnail || null
          }))
        })
        .catch(error => console.log(error))
    },
    addFromSearch(result: any) {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

      fetch(`${baseUrl}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          author: result.author,
          pages: result.pages,
          bewertung: 0,
          kommentar: ''
        })
      })
        .then(response => response.json())
        .then(saved => {
          this.books.push({
            ...saved,
            bewertung: saved.bewertung ?? 0,
            kommentar: saved.kommentar ?? '',
            thumbnail: result.thumbnail
          })

          this.searchResults = []
          this.googleQuery = ''
        })
        .catch(error => console.log(error))
    },

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
      fetch(`${baseUrl}/books/${id}`, { method: 'DELETE' })
        .then(() => { this.books = this.books.filter(book => book.id !== id) })
        .catch(error => console.log(error))
    },
    startEdit(book: any) {
      this.editingBook = { ...book }
      this.bewertungBook = null
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
    },
    openBewertung(book: any) {
      this.bewertungBook = { ...book }
      this.editingBook = null
    },
    saveBewertung(book: any) {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

      const updated = {
        ...book,
        bewertung: Number(this.bewertungBook.bewertung),
        kommentar: this.bewertungBook.kommentar || ''
      }

      fetch(`${baseUrl}/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
        .then(response => response.json())
        .then(saved => {
          const index = this.books.findIndex(b => b.id === book.id)

          if (index !== -1) {
            this.books[index] = {
              ...book,
              ...saved,
              bewertung: updated.bewertung,
              kommentar: updated.kommentar,
              thumbnail: book.thumbnail
            }
          }

          this.bewertungBook = null
        })
        .catch(error => console.log(error))
    }
  }
})
</script>

<style scoped>
.book-list {
  max-width: 750px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Segoe UI', Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.8em;
  color: #2c3e50;
}

.search-section { margin-bottom: 24px; }

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.search-bar input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95em;
}

.search-bar button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.search-bar button:hover { background-color: #2980b9; }

.search-results {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.book-cover {
  width: 45px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.book-cover-small {
  width: 35px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  align-self: flex-start;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9em;
}

.result-pages { color: gray; font-size: 0.85em; }

.add-btn {
  padding: 6px 14px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.add-btn:hover { background-color: #369870; }

.filter-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95em;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.edit-form {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff8e1;
  border-radius: 12px;
  border: 1px solid #ffe082;
}

.edit-fields {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.edit-fields input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 120px;
}

.edit-buttons {
  display: flex;
  gap: 8px;
}

.edit-buttons button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

ul {
  list-style: none;
  padding: 0;
  margin-bottom: 24px;
}

.book-item {
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 10px;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.book-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.author { color: #555; }

.pages {
  color: gray;
  font-size: 0.88em;
  margin-left: auto;
}

.sterne { font-size: 0.9em; }

.kommentar {
  font-size: 0.82em;
  color: #888;
  font-style: italic;
}

.bewertung-form {
  margin-top: 8px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bee3f8;
}

.stern-auswahl {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.stern {
  cursor: pointer;
  opacity: 0.3;
  font-size: 1.4em;
}

.stern.aktiv { opacity: 1; }

.kommentar-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
  box-sizing: border-box;
  font-size: 0.9em;
}

.bewertung-buttons {
  display: flex;
  gap: 8px;
}

.save-btn {
  padding: 6px 14px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  padding: 6px 14px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.book-actions {
  display: flex;
  gap: 4px;
  align-self: flex-start;
}

.book-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  opacity: 0.4;
}

.book-actions button:hover { opacity: 1; }

.manual-add { margin-top: 10px; }

.manual-add summary {
  cursor: pointer;
  color: #666;
  font-size: 0.9em;
  margin-bottom: 12px;
}

.manual-add form {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.manual-add input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95em;
}

.manual-add button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
</style>
