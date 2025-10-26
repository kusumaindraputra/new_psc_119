// Centralized Indonesian labels for various status codes

export const reportStatusText = {
  pending: 'Menunggu',
  verified: 'Terverifikasi',
  assigned: 'Ditugaskan',
  in_progress: 'Diproses',
  closed: 'Selesai',
  rejected: 'Ditolak'
}

export const assignmentStatusText = {
  pending: 'Menunggu',
  accepted: 'Diterima',
  in_progress: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
}

export const vehicleStatusText = {
  available: 'Tersedia',
  in_use: 'Sedang digunakan',
  maintenance: 'Perawatan',
  unavailable: 'Tidak tersedia'
}

export const getReportStatusText = (status) => reportStatusText[status] || 'Tidak diketahui'
export const getAssignmentStatusText = (status) => assignmentStatusText[status] || 'Tidak diketahui'
export const getVehicleStatusText = (status) => vehicleStatusText[status] || 'Tidak diketahui'
