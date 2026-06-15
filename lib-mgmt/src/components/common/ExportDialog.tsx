import { useState } from 'react'
import { Download, X } from 'lucide-react'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: string, dateRange: string, includeCharts: boolean, includeTables: boolean, includeSummary: boolean) => void
}

export function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const [format, setFormat] = useState('PDF')
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeTables, setIncludeTables] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    onExport(format, dateRange, includeCharts, includeTables, includeSummary)
    setTimeout(() => {
      setIsExporting(false)
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Export Report</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface-alt rounded-lg"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-dark-text-muted" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="input"
            >
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="CSV">CSV</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input"
            >
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 3 months">Last 3 months</option>
              <option value="Last year">Last year</option>
              <option value="Custom">Custom range</option>
            </select>
          </div>

          {/* Include Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Include
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-muted">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600"
                />
                Charts
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-muted">
                <input
                  type="checkbox"
                  checked={includeTables}
                  onChange={(e) => setIncludeTables(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600"
                />
                Tables
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-muted">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600"
                />
                Summary
              </label>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-border-dark">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn btn-primary flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
