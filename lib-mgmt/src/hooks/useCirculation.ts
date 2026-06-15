import { useState } from 'react'

interface Transaction {
  id: string
  transactionId: string
  bookId: string
  bookTitle: string
  memberId: string
  memberName: string
  type: 'checkout' | 'checkin' | 'renew'
  status: 'active' | 'returned' | 'overdue'
  checkoutDate: string
  dueDate: string
  returnDate?: string
  fine?: number
  notes?: string
  processedBy: string
  createdAt: string
  updatedAt: string
}

interface CirculationContextType {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  fetchTransactions: () => Promise<void>
  checkoutBook: (bookId: string, memberId: string) => Promise<void>
  returnBook: (transactionId: string) => Promise<void>
  renewLoan: (transactionId: string) => Promise<void>
  getOverdueTransactions: () => Transaction[]
  getActiveTransactions: () => Transaction[]
}

export const useCirculation = (): CirculationContextType => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTransactions([
        {
          id: '1',
          transactionId: 'TXN-2024-001',
          bookId: 'BK001',
          bookTitle: 'To Kill a Mockingbird',
          memberId: 'MEM001',
          memberName: 'John Smith',
          type: 'checkout',
          status: 'active',
          checkoutDate: '2024-04-15T10:00:00Z',
          dueDate: '2024-05-15T10:00:00Z',
          returnDate: undefined,
          fine: undefined,
          notes: undefined,
          processedBy: 'admin',
          createdAt: '2024-04-15T10:00:00Z',
          updatedAt: '2024-04-15T10:00:00Z',
        },
        {
          id: '2',
          transactionId: 'TXN-2024-002',
          bookId: 'BK002',
          bookTitle: '1984',
          memberId: 'MEM001',
          memberName: 'John Smith',
          type: 'checkout',
          status: 'active',
          checkoutDate: '2024-04-20T14:30:00Z',
          dueDate: '2024-05-20T14:30:00Z',
          returnDate: undefined,
          fine: undefined,
          notes: undefined,
          processedBy: 'librarian',
          createdAt: '2024-04-20T14:30:00Z',
          updatedAt: '2024-04-20T14:30:00Z',
        },
        {
          id: '3',
          transactionId: 'TXN-2024-003',
          bookId: 'BK003',
          bookTitle: 'The Great Gatsby',
          memberId: 'MEM002',
          memberName: 'Jane Doe',
          type: 'checkout',
          status: 'overdue',
          checkoutDate: '2024-04-01T09:00:00Z',
          dueDate: '2024-05-01T09:00:00Z',
          returnDate: undefined,
          fine: 5.50,
          notes: 'Overdue by 2 days',
          processedBy: 'librarian',
          createdAt: '2024-04-01T09:00:00Z',
          updatedAt: '2024-05-03T09:00:00Z',
        },
      ])
    } catch (err) {
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const checkoutBook = async (bookId: string, memberId: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      transactionId: `TXN-${Date.now()}`,
      bookId,
      bookTitle: 'Sample Book',
      memberId,
      memberName: 'Sample Member',
      type: 'checkout',
      status: 'active',
      checkoutDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      processedBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTransactions(prev => [...prev, newTransaction])
  }

  const returnBook = async (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? { ...t, status: 'returned', returnDate: new Date().toISOString() }
          : t
      )
    )
  }

  const renewLoan = async (transactionId: string) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? { ...t, dueDate: new Date(new Date(t.dueDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() }
          : t
      )
    )
  }

  const getOverdueTransactions = () => {
    const now = new Date()
    return transactions.filter(
      t => t.status === 'overdue' || (t.status === 'active' && new Date(t.dueDate) < now)
    )
  }

  const getActiveTransactions = () => {
    return transactions.filter(t => t.status === 'active')
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    checkoutBook,
    returnBook,
    renewLoan,
    getOverdueTransactions,
    getActiveTransactions,
  }
}
