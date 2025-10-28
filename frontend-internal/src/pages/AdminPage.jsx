import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { adminAPI, usersAPI } from '../services/api'
import { toast } from 'react-toastify'
import { getVehicleStatusText } from '../utils/statusLabels'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('categories')

  const tabs = [
    { id: 'categories', label: '📂 Kategori' },
    { id: 'units', label: '🏥 Unit' },
    { id: 'vehicles', label: '🚗 Kendaraan' },
    { id: 'users', label: '👥 Pengguna' }
  ]

  // Categories state and handlers (initial CRUD implementation)
  const [catLoading, setCatLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [catForm, setCatForm] = useState({ id: '', name: '', description: '' })

  // Units state and handlers
  const [unitLoading, setUnitLoading] = useState(false)
  const [units, setUnits] = useState([])
  const [unitForm, setUnitForm] = useState({ id: '', name: '', location: '', contact_phone: '', latitude: '', longitude: '', is_active: true })

  // Vehicles state and handlers
  const [vehLoading, setVehLoading] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [vehForm, setVehForm] = useState({ id: '', plate_number: '', type: 'ambulance', status: 'available', unit_id: '', is_active: true })

  // Users state and handlers
  const [userLoading, setUserLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', phone: '', role: 'field_officer', password: '', is_active: true })

  useEffect(() => {
    if (activeTab === 'categories') loadCategories()
    if (activeTab === 'units') loadUnits()
    if (activeTab === 'vehicles') {
      loadVehicles()
      loadUnits() // for unit select
    }
    if (activeTab === 'users') loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const loadCategories = async () => {
    try {
      setCatLoading(true)
      const res = await adminAPI.getCategories()
      setCategories(res?.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Gagal memuat kategori')
    } finally {
      setCatLoading(false)
    }
  }

  const saveCategory = async (e) => {
    e.preventDefault()
    try {
      if (!catForm.name) return toast.warn('Nama kategori wajib diisi')
      if (catForm.id) {
        await adminAPI.updateCategory(catForm.id, { name: catForm.name, description: catForm.description })
        toast.success('Kategori diperbarui')
      } else {
        await adminAPI.createCategory({ name: catForm.name, description: catForm.description })
        toast.success('Kategori dibuat')
      }
      setCatForm({ id: '', name: '', description: '' })
      loadCategories()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menyimpan kategori')
    }
  }

  const editCategory = (cat) => {
    setCatForm({ id: cat.id, name: cat.name || '', description: cat.description || '' })
  }

  const deleteCategory = async (id) => {
    if (!confirm('Hapus kategori ini?')) return
    try {
      await adminAPI.deleteCategory(id)
      toast.success('Kategori dihapus')
      loadCategories()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menghapus kategori')
    }
  }

  // Units CRUD
  const loadUnits = async () => {
    try {
      setUnitLoading(true)
      const res = await adminAPI.getUnits()
      setUnits(res?.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Gagal memuat unit')
    } finally {
      setUnitLoading(false)
    }
  }

  const saveUnit = async (e) => {
    e.preventDefault()
    try {
      if (!unitForm.name) return toast.warn('Nama unit wajib diisi')
      const payload = {
        name: unitForm.name,
        location: unitForm.location || null,
        contact_phone: unitForm.contact_phone || null,
        latitude: unitForm.latitude ? Number(unitForm.latitude) : null,
        longitude: unitForm.longitude ? Number(unitForm.longitude) : null,
        is_active: !!unitForm.is_active
      }
      if (unitForm.id) {
        await adminAPI.updateUnit(unitForm.id, payload)
        toast.success('Unit diperbarui')
      } else {
        await adminAPI.createUnit(payload)
        toast.success('Unit dibuat')
      }
      setUnitForm({ id: '', name: '', location: '', contact_phone: '', latitude: '', longitude: '', is_active: true })
      loadUnits()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menyimpan unit')
    }
  }

  const editUnit = (u) => {
    setUnitForm({
      id: u.id,
      name: u.name || '',
      location: u.location || '',
      contact_phone: u.contact_phone || '',
      latitude: u.latitude ?? '',
      longitude: u.longitude ?? '',
      is_active: !!u.is_active
    })
  }

  const deleteUnit = async (id) => {
    if (!confirm('Hapus unit ini?')) return
    try {
      await adminAPI.deleteUnit(id)
      toast.success('Unit dihapus')
      loadUnits()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menghapus unit')
    }
  }

  // Vehicles CRUD
  const loadVehicles = async () => {
    try {
      setVehLoading(true)
      const res = await adminAPI.getVehicles()
      setVehicles(res?.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Gagal memuat kendaraan')
    } finally {
      setVehLoading(false)
    }
  }

  const saveVehicle = async (e) => {
    e.preventDefault()
    try {
      if (!vehForm.plate_number) return toast.warn('Nomor polisi wajib diisi')
      const payload = {
        plate_number: vehForm.plate_number,
        type: vehForm.type,
        status: vehForm.status,
        unit_id: vehForm.unit_id || null,
        is_active: !!vehForm.is_active
      }
      if (vehForm.id) {
        await adminAPI.updateVehicle(vehForm.id, payload)
        toast.success('Kendaraan diperbarui')
      } else {
        await adminAPI.createVehicle(payload)
        toast.success('Kendaraan dibuat')
      }
      setVehForm({ id: '', plate_number: '', type: 'ambulance', status: 'available', unit_id: '', is_active: true })
      loadVehicles()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menyimpan kendaraan')
    }
  }

  const editVehicle = (v) => {
    setVehForm({
      id: v.id,
      plate_number: v.plate_number || '',
      type: v.type || 'ambulance',
      status: v.status || 'available',
      unit_id: v.unit_id || '',
      is_active: !!v.is_active
    })
  }

  const deleteVehicle = async (id) => {
    if (!confirm('Hapus kendaraan ini?')) return
    try {
      await adminAPI.deleteVehicle(id)
      toast.success('Kendaraan dihapus')
      loadVehicles()
    } catch (e) {
      console.error(e)
      toast.error('Gagal menghapus kendaraan')
    }
  }

  // Users CRUD
  const loadUsers = async () => {
    try {
      setUserLoading(true)
      const res = await usersAPI.getAll()
      setUsers(res?.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Gagal memuat pengguna')
    } finally {
      setUserLoading(false)
    }
  }

  const saveUser = async (e) => {
    e.preventDefault()
    try {
      if (!userForm.name || !userForm.email) return toast.warn('Nama dan email wajib diisi')
      if (!userForm.id && !userForm.password) return toast.warn('Password wajib diisi untuk pengguna baru')
      
      const payload = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone || null,
        role: userForm.role,
        is_active: !!userForm.is_active
      }

      if (userForm.id) {
        // Update - only include password if provided
        if (userForm.password) {
          payload.password = userForm.password
        }
        await usersAPI.update(userForm.id, payload)
        toast.success('Pengguna diperbarui')
      } else {
        // Create - password is required
        payload.password = userForm.password
        await usersAPI.create(payload)
        toast.success('Pengguna dibuat')
      }
      
      setUserForm({ id: '', name: '', email: '', phone: '', role: 'field_officer', password: '', is_active: true })
      loadUsers()
    } catch (e) {
      console.error(e)
      toast.error(e.response?.data?.message || 'Gagal menyimpan pengguna')
    }
  }

  const editUser = (u) => {
    setUserForm({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'field_officer',
      password: '', // Don't pre-fill password
      is_active: !!u.is_active
    })
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Master Data</h1>
        </div>

        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex gap-2 md:gap-4 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-3 md:px-4 py-3 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="card">
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Tambah / Ubah Kategori</h3>
                <form onSubmit={saveCategory} className="flex flex-col md:grid md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nama kategori"
                    className="input"
                    value={catForm.name}
                    onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Deskripsi (opsional)"
                    className="input"
                    value={catForm.description}
                    onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary w-full">{catForm.id ? 'Simpan' : 'Tambah'}</button>
                    {catForm.id && (
                      <button type="button" className="btn btn-secondary" onClick={() => setCatForm({ id: '', name: '', description: '' })}>Batal</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="overflow-x-auto">
                {catLoading ? (
                  <div className="text-center py-8 text-gray-600">Memuat...</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-3 px-2 md:px-3">Nama</th>
                        <th className="py-3 px-2 md:px-3 hidden sm:table-cell">Deskripsi</th>
                        <th className="py-3 px-2 md:px-3 w-32 md:w-40">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan="3" className="py-8 text-center text-gray-500">Belum ada kategori</td>
                        </tr>
                      )}
                      {categories.map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="py-3 px-2 md:px-3 font-medium">{c.name}</td>
                          <td className="py-3 px-2 md:px-3 text-gray-600 hidden sm:table-cell">{c.description || '-'}</td>
                          <td className="py-3 px-2 md:px-3">
                            <div className="flex gap-2">
                              <button className="btn btn-secondary text-xs md:text-sm px-2 md:px-4" onClick={() => editCategory(c)}>Ubah</button>
                              <button className="btn btn-danger text-xs md:text-sm px-2 md:px-4" onClick={() => deleteCategory(c.id)}>Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'units' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Tambah / Ubah Unit</h3>
                <form onSubmit={saveUnit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <input className="input md:col-span-2" placeholder="Nama unit" value={unitForm.name} onChange={(e) => setUnitForm(f => ({ ...f, name: e.target.value }))} />
                  <input className="input md:col-span-2" placeholder="Lokasi (alamat)" value={unitForm.location} onChange={(e) => setUnitForm(f => ({ ...f, location: e.target.value }))} />
                  <input className="input" placeholder="Telepon" value={unitForm.contact_phone} onChange={(e) => setUnitForm(f => ({ ...f, contact_phone: e.target.value }))} />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Aktif</label>
                    <input type="checkbox" checked={unitForm.is_active} onChange={(e) => setUnitForm(f => ({ ...f, is_active: e.target.checked }))} />
                  </div>
                  <input className="input" placeholder="Latitude" value={unitForm.latitude} onChange={(e) => setUnitForm(f => ({ ...f, latitude: e.target.value }))} />
                  <input className="input" placeholder="Longitude" value={unitForm.longitude} onChange={(e) => setUnitForm(f => ({ ...f, longitude: e.target.value }))} />
                  <div className="md:col-span-2 flex gap-2">
                    <button className="btn btn-primary w-full" type="submit">{unitForm.id ? 'Simpan Perubahan' : 'Tambah Unit'}</button>
                    {unitForm.id && <button type="button" className="btn btn-secondary" onClick={() => setUnitForm({ id: '', name: '', location: '', contact_phone: '', latitude: '', longitude: '', is_active: true })}>Batal</button>}
                  </div>
                </form>
              </div>
              <div className="overflow-x-auto">
                {unitLoading ? (
                  <div className="text-center py-8 text-gray-600">Memuat...</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-3 px-3">Nama</th>
                        <th className="py-3 px-3">Lokasi</th>
                        <th className="py-3 px-3">Telepon</th>
                        <th className="py-3 px-3">Koordinat</th>
                        <th className="py-3 px-3">Aktif</th>
                        <th className="py-3 px-3 w-40">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.length === 0 && (
                        <tr><td colSpan="6" className="py-8 text-center text-gray-500">Belum ada unit</td></tr>
                      )}
                      {units.map(u => (
                        <tr key={u.id} className="border-t">
                          <td className="py-3 px-3 font-medium">{u.name}</td>
                          <td className="py-3 px-3">{u.location || '-'}</td>
                          <td className="py-3 px-3">{u.contact_phone || '-'}</td>
                          <td className="py-3 px-3">{u.latitude && u.longitude ? `${u.latitude}, ${u.longitude}` : '-'}</td>
                          <td className="py-3 px-3">{u.is_active ? '✓' : '—'}</td>
                          <td className="py-3 px-3">
                            <div className="flex gap-2">
                              <button className="btn btn-secondary" onClick={() => editUnit(u)}>Ubah</button>
                              <button className="btn btn-danger" onClick={() => deleteUnit(u.id)}>Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Tambah / Ubah Kendaraan</h3>
                <form onSubmit={saveVehicle} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <input className="input md:col-span-2" placeholder="Nomor polisi" value={vehForm.plate_number} onChange={(e) => setVehForm(f => ({ ...f, plate_number: e.target.value }))} />
                  <select className="input" value={vehForm.type} onChange={(e) => setVehForm(f => ({ ...f, type: e.target.value }))}>
                    {['ambulance', 'rescue', 'support', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select className="input" value={vehForm.status} onChange={(e) => setVehForm(f => ({ ...f, status: e.target.value }))}>
                    {['available', 'in_use', 'maintenance', 'unavailable'].map(s => (
                      <option key={s} value={s}>{getVehicleStatusText(s)}</option>
                    ))}
                  </select>
                  <select className="input" value={vehForm.unit_id} onChange={(e) => setVehForm(f => ({ ...f, unit_id: e.target.value }))}>
                    <option value="">(Tanpa unit)</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Aktif</label>
                    <input type="checkbox" checked={vehForm.is_active} onChange={(e) => setVehForm(f => ({ ...f, is_active: e.target.checked }))} />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <button className="btn btn-primary w-full" type="submit">{vehForm.id ? 'Simpan Perubahan' : 'Tambah Kendaraan'}</button>
                    {vehForm.id && <button type="button" className="btn btn-secondary" onClick={() => setVehForm({ id: '', plate_number: '', type: 'ambulance', status: 'available', unit_id: '', is_active: true })}>Batal</button>}
                  </div>
                </form>
              </div>
              <div className="overflow-x-auto">
                {vehLoading ? (
                  <div className="text-center py-8 text-gray-600">Memuat...</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-3 px-3">Nomor Polisi</th>
                        <th className="py-3 px-3">Jenis</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Unit</th>
                        <th className="py-3 px-3">Aktif</th>
                        <th className="py-3 px-3 w-40">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.length === 0 && (
                        <tr><td colSpan="6" className="py-8 text-center text-gray-500">Belum ada kendaraan</td></tr>
                      )}
                      {vehicles.map(v => (
                        <tr key={v.id} className="border-t">
                          <td className="py-3 px-3 font-medium">{v.plate_number}</td>
                          <td className="py-3 px-3">{v.type}</td>
                          <td className="py-3 px-3">{getVehicleStatusText(v.status)}</td>
                          <td className="py-3 px-3">{v.unit?.name || '-'}</td>
                          <td className="py-3 px-3">{v.is_active ? '✓' : '—'}</td>
                          <td className="py-3 px-3">
                            <div className="flex gap-2">
                              <button className="btn btn-secondary" onClick={() => editVehicle(v)}>Ubah</button>
                              <button className="btn btn-danger" onClick={() => deleteVehicle(v.id)}>Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Tambah / Ubah Pengguna</h3>
                <form onSubmit={saveUser} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <input 
                    className="input md:col-span-2" 
                    placeholder="Nama lengkap" 
                    value={userForm.name} 
                    onChange={(e) => setUserForm(f => ({ ...f, name: e.target.value }))} 
                  />
                  <input 
                    className="input md:col-span-2" 
                    type="email"
                    placeholder="Email" 
                    value={userForm.email} 
                    onChange={(e) => setUserForm(f => ({ ...f, email: e.target.value }))} 
                  />
                  <input 
                    className="input" 
                    placeholder="No. Telepon" 
                    value={userForm.phone} 
                    onChange={(e) => setUserForm(f => ({ ...f, phone: e.target.value }))} 
                  />
                  <select 
                    className="input" 
                    value={userForm.role} 
                    onChange={(e) => setUserForm(f => ({ ...f, role: e.target.value }))}
                  >
                    <option value="field_officer">Petugas Lapangan</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="admin">Admin</option>
                    <option value="managerial">Manajerial</option>
                  </select>
                  <input 
                    className="input md:col-span-2" 
                    type="password"
                    placeholder={userForm.id ? "Password (kosongkan jika tidak diubah)" : "Password"} 
                    value={userForm.password} 
                    onChange={(e) => setUserForm(f => ({ ...f, password: e.target.value }))} 
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Aktif</label>
                    <input 
                      type="checkbox" 
                      checked={userForm.is_active} 
                      onChange={(e) => setUserForm(f => ({ ...f, is_active: e.target.checked }))} 
                    />
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <button className="btn btn-primary w-full" type="submit">
                      {userForm.id ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                    </button>
                    {userForm.id && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setUserForm({ id: '', name: '', email: '', phone: '', role: 'field_officer', password: '', is_active: true })}
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="overflow-x-auto">
                {userLoading ? (
                  <div className="text-center py-8 text-gray-600">Memuat...</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-3 px-3">Nama</th>
                        <th className="py-3 px-3">Email</th>
                        <th className="py-3 px-3 hidden sm:table-cell">Telepon</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Aktif</th>
                        <th className="py-3 px-3 w-40">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr><td colSpan="6" className="py-8 text-center text-gray-500">Belum ada pengguna</td></tr>
                      )}
                      {users.map(u => {
                        const roleLabels = {
                          'field_officer': 'Petugas Lapangan',
                          'dispatcher': 'Dispatcher',
                          'admin': 'Admin',
                          'managerial': 'Manajerial'
                        }
                        return (
                          <tr key={u.id} className="border-t">
                            <td className="py-3 px-3 font-medium">{u.name}</td>
                            <td className="py-3 px-3">{u.email}</td>
                            <td className="py-3 px-3 hidden sm:table-cell">{u.phone || '-'}</td>
                            <td className="py-3 px-3">{roleLabels[u.role] || u.role}</td>
                            <td className="py-3 px-3">{u.is_active ? '✓' : '—'}</td>
                            <td className="py-3 px-3">
                              <div className="flex gap-2">
                                <button className="btn btn-secondary" onClick={() => editUser(u)}>Ubah</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
