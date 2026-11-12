// ==============================================================================
// 🎫 Helper: ฟังก์ชันสร้าง Ticket Code และ Tracking Code อัตโนมัติ
// ==============================================================================

// สร้างรหัสอ่านง่าย เช่น TK-2026-X8Y2
export function generateTicketCode() {
  const year = new Date().getFullYear()
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TK-${year}-${randomChars}`
}

// สร้างรหัสลับ Tracking Code 12 ตัวอักษร เช่น TRK-8F2A-99B1
export function generateTrackingCode() {
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase()
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TRK-${part1}-${part2}`
}

