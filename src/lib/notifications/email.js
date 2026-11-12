// ==============================================================================
// ✉️ บริการส่งอีเมลแจ้งเตือนผ่าน Resend (Email Notification Service)
// ==============================================================================

/**
 * ฟังก์ชันส่งอีเมลแจ้งเตือนผู้ใช้งานเมื่อสถานะตั๋วเปลี่ยน หรือได้รับคำตอบใหม่
 * 
 * @param {Object} params
 * @param {string} params.toEmail อีเมลของผู้ใช้งาน (ปลายทาง)
 * @param {string} params.ticketCode รหัสตั๋ว เช่น TK-2026-X8Y2
 * @param {string} params.trackingCode รหัสลับติดตามเคส
 * @param {string} params.statusLabel ป้ายสถานะภาษาไทย เช่น 'กำลังดำเนินการ'
 * @param {string} params.statusDescription รายละเอียดการเปลี่ยนแปลง
 */
export async function sendTicketStatusEmail({
  toEmail,
  ticketCode,
  trackingCode,
  statusLabel,
  statusDescription
}) {
  const apiKey = process.env.RESEND_API_KEY

  // ถ้ายังไม่ได้กรอก API Key ใน .env ให้บันทึก log ไว้ก่อน (ระบบจะไม่พัง)
  if (!apiKey) {
    console.log(`[Email Mock Simulation] ส่งอีเมลไปยัง: ${toEmail}`)
    console.log(`เคส: ${ticketCode} | สถานะใหม่: ${statusLabel}`)
    return { success: true, simulated: true }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'ระบบเรื่องร้องเรียน <noreply@yourdomain.com>',
        to: [toEmail],
        subject: `[อัปเดตสถานะ] เรื่องร้องเรียน #${ticketCode} - ${statusLabel}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
            <h2 style="color: #1e40af; margin-bottom: 8px;">อัปเดตความคืบหน้าเรื่องร้องเรียน</h2>
            <p style="color: #4b5563; font-size: 14px;">เรื่องร้องเรียนรหัส <b>${ticketCode}</b> ของคุณมีการเปลี่ยนแปลงสถานะ:</p>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 12px; color: #6b7280; display: block;">สถานะปัจจุบัน</span>
              <span style="font-size: 18px; font-weight: bold; color: #111827;">${statusLabel}</span>
              <p style="font-size: 14px; color: #4b5563; margin-top: 6px;">${statusDescription}</p>
            </div>

            <p style="font-size: 13px; color: #6b7280;">
              คุณสามารถติดตามสถานะฉบับเต็มได้โดยใช้รหัสลับ: <b>${trackingCode}</b>
            </p>
            <div style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 12px; color: #9ca3af;">
              อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้
            </div>
          </div>
        `
      })
    })

    const data = await response.json()
    return { success: response.ok, data }
  } catch (error) {
    console.error('Failed to send email via Resend:', error)
    return { success: false, error: error.message }
  }
}

