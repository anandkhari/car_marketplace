import { useCallback } from 'react'

export default function UploadZone({ onFileUpload, isLoading }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      onFileUpload(file)
    }
  }, [onFileUpload])

  const handleChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file) onFileUpload(file)
  }, [onFileUpload])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-medium text-gray-900 mb-1">
            Booking frequency dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Car detailing marketplace · customer cohort analysis
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-white hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
          onClick={() => document.getElementById('csvInput').click()}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Parsing your data...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drop your CSV file here
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Stripe customer export format
              </p>
            </div>
          )}
        </div>

        <input
          id="csvInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  )
}