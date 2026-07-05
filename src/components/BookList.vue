<template>
  <main class="bookify-page">
    <!-- Startseite -->
    <section v-if="activePage === 'home'" class="home-page">
      <div class="home-hero">
        <div class="home-content">
          <p class="home-kicker">DEINE BÜCHER. DEINE GESCHICHTE.</p>

          <h1>
            Verfolge was du liest,<br />
            entdecke was du liebst.
          </h1>

          <p class="home-text">
            Füge Bücher hinzu, bewerte sie und behalte deinen Lesefortschritt im Blick.
          </p>

          <div class="home-buttons">
            <button @click="goToSearch" class="green-btn">
              Bücher entdecken
            </button>

            <button @click="goToBooks" class="outline-light-btn">
              Mein Regal
            </button>
          </div>
        </div>
      </div>

      <section class="empty-home-section" v-if="books.length === 0">
        <div>
          <p>Du hast noch keine Bücher hinzugefügt.</p>
          <button @click="goToSearch" class="green-btn">
            Jetzt starten
          </button>
        </div>
      </section>

      <section class="empty-home-section" v-else>
        <p>Du hast bereits {{ books.length }} Bücher in deinem Regal.</p>
      </section>
    </section>

    <!-- Suche -->
    <section v-else-if="activePage === 'search'" class="search-page">
      <div class="search-page-header">
        <p class="home-kicker">BUCHSUCHE</p>
        <h1>Bücher entdecken</h1>
        <p>
          Suche online nach Büchern und füge sie direkt deinem Regal hinzu.
        </p>
      </div>

      <div class="search-panel">
        <div class="search-bar">
          <input
            v-model="googleQuery"
            @keyup.enter="searchBooks"
            placeholder="Titel, Autor oder Thema suchen..."
          />

          <button @click="searchBooks" :disabled="isLoading" class="green-btn">
            {{ isLoading ? 'Suche...' : 'Suchen' }}
          </button>
        </div>

        <p v-if="searchError" class="error-text">{{ searchError }}</p>
      </div>

      <div v-if="searchResults.length > 0" class="results-grid">
        <article v-for="result in searchResults" :key="result.id" class="result-card">
          <img
            v-if="result.thumbnail"
            :src="result.thumbnail"
            alt="Buchcover"
            class="book-cover"
          />

          <div v-else class="cover-placeholder">
            Bookify
          </div>

          <div class="result-info">
            <strong>{{ result.title }}</strong>
            <span>{{ result.author }}</span>
            <small>{{ result.pages }} Seiten</small>
          </div>

          <select v-model="result.shelf" class="shelf-select">
            <option value="Möchte ich lesen">Möchte ich lesen</option>
            <option value="Wird gelesen">Wird gelesen</option>
            <option value="Gelesen">Gelesen</option>
          </select>

          <button @click="addFromSearch(result)" class="green-btn">
            Hinzufügen
          </button>
        </article>
      </div>
    </section>

    <!-- Profil -->
    <section v-else-if="activePage === 'profile'" class="profile-page">
      <div class="profile-hero">
        <div class="profile-inner">
          <div class="profile-avatar">
            📖
          </div>

          <div>
            <h1>Mein Leseprofil</h1>
            <p>{{ books.length }} Bücher · {{ readPagesCount }} Seiten gelesen</p>
          </div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <strong>{{ readBooksCount }}</strong>
          <span>✅ Gelesen</span>
        </div>

        <div class="profile-stat">
          <strong>{{ currentlyReadingCount }}</strong>
          <span>📖 Lese ich gerade</span>
        </div>

        <div class="profile-stat">
          <strong>{{ wantToReadCount }}</strong>
          <span>📚 Möchte ich lesen</span>
        </div>

        <div class="profile-stat">
          <strong>{{ ratedBooksCount }}</strong>
          <span>⭐ Bewertet</span>
        </div>
      </div>
    </section>

    <!-- Meine Bücher -->
    <section v-else class="library-goodreads">
      <aside class="bookshelf-sidebar">
        <h3>Bookshelves</h3>

        <button
          v-for="shelf in shelves"
          :key="shelf"
          @click="selectedShelf = shelf"
          :class="{ active: selectedShelf === shelf }"
          class="shelf-link"
        >
          {{ shelf }} ({{ countBooksByShelf(shelf) }})
        </button>
      </aside>

      <div class="books-table-area">
        <div class="books-page-header">
          <div>
            <p class="eyebrow">Bibliothek</p>
            <h2>Meine Bücher</h2>
          </div>

          <button @click="goToSearch" class="primary-btn small-btn">
            Buch hinzufügen
          </button>
        </div>

        <div class="library-search">
          <input v-model="searchQuery" placeholder="Meine Bücher durchsuchen..." />
        </div>

        <div v-if="editingBook" class="edit-form">
          <h3>Buch bearbeiten</h3>

          <div class="edit-fields">
            <input v-model="editingBook.title" placeholder="Titel" />
            <input v-model="editingBook.author" placeholder="Autor" />
            <input v-model.number="editingBook.pages" type="number" placeholder="Seiten" />

            <select v-model="editingBook.shelf" class="shelf-select">
              <option value="Möchte ich lesen">Möchte ich lesen</option>
              <option value="Wird gelesen">Wird gelesen</option>
              <option value="Gelesen">Gelesen</option>
            </select>
          </div>

          <div class="button-row">
            <button @click="updateBook" class="primary-btn">Speichern</button>
            <button @click="editingBook = null" class="danger-btn">Abbrechen</button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="books-table">
            <thead>
            <tr>
              <th>Cover</th>
              <th>Titel</th>
              <th>Autor</th>
              <th>Bewertung</th>
              <th>Bookshelf</th>
              <th>Rezension</th>
              <th>Aktionen</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="book in filteredBooks" :key="book.id">
              <td>
                <img
                  v-if="book.thumbnail"
                  :src="book.thumbnail"
                  alt="Buchcover"
                  class="table-cover"
                />

                <div v-else class="table-cover-placeholder">
                  Bookify
                </div>
              </td>

              <td class="book-title-cell">
                {{ book.title }}
              </td>

              <td>
                {{ book.author }}
              </td>

              <td>
                  <span v-if="Number(book.bewertung) > 0" class="rating-stars">
                    {{ '⭐'.repeat(Number(book.bewertung)) }}
                  </span>

                <span v-else class="empty-stars">
                    ☆☆☆☆☆
                  </span>
              </td>

              <td>
                <select
                  v-model="book.shelf"
                  @change="quickUpdateShelf(book)"
                  class="table-shelf-select"
                >
                  <option value="Möchte ich lesen">Möchte ich lesen</option>
                  <option value="Wird gelesen">Wird gelesen</option>
                  <option value="Gelesen">Gelesen</option>
                </select>
              </td>

              <td>
                <button @click="openBewertung(book)" class="review-button">
                  {{ book.kommentar ? 'Rezension bearbeiten' : 'Rezension schreiben' }}
                </button>

                <p v-if="book.kommentar" class="table-comment">
                  „{{ book.kommentar }}“
                </p>

                <div
                  v-if="bewertungBook && bewertungBook.id === book.id"
                  class="rating-form table-rating-form"
                >
                  <div class="star-picker">
                      <span
                        v-for="stern in 5"
                        :key="stern"
                        @click="bewertungBook.bewertung = stern"
                        :class="{ active: stern <= bewertungBook.bewertung }"
                      >
                        ⭐
                      </span>
                  </div>

                  <input
                    v-model="bewertungBook.kommentar"
                    placeholder="Kommentar schreiben..."
                  />

                  <div class="button-row">
                    <button @click="saveBewertung(book)" class="primary-btn">
                      Speichern
                    </button>

                    <button @click="bewertungBook = null" class="danger-btn">
                      Abbrechen
                    </button>
                  </div>
                </div>
              </td>

              <td class="table-actions">
                <button @click="startEdit(book)">
                  Bearbeiten
                </button>

                <button @click="deleteBook(book.id)" class="delete-text">
                  Löschen
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredBooks.length === 0" class="empty-state">
          <h3>Keine Bücher gefunden</h3>
          <p>Suche nach einem anderen Begriff oder wähle ein anderes Bookshelf.</p>
        </div>

        <details class="manual-add">
          <summary>Manuell hinzufügen</summary>

          <form @submit.prevent="addBook">
            <input v-model="newBook.title" placeholder="Titel" required />
            <input v-model="newBook.author" placeholder="Autor" required />
            <input v-model.number="newBook.pages" type="number" placeholder="Seiten" required />

            <select v-model="newBook.shelf" class="shelf-select">
              <option value="Möchte ich lesen">Möchte ich lesen</option>
              <option value="Wird gelesen">Wird gelesen</option>
              <option value="Gelesen">Gelesen</option>
            </select>

            <button type="submit" class="primary-btn">
              Hinzufügen
            </button>
          </form>
        </details>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BookList',

  data() {
    return {
      activePage: 'home' as 'home' | 'search' | 'books' | 'profile',

      books: [] as any[],

      newBook: {
        title: '',
        author: '',
        pages: 0,
        bewertung: 0,
        kommentar: '',
        thumbnail: null as string | null,
        shelf: 'Möchte ich lesen'
      },

      editingBook: null as any,
      bewertungBook: null as any,

      searchQuery: '',
      googleQuery: '',
      searchResults: [] as any[],

      isLoading: false,
      searchError: '',

      selectedShelf: 'Alle',
      shelves: ['Alle', 'Möchte ich lesen', 'Wird gelesen', 'Gelesen']
    }
  },

  computed: {
    filteredBooks() {
      const query = this.searchQuery.trim().toLowerCase()

      return this.books.filter((book: any) => {
        const matchesSearch =
          !query ||
          book.title?.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query)

        const matchesShelf =
          this.selectedShelf === 'Alle' ||
          book.shelf === this.selectedShelf

        return matchesSearch && matchesShelf
      })
    },

    readBooksCount() {
      return this.books.filter((book: any) => book.shelf === 'Gelesen').length
    },

    currentlyReadingCount() {
      return this.books.filter((book: any) => book.shelf === 'Wird gelesen').length
    },

    wantToReadCount() {
      return this.books.filter((book: any) => book.shelf === 'Möchte ich lesen').length
    },

    ratedBooksCount() {
      return this.books.filter((book: any) => Number(book.bewertung) > 0).length
    },

    readPagesCount() {
      return this.books
        .filter((book: any) => book.shelf === 'Gelesen')
        .reduce((sum: number, book: any) => sum + Number(book.pages || 0), 0)
    }
  },

  mounted() {
    this.loadBooks()
    window.addEventListener('bookify-navigation', this.handleNavigation as EventListener)
  },

  beforeUnmount() {
    window.removeEventListener('bookify-navigation', this.handleNavigation as EventListener)
  },

  methods: {
    getBaseUrl() {
      return import.meta.env.VITE_BACKEND_BASE_URL
    },

    handleNavigation(event: CustomEvent) {
      const page = event.detail

      if (page === 'home') {
        this.goToHome()
      }

      if (page === 'search') {
        this.goToSearch()
      }

      if (page === 'profile') {
        this.goToProfile()
      }
    },

    mapShelfValue(shelf: string | null | undefined) {
      const shelfMap: { [key: string]: string } = {
        All: 'Alle',
        'Want to Read': 'Möchte ich lesen',
        'Currently Reading': 'Wird gelesen',
        Read: 'Gelesen',
        Alle: 'Alle',
        'Möchte ich lesen': 'Möchte ich lesen',
        'Wird gelesen': 'Wird gelesen',
        Gelesen: 'Gelesen'
      }

      if (!shelf) {
        return 'Möchte ich lesen'
      }

      return shelfMap[shelf] || 'Möchte ich lesen'
    },

    normalizeBook(book: any) {
      return {
        ...book,
        bewertung: book.bewertung ?? 0,
        kommentar: book.kommentar ?? '',
        thumbnail: book.thumbnail ?? null,
        shelf: this.mapShelfValue(book.shelf)
      }
    },

    loadBooks() {
      fetch(`${this.getBaseUrl()}/books`)
        .then(response => response.json())
        .then(data => {
          this.books = data.map((book: any) => this.normalizeBook(book))
        })
        .catch(error => console.log(error))
    },

    goToHome() {
      this.activePage = 'home'
      this.editingBook = null
      this.bewertungBook = null
      this.searchQuery = ''
      this.selectedShelf = 'Alle'
    },

    goToSearch() {
      this.activePage = 'search'
      this.editingBook = null
      this.bewertungBook = null
    },

    goToProfile() {
      this.activePage = 'profile'
      this.editingBook = null
      this.bewertungBook = null
    },

    goToBooks() {
      this.activePage = 'books'
      this.searchQuery = ''
      this.editingBook = null
      this.bewertungBook = null
    },

    countBooksByShelf(shelf: string) {
      if (shelf === 'Alle') {
        return this.books.length
      }

      return this.books.filter((book: any) => book.shelf === shelf).length
    },

    searchBooks() {
      if (!this.googleQuery.trim()) return

      this.isLoading = true
      this.searchError = ''

      const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
      const keyPart = apiKey ? `&key=${apiKey}` : ''

      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        this.googleQuery
      )}&maxResults=8${keyPart}`

      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.searchResults = (data.items || []).map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title || 'Unbekannt',
            author: (item.volumeInfo.authors || ['Unbekannt']).join(', '),
            pages: item.volumeInfo.pageCount || 0,
            thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
            shelf: 'Möchte ich lesen'
          }))

          if (this.searchResults.length === 0) {
            this.searchError = 'Keine Ergebnisse gefunden.'
          }
        })
        .catch(error => {
          console.log(error)
          this.searchError = 'Die Suche konnte nicht geladen werden.'
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    addFromSearch(result: any) {
      const newBook = {
        title: result.title,
        author: result.author,
        pages: result.pages,
        bewertung: 0,
        kommentar: '',
        thumbnail: result.thumbnail,
        shelf: this.mapShelfValue(result.shelf)
      }

      fetch(`${this.getBaseUrl()}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      })
        .then(response => response.json())
        .then(saved => {
          this.books.push(this.normalizeBook({ ...newBook, ...saved }))

          this.searchResults = []
          this.googleQuery = ''
          this.activePage = 'books'
        })
        .catch(error => console.log(error))
    },

    addBook() {
      const newBook = {
        ...this.newBook,
        shelf: this.mapShelfValue(this.newBook.shelf)
      }

      fetch(`${this.getBaseUrl()}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      })
        .then(response => response.json())
        .then(book => {
          this.books.push(this.normalizeBook(book))

          this.newBook = {
            title: '',
            author: '',
            pages: 0,
            bewertung: 0,
            kommentar: '',
            thumbnail: null,
            shelf: 'Möchte ich lesen'
          }
        })
        .catch(error => console.log(error))
    },

    deleteBook(id: number) {
      fetch(`${this.getBaseUrl()}/books/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          this.books = this.books.filter(book => book.id !== id)
        })
        .catch(error => console.log(error))
    },

    startEdit(book: any) {
      this.editingBook = { ...book, shelf: this.mapShelfValue(book.shelf) }
      this.bewertungBook = null
    },

    updateBook() {
      const updatedBook = {
        ...this.editingBook,
        shelf: this.mapShelfValue(this.editingBook.shelf)
      }

      fetch(`${this.getBaseUrl()}/books/${this.editingBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBook)
      })
        .then(response => response.json())
        .then(updated => {
          const index = this.books.findIndex(book => book.id === updated.id)

          if (index !== -1) {
            this.books[index] = this.normalizeBook({
              ...this.books[index],
              ...updatedBook,
              ...updated
            })
          }

          this.editingBook = null
        })
        .catch(error => console.log(error))
    },

    openBewertung(book: any) {
      this.bewertungBook = { ...book, shelf: this.mapShelfValue(book.shelf) }
      this.editingBook = null
    },

    saveBewertung(book: any) {
      const updatedBook = {
        ...book,
        bewertung: Number(this.bewertungBook.bewertung),
        kommentar: this.bewertungBook.kommentar || '',
        shelf: this.mapShelfValue(book.shelf)
      }

      fetch(`${this.getBaseUrl()}/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBook)
      })
        .then(response => response.json())
        .then(saved => {
          const index = this.books.findIndex(item => item.id === book.id)

          if (index !== -1) {
            this.books[index] = this.normalizeBook({
              ...updatedBook,
              ...saved
            })
          }

          this.bewertungBook = null
        })
        .catch(error => console.log(error))
    },

    quickUpdateShelf(book: any) {
      const updatedBook = {
        ...book,
        shelf: this.mapShelfValue(book.shelf)
      }

      fetch(`${this.getBaseUrl()}/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBook)
      })
        .then(response => response.json())
        .then(saved => {
          const index = this.books.findIndex(item => item.id === book.id)

          if (index !== -1) {
            this.books[index] = this.normalizeBook({
              ...updatedBook,
              ...saved
            })
          }
        })
        .catch(error => console.log(error))
    }
  }
})
</script>

<style scoped>
.bookify-page {
  width: 100%;
  min-height: calc(100vh - 74px);
  margin: 0;
  padding: 0;
  background: #f4f0e8;
}

.green-btn {
  padding: 14px 28px;
  border-radius: 8px;
  background: #3f9654;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 1rem;
  transition: background 0.2s, transform 0.2s;
}

.green-btn:hover {
  background: #347c46;
  transform: translateY(-1px);
}

.green-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.primary-btn {
  padding: 12px 18px;
  border-radius: 8px;
  background: #3b2112;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
}

.primary-btn:hover {
  background: #2c170c;
}

.secondary-btn {
  padding: 12px 18px;
  border-radius: 8px;
  background: #3f9654;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 700;
}

.secondary-btn:hover {
  background: #347c46;
}

.danger-btn {
  padding: 12px 18px;
  border-radius: 8px;
  background: #f0d4cc;
  color: #8a2d20;
  border: none;
  cursor: pointer;
  font-weight: 700;
}

.danger-btn:hover {
  background: #e8c0b5;
}

.outline-light-btn {
  padding: 14px 28px;
  border-radius: 8px;
  background: transparent;
  color: #f8f2e8;
  border: 1px solid rgba(248, 242, 232, 0.35);
  cursor: pointer;
  font-weight: 800;
  font-size: 1rem;
}

.outline-light-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.small-btn {
  padding: 10px 14px;
}

.home-page {
  width: 100%;
  min-height: calc(100vh - 74px);
  background: #f4f0e8;
}

.home-hero {
  min-height: 520px;
  background-color: #3b2112;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  display: flex;
  align-items: center;
  padding: 70px 64px;
  box-sizing: border-box;
}

.home-content {
  max-width: 720px;
}

.home-kicker {
  color: #c69456;
  font-weight: 800;
  letter-spacing: 0.28em;
  font-size: 0.85rem;
  margin: 0 0 28px;
}

.home-content h1 {
  margin: 0;
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(3rem, 6vw, 5rem);
  line-height: 1.05;
  color: #f8f2e8;
}

.home-text {
  margin: 28px 0 34px;
  max-width: 500px;
  color: rgba(248, 242, 232, 0.75);
  font-size: 1.15rem;
  line-height: 1.7;
}

.home-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.empty-home-section {
  min-height: 180px;
  display: grid;
  place-items: center;
  text-align: center;
  background: white;
  color: #8a837b;
  font-size: 1.2rem;
  border-bottom: 1px solid #e5ddd1;
}

.empty-home-section p {
  margin: 0 0 18px;
}

.search-page {
  min-height: calc(100vh - 74px);
  padding: 80px 64px;
  background: #f4f0e8;
  box-sizing: border-box;
}

.search-page-header {
  max-width: 760px;
  margin-bottom: 32px;
}

.search-page-header h1 {
  margin: 0;
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(3rem, 6vw, 5rem);
  line-height: 1.05;
  color: #3b2112;
}

.search-page-header p {
  color: #7a6f66;
  font-size: 1.15rem;
  line-height: 1.6;
}

.search-panel {
  background: white;
  border-radius: 18px;
  padding: 24px;
  border: 1px solid #e5ddd1;
  max-width: 900px;
  margin-bottom: 30px;
  box-shadow: 0 18px 40px rgba(59, 33, 18, 0.08);
}

.search-bar {
  display: flex;
  gap: 12px;
}

.search-bar input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d8cfc3;
  border-radius: 10px;
  background: white;
  color: #3b2112;
  font-size: 1rem;
  outline: none;
}

.search-bar input:focus {
  border-color: #3f9654;
  box-shadow: 0 0 0 4px rgba(63, 150, 84, 0.14);
}

.error-text {
  margin: 12px 0 0;
  color: #9a2f20;
  font-weight: 600;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
  max-width: 1180px;
}

.result-card {
  background: white;
  border: 1px solid #e5ddd1;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(59, 33, 18, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}

.book-cover,
.cover-placeholder {
  width: 100%;
  height: 210px;
  border-radius: 12px;
  object-fit: cover;
}

.cover-placeholder {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #eadfce, #f8efe1);
  color: #8b6543;
  font-family: 'Times New Roman', Times, serif;
  font-weight: bold;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-info strong {
  color: #3b2112;
  font-size: 1.05rem;
}

.result-info span,
.result-info small {
  color: #76685b;
}

.profile-page {
  min-height: calc(100vh - 74px);
  background: #f4f0e8;
}

.profile-hero {
  background: #3b2112;
  padding: 80px 64px;
}

.profile-inner {
  display: flex;
  align-items: center;
  gap: 32px;
}

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  place-items: center;
  font-size: 3rem;
}

.profile-hero h1 {
  margin: 0;
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  color: #f8f2e8;
}

.profile-hero p {
  margin: 16px 0 0;
  color: rgba(248, 242, 232, 0.7);
  font-size: 1.2rem;
}

.profile-stats {
  background: white;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 38px 64px;
  border-bottom: 1px solid #e5ddd1;
}

.profile-stat {
  text-align: center;
  border-right: 1px solid #e5ddd1;
}

.profile-stat:last-child {
  border-right: none;
}

.profile-stat strong {
  display: block;
  font-family: 'Times New Roman', Times, serif;
  color: #3b2112;
  font-size: 2rem;
  margin-bottom: 10px;
}

.profile-stat span {
  color: #8a837b;
}

.library-goodreads {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 34px;
  align-items: flex-start;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 42px 0 70px;
}

.bookshelf-sidebar {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e5ddd1;
  border-radius: 18px;
  padding: 22px;
  position: sticky;
  top: 92px;
}

.bookshelf-sidebar h3 {
  margin: 0 0 14px;
  color: #1e1e1e;
  font-size: 1.15rem;
}

.shelf-link {
  display: block;
  width: 100%;
  padding: 8px 0;
  background: transparent;
  color: #00635d;
  text-align: left;
  border: none;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 600;
}

.shelf-link:hover,
.shelf-link.active {
  color: #3b2112;
  text-decoration: underline;
}

.books-table-area {
  min-width: 0;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5ddd1;
  border-radius: 18px;
  padding: 26px;
}

.books-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 20px;
}

.books-page-header h2 {
  margin: 0;
  color: #3b2112;
  font-family: 'Times New Roman', Times, serif;
  font-size: 2.6rem;
}

.eyebrow {
  margin: 0 0 8px;
  color: #9b6b3f;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.library-search {
  margin-bottom: 20px;
}

.library-search input {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid #d8cfc3;
  border-radius: 10px;
  background: white;
  color: #3b2112;
  outline: none;
  font-size: 1rem;
}

.library-search input:focus {
  border-color: #3f9654;
  box-shadow: 0 0 0 4px rgba(63, 150, 84, 0.14);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.books-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.books-table th {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 3px solid #eadfce;
  color: #3a2b22;
  font-size: 0.95rem;
}

.books-table td {
  padding: 14px 8px;
  border-bottom: 1px solid #ece6dc;
  vertical-align: top;
  color: #3b2112;
}

.table-cover,
.table-cover-placeholder {
  width: 58px;
  height: 86px;
  object-fit: cover;
  border-radius: 4px;
}

.table-cover-placeholder {
  display: grid;
  place-items: center;
  background: #f1e6d7;
  color: #7a5a3a;
  font-family: 'Times New Roman', Times, serif;
  font-size: 0.75rem;
  font-weight: bold;
}

.book-title-cell {
  color: #00635d;
  font-size: 1.05rem;
  font-weight: 700;
}

.rating-stars {
  white-space: nowrap;
}

.empty-stars {
  color: #cfcfcf;
  letter-spacing: 1px;
  font-size: 1.2rem;
}

.table-shelf-select,
.shelf-select {
  padding: 8px 10px;
  border: 1px solid #d8cfc3;
  border-radius: 8px;
  background: white;
  color: #00635d;
  font-weight: 600;
  outline: none;
}

.table-shelf-select:focus,
.shelf-select:focus {
  border-color: #3f9654;
  box-shadow: 0 0 0 4px rgba(63, 150, 84, 0.14);
}

.review-button {
  background: transparent;
  border: none;
  color: #00635d;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  padding: 0;
}

.review-button:hover {
  text-decoration: underline;
}

.table-comment {
  margin: 8px 0 0;
  color: #6d5d4f;
  font-size: 0.9rem;
  font-style: italic;
}

.rating-form {
  background: #fffaf3;
  border: 1px solid #eadfce;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 22px;
}

.table-rating-form {
  margin-top: 12px;
  max-width: 360px;
}

.rating-form input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d8cfc3;
  border-radius: 10px;
  outline: none;
  box-sizing: border-box;
}

.rating-form input:focus {
  border-color: #3f9654;
  box-shadow: 0 0 0 4px rgba(63, 150, 84, 0.14);
}

.star-picker {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.star-picker span {
  cursor: pointer;
  opacity: 0.28;
  font-size: 1.45rem;
}

.star-picker span.active {
  opacity: 1;
}

.table-actions {
  white-space: nowrap;
}

.table-actions button {
  display: block;
  margin-bottom: 8px;
  background: transparent;
  border: none;
  color: #00635d;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.table-actions button:hover {
  text-decoration: underline;
}

.table-actions .delete-text {
  color: #9a2f20;
}

.edit-form,
.manual-add {
  background: #fffaf3;
  border: 1px solid #eadfce;
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 22px;
}

.edit-form h3,
.empty-state h3 {
  margin: 0 0 12px;
  font-weight: 800;
  color: #3b2112;
}

.edit-fields,
.manual-add form {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto auto;
  gap: 12px;
}

.edit-fields input,
.manual-add input {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid #d8cfc3;
  border-radius: 10px;
  background: white;
  color: #3b2112;
  outline: none;
  box-sizing: border-box;
}

.edit-fields input:focus,
.manual-add input:focus {
  border-color: #3f9654;
  box-shadow: 0 0 0 4px rgba(63, 150, 84, 0.14);
}

.button-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.empty-state {
  padding: 34px;
  text-align: center;
  background: white;
  border-radius: 20px;
  border: 1px dashed #cbb89f;
  color: #6d5d4f;
  margin-top: 20px;
}

.manual-add summary {
  cursor: pointer;
  font-weight: 800;
  color: #4f3b2d;
}

.manual-add form {
  margin-top: 14px;
}

@media (max-width: 950px) {
  .library-goodreads {
    grid-template-columns: 1fr;
  }

  .bookshelf-sidebar {
    position: static;
  }

  .books-table {
    min-width: 850px;
  }

  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .profile-stat {
    border-right: none;
  }
}

@media (max-width: 800px) {
  .home-hero,
  .search-page,
  .profile-hero {
    padding: 54px 24px;
  }

  .profile-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-stats {
    padding: 28px 24px;
  }
}

@media (max-width: 650px) {
  .home-content h1,
  .search-page-header h1 {
    font-size: 2.8rem;
  }

  .home-buttons {
    flex-direction: column;
  }

  .search-bar {
    flex-direction: column;
  }

  .books-page-header {
    flex-direction: column;
  }

  .edit-fields,
  .manual-add form {
    grid-template-columns: 1fr;
  }

  .green-btn,
  .outline-light-btn,
  .primary-btn,
  .secondary-btn,
  .danger-btn {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .profile-stats {
    grid-template-columns: 1fr;
  }

  .profile-avatar {
    width: 90px;
    height: 90px;
    font-size: 2.4rem;
  }
}
</style>

