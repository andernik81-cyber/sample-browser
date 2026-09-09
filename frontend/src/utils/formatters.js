export function fmtLength(sec) {
  const totalMs = Math.round(sec * 1000)
  const h = Math.floor(totalMs / 3600000)
  const m = Math.floor((totalMs % 3600000) / 60000)
  const s = Math.floor((totalMs % 60000) / 1000)
  const ms = totalMs % 1000

  const sStr = String(s).padStart(2, '0')
  const msStr = String(ms).padStart(3, '0')

  if (h > 0) {
    const hStr = String(h).padStart(2, '0')
    const mStr = String(m).padStart(2, '0')
    return `${hStr}:${mStr}:${sStr}.${msStr}`
  }
  if (m > 0) {
    const mStr = String(m).padStart(2, '0')
    return `${mStr}:${sStr}.${msStr}`
  }
  return `00:${sStr}.${msStr}`
}