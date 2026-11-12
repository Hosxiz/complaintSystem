// ==============================================================================
// 🚦 Helper: ป้ายสีและคำอธิบายสถานะภาษาไทยที่เด็กอนุบาลก็เข้าใจ
// ==============================================================================

export const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'ยื่นเรื่องแล้ว',
    description: 'จดหมายของคุณถูกหยอดลงตู้เรียบร้อย รอเจ้าหน้าที่เปิดอ่าน',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    stepIndex: 1
  },
  RECEIVED: {
    label: 'รับเรื่องแล้ว',
    description: 'ครูใหญ่เปิดอ่านแล้ว กำลังจัดหาคุณครูที่ดูแลเรื่องนี้',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    stepIndex: 2
  },
  IN_PROGRESS: {
    label: 'กำลังดำเนินการ',
    description: 'เจ้าหน้าที่กำลังลงมือตรวจสอบและแก้ไขปัญหาให้คุณ',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    stepIndex: 3
  },
  WAITING: {
    label: 'รอข้อมูลเพิ่มเติม',
    description: 'เจ้าหน้าที่มีคำถามเพิ่มเติม กรุณาตอบกลับในช่องแชท',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    stepIndex: 3
  },
  RESOLVED: {
    label: 'แก้ไขเสร็จสิ้น',
    description: 'เจ้าหน้าที่ซ่อมเสร็จแล้ว! หากตรวจสอบแล้วยังพบปัญหา คุณสามารถกดขอเปิดเรื่องใหม่ได้',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    stepIndex: 4
  },
  CLOSED: {
    label: 'ปิดเคสเรียบร้อย',
    description: 'เคสนี้ได้รับการแก้ไขสมบูรณ์และจัดเก็บเข้าแฟ้มแล้ว',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    stepIndex: 5
  }
}

