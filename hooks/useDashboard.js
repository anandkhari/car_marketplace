import { useState, useCallback, useMemo } from 'react'
import Papa from 'papaparse'
import { parseCustomers } from '@/lib/analytics/parse'
import { filterCustomers } from '@/lib/analytics/filter'
import { computeKPIs, computeBucketStats } from '@/lib/analytics/metrics'

export function useDashboard() {
  const [allCustomers, setAllCustomers] = useState([])
  const [dateRange, setDateRange] = useState(90)
  const [percentile, setPercentile] = useState(50)
  const [repeatThreshold, setRepeatThreshold] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)

  const handleFileUpload = useCallback((file) => {
    setIsLoading(true)
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const customers = parseCustomers(results.data)
          if (customers.length === 0) {
            setError('No valid customers found in this file.')
            setIsLoading(false)
            return
          }
          setAllCustomers(customers)
          setFileName(file.name)
          setIsLoading(false)
        } catch (err) {
          setError('Failed to parse file. Please check the format.')
          setIsLoading(false)
        }
      },
      error: () => {
        setError('Failed to read file.')
        setIsLoading(false)
      }
    })
  }, [])

  const filteredCustomers = useMemo(() => {
    return filterCustomers(allCustomers, dateRange)
  }, [allCustomers, dateRange])

  const kpis = useMemo(() => {
    return computeKPIs(filteredCustomers, percentile, repeatThreshold)
  }, [filteredCustomers, percentile, repeatThreshold])

  const bucketStats = useMemo(() => {
    return computeBucketStats(filteredCustomers, percentile)
  }, [filteredCustomers, percentile])

  return {
    // state
    isLoading,
    error,
    fileName,
    dateRange,
    hasData: allCustomers.length > 0,
    percentile,
    repeatThreshold,
    // data
    kpis,
    bucketStats,
    filteredCustomers,
    // actions
    handleFileUpload,
    setDateRange,
    setPercentile,
    setRepeatThreshold,
  }
}