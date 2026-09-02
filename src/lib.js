export function nid(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3)
}

export function landingFor(role) {
  if (role === 'admin') return '/admin/invites'
  if (role === 'pm') return '/'
  if (role === 'engineer') return '/enclosure/enc-lab-01/engineer'
  if (role === 'noc') return '/enclosure/enc-lab-01/noc'
  return '/enclosure/enc-lab-01'
}

export function mintPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const arr = new Uint8Array(10)
  crypto.getRandomValues(arr)
  let s = ''
  for (let i = 0; i < 10; i += 1) s += chars[arr[i] % chars.length]
  return s
}

export function dash(value) {
  if (value === null || value === undefined || String(value).trim() === '') return '—'
  return String(value)
}

export function compressImageFile(file, maxPx = 1280) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > maxPx || h > maxPx) {
        const scale = maxPx / Math.max(w, h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, w)
      canvas.height = Math.max(1, h)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#0a1628'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Could not read image'))
      reader.readAsDataURL(file)
    }
    img.src = url
  })
}

export function jobDlr(job) {
  return (job?.paperwork || []).find((p) => p.kind === 'dlr') || null
}

export function cadPresent(job, enclosure) {
  const dlr = jobDlr(job)
  if (!dlr) return false
  if (!enclosure?.cadSlot) return false
  if (enclosure.cadSlot.dlrId && enclosure.cadSlot.dlrId !== dlr.id) return false
  return true
}

export function qrHref(encId) {
  return window.location.origin + '/qr/' + encId
}
