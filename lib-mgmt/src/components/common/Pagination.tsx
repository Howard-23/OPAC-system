import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  totalItems?: number
}

export function Pagination({ currentPage, totalPages, onPageChange, pageSize = 10, totalItems }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const getVisiblePages = () => {
    if (totalPages <= 7) return pages

    if (currentPage <= 4) {
      return [...pages.slice(0, 5), '...', totalPages]
    } else if (currentPage >= totalPages - 3) {
      return [1, '...', ...pages.slice(-5)]
    } else {
      return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
    }
  }

  const visiblePages = getVisiblePages()

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems || 0)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1}-{endIndex} of {totalItems || 0} items
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {visiblePages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`
              min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${page === currentPage
                ? 'bg-primary-600 text-white'
                : page === '...'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {page}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}
