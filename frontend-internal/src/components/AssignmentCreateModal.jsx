import { useEffect, useState } from 'react'
import { adminAPI, usersAPI, assignmentAPI } from '../services/api'
import { toast } from 'react-toastify'

export default function AssignmentCreateModal({ report, open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState({ officers: [], units: [], vehicles: [] })
  const [form, setForm] = useState({ assigned_to: '', unit_id: '', vehicle_id: '', notes: '' })

  useEffect(() => {
    if (open) {
      loadOptions()
    }
  }, [open])

  const loadOptions = async () => {
    try {
      const [officersRes, unitsRes, vehiclesRes] = await Promise.all([
        usersAPI.getFieldOfficers(),
        adminAPI.getUnits(),
        adminAPI.getVehicles()
      ])
      console.log('Officers loaded:', officersRes)
      setOptions({
        officers: officersRes?.data || [],
        units: unitsRes?.data || [],
        vehicles: (vehiclesRes?.data || []).filter(v => v.status === 'available')
      })
    } catch (err) {
      console.error('Failed loading options', err)
      toast.error('Gagal memuat data penugasan')
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    console.log('Form state:', form)
    if (!form.assigned_to) return toast.warn('Pilih petugas lapangan')
    try {
      setLoading(true)
      const payload = {
        report_id: report.id,
        assigned_to: form.assigned_to,
        unit_id: form.unit_id || null,
        vehicle_id: form.vehicle_id || null,
        notes: form.notes || ''
      }
      console.log('Sending payload:', payload)
      await assignmentAPI.create(payload)
      toast.success('Penugasan dibuat')
      onCreated?.()
      onClose?.()
    } catch (err) {
      console.error('Create assignment failed', err)
      const msg = err.response?.data?.message || 'Gagal membuat penugasan'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Buat Penugasan</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="label">Petugas Lapangan</label>
            <select
              className="input"
              value={form.assigned_to}
              onChange={(e) => setForm(f => ({ ...f, assigned_to: e.target.value }))}
            >
              <option value="">-- Pilih Petugas --</option>
              {options.officers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Unit</label>
              <select
                className="input"
                value={form.unit_id}
                onChange={(e) => setForm(f => ({ ...f, unit_id: e.target.value }))}
              >
                <option value="">-- Pilih Unit (opsional) --</option>
                {options.units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Kendaraan</label>
              <select
                className="input"
                value={form.vehicle_id}
                onChange={(e) => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
              >
                <option value="">-- Pilih Kendaraan (opsional) --</option>
                {options.vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate_number} • {v.type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Catatan</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Instruksi atau catatan singkat"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">Batal</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Menyimpan...' : 'Buat Penugasan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
