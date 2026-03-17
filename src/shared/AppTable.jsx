import { useState } from 'react'
import './AppTable.css'

const AppTable = ({
  columns = [],
  data = [],
  rowKey,
  containerClassName = '',
  tableClassName = '',
  emptyMessage = 'No records found',
  emptyCellClassName = '',
  pageSize,
  showPagination = false,
  currentPage,
  onPageChange,
}) => {
  const [internalPage, setInternalPage] = useState(1)

  const totalItems = data.length
  const hasPagination = showPagination && pageSize && totalItems > pageSize
  const effectivePage = hasPagination ? (currentPage || internalPage) : 1
  const totalPages = hasPagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1

  const getRowKey = (row, index) => {
    if (typeof rowKey === 'function') return rowKey(row)
    if (typeof rowKey === 'string' && row && row[rowKey] != null) return row[rowKey]
    return index
  }

  const handlePageChange = (nextPage) => {
    if (!hasPagination) return
    if (nextPage < 1 || nextPage > totalPages) return

    if (onPageChange) {
      onPageChange(nextPage)
    }

    if (!currentPage) {
      setInternalPage(nextPage)
    }
  }

  const getPagedData = () => {
    if (!hasPagination) return data
    const start = (effectivePage - 1) * pageSize
    return data.slice(start, start + pageSize)
  }

  const rows = getPagedData()

  return (
    <div
      className={`app-table-container ${containerClassName}`.trim()}
      style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <table className={`app-table ${tableClassName}`.trim()}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.accessor || col.header}
                className={col.headerClassName}
                style={{ whiteSpace: 'nowrap' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length || 1}
                className={`${emptyCellClassName} app-table-empty-cell`.trim()}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)}>
                {columns.map((col) => (
                  <td
                    key={col.key || col.accessor || col.header}
                    className={col.cellClassName}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {hasPagination && (
        <div className="app-table-pagination">
          <button
            type="button"
            className="app-table-page-btn"
            onClick={() => handlePageChange(effectivePage - 1)}
            disabled={effectivePage <= 1}
          >
            Previous
          </button>
          <span className="app-table-page-info">
            Page {effectivePage} of {totalPages}
          </span>
          <button
            type="button"
            className="app-table-page-btn"
            onClick={() => handlePageChange(effectivePage + 1)}
            disabled={effectivePage >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AppTable

