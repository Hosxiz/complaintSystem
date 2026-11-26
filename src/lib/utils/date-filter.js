// ==============================================================================
// 📅 ยูทิลิตี้สำหรับกรองช่วงเวลาของเรื่องร้องเรียน (Date Filter Utilities)
// ==============================================================================

export const DATE_FILTER_PRESETS = [
  { id: 'ALL', label: 'ทั้งหมด (All Time)', desc: 'แสดงข้อมูลประวัติทั้งหมดตั้งแต่เปิดระบบ' },
  { id: 'TODAY', label: 'วันนี้ (Today)', desc: 'เฉพาะเรื่องที่แจ้งเข้ามาในวันนี้' },
  { id: 'LAST_7_DAYS', label: '7 วันล่าสุด (Last 7 Days)', desc: 'ข้อมูลย้อนหลัง 7 วันทำการ' },
  { id: 'THIS_MONTH', label: 'เดือนนี้ (This Month)', desc: 'ข้อมูลในเดือนปัจจุบัน' },
  { id: 'THIS_YEAR', label: 'ปีนี้ (This Year)', desc: 'ข้อมูลตลอดปีการศึกษา/ปีปฏิทินปัจจุบัน' },
  { id: 'CUSTOM', label: 'กำหนดช่วงเวลาเอง (Custom Range)', desc: 'ระบุวันเริ่มต้นและสิ้นสุดเอง' },
]

export function filterTicketsByDate(tickets = [], filterType = 'ALL', customRange = {}) {
  if (!tickets || tickets.length === 0) return []
  if (filterType === 'ALL') return tickets

  const now = new Date()

  return tickets.filter((ticket) => {
    if (!ticket.created_at) return true
    const ticketDate = new Date(ticket.created_at)

    if (filterType === 'TODAY') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      return ticketDate >= todayStart && ticketDate <= todayEnd
    }

    if (filterType === 'LAST_7_DAYS') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return ticketDate >= sevenDaysAgo && ticketDate <= now
    }

    if (filterType === 'THIS_MONTH') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return ticketDate >= monthStart && ticketDate <= monthEnd
    }

    if (filterType === 'THIS_YEAR') {
      const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      return ticketDate >= yearStart && ticketDate <= yearEnd
    }

    if (filterType === 'CUSTOM') {
      const startDate = customRange.startDate || customRange.start
      const endDate = customRange.endDate || customRange.end
      if (!startDate && !endDate) return true
      const start = startDate ? new Date(`${startDate}T00:00:00`) : new Date(0)
      const end = endDate ? new Date(`${endDate}T23:59:59`) : new Date(8640000000000000)
      return ticketDate >= start && ticketDate <= end
    }

    return true
  })
}
