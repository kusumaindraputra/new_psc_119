import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

// Light SSE client that listens to server events and surfaces toasts/refresh signals
export default function SSEProvider() {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const eventSourceRef = useRef(null)
  const maxReconnectAttempts = 10
  const baseDelay = 1000 // 1 second

  useEffect(() => {
    if (!user) {
      cleanup()
      return
    }
    
    const token = localStorage.getItem('token')
    if (!token) {
      cleanup()
      return
    }

    connectSSE(token)

    return () => {
      cleanup()
    }
  }, [user])

  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
  }

  const getReconnectDelay = () => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), 30000)
    return delay
  }

  const connectSSE = (token) => {
    try {
      const url = `/api/stream/events?token=${encodeURIComponent(token)}`
      const es = new EventSource(url)
      eventSourceRef.current = es

      es.addEventListener('connected', (e) => {
        console.log('[SSE] Connected to event stream')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0 // Reset attempts on successful connection
      })

      es.addEventListener('heartbeat', () => {
        // keep-alive, no-op
      })

      es.addEventListener('new_report', (e) => {
        try {
          const data = JSON.parse(e.data)
          toast.info(`Laporan baru: ${data?.category?.name || ''}`)
          window.dispatchEvent(new CustomEvent('psc119:new_report', { detail: data }))
        } catch (err) {
          console.error('[SSE] Error parsing new_report event:', err)
        }
      })

      es.addEventListener('assigned_task', (e) => {
        try {
          const data = JSON.parse(e.data)
          toast.success('Tugas baru ditugaskan')
          window.dispatchEvent(new CustomEvent('psc119:assigned_task', { detail: data }))
        } catch (err) {
          console.error('[SSE] Error parsing assigned_task event:', err)
        }
      })

      es.addEventListener('report_update', (e) => {
        try {
          const data = JSON.parse(e.data)
          toast.info('Laporan diperbarui')
          window.dispatchEvent(new CustomEvent('psc119:report_update', { detail: data }))
        } catch (err) {
          console.error('[SSE] Error parsing report_update event:', err)
        }
      })

      es.onerror = (error) => {
        console.error('[SSE] Connection error:', error)
        setIsConnected(false)
        
        // Close the errored connection
        try {
          es.close()
        } catch (closeErr) {
          console.error('[SSE] Error closing EventSource:', closeErr)
        }

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = getReconnectDelay()
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            const currentToken = localStorage.getItem('token')
            if (currentToken) {
              connectSSE(currentToken)
            }
          }, delay)
        } else {
          console.error('[SSE] Max reconnection attempts reached')
          // Only show error toast once after max attempts
          if (reconnectAttemptsRef.current === maxReconnectAttempts) {
            toast.error('Koneksi notifikasi terputus. Silakan refresh halaman.')
          }
        }
      }

    } catch (err) {
      console.error('[SSE] Failed to create EventSource:', err)
      setIsConnected(false)
    }
  }

  // Optional: Show connection status indicator (you can remove this if not needed)
  // return (
  //   <div className={`fixed bottom-4 right-4 px-3 py-1 rounded text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
  //     {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
  //   </div>
  // )

  return null
}
