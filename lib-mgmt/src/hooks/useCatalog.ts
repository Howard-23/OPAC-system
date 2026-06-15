import { useState } from 'react'

interface Book {
  id: string
  isbn: string
  title: string
  author: string
  publisher: string
  publishYear: number
  category: string
  genre: string
  description: string
  coverImage?: string
  totalCopies: number
  availableCopies: number
  location: string
  createdAt: string
  updatedAt: string
}

interface CatalogContextType {
  books: Book[]
  loading: boolean
  error: string | null
  fetchBooks: () => Promise<void>
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateBook: (id: string, book: Partial<Book>) => Promise<void>
  deleteBook: (id: string) => Promise<void>
  searchBooks: (query: string) => Book[]
}

export const useCatalog = (): CatalogContextType => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setBooks([
        {
          id: '1',
          isbn: '978-0-06-112008-4',
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          publisher: 'J.B. Lippincott & Co.',
          publishYear: 1960,
          category: 'Fiction',
          genre: 'Classic Literature',
          description: 'A novel about the serious issues of rape and racial inequality.',
          totalCopies: 5,
          availableCopies: 3,
          location: 'A-101',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-05-01T14:30:00Z',
        },
        {
          id: '2',
          isbn: '978-0-452-28423-4',
          title: '1984',
          author: 'George Orwell',
          publisher: 'Secker & Warburg',
          publishYear: 1949,
          category: 'Fiction',
          genre: 'Dystopian',
          description: 'A dystopian social science fiction novel and cautionary tale.',
          totalCopies: 4,
          availableCopies: 2,
          location: 'A-102',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-05-02T09:15:00Z',
        },
      ])
    } catch (err) {
      setError('Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }

  const addBook = async (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setBooks(prev => [...prev, newBook])
  }

  const updateBook = async (id: string, book: Partial<Book>) => {
    setBooks(prev =>
      prev.map(b => (b.id === id ? { ...b, ...book, updatedAt: new Date().toISOString() } : b))
    )
  }

  const deleteBook = async (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id))
  }

  const searchBooks = (query: string): Book[] => {
    if (!query) return books
    const lowerQuery = query.toLowerCase()
    return books.filter(
      book =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.isbn.includes(lowerQuery) ||
        book.category.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    books,
    loading,
    error,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    searchBooks,
  }
}
