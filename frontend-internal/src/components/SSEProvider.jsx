import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

// Light SSE client that listens to server events and surfaces toasts/refresh signals
export default function SSEProvider() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('token')
    if (!token) return

    const url = `/api/stream/events?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    es.addEventListener('connected', (e) => {
      // Optional: console.log('SSE connected', e.data)
    })

    es.addEventListener('heartbeat', () => {
      // keep-alive, no-op
    })

    es.addEventListener('new_report', (e) => {
      try {
        const data = JSON.parse(e.data)
        toast.info(`Laporan baru: ${data?.category?.name || ''}`)
        window.dispatchEvent(new CustomEvent('psc119:new_report', { detail: data }))
      } catch {}
    })

    es.addEventListener('assigned_task', (e) => {
      try {
        const data = JSON.parse(e.data)
        toast.success('Tugas baru ditugaskan')
        window.dispatchEvent(new CustomEvent('psc119:assigned_task', { detail: data }))
      } catch {}
    })

    es.addEventListener('report_update', (e) => {
      try {
        const data = JSON.parse(e.data)
        toast.info('Laporan diperbarui')
        window.dispatchEvent(new CustomEvent('psc119:report_update', { detail: data }))
      } catch {}
    })

    es.onerror = () => {
      // Surface a quiet error if the stream drops
      // toast.error('Koneksi notifikasi terputus')
    }

    return () => {
      es.close()
    }
  }, [user])

  return null
}
