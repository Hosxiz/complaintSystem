<div align="center">

# 🛡️ SDU Complaint Management System
### ระบบบริหารจัดการเรื่องร้องเรียนระดับองค์กร (Enterprise Privacy-First Helpdesk Platform)

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Row_Level_Security-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide-Icons-orange?style=for-the-badge)](https://lucide.dev/)

<p align="center">
  <b>ระบบรับเรื่องร้องเรียนและข้อเสนอแนะ คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต</b><br>
  พัฒนาด้วยสถาปัตยกรรมระดับองค์กร (Clean Architecture) เน้นความปลอดภัยสูงสุดด้วย <b>Anonymous Whistleblower Protection</b>,<br>
  กระดาน <b>Kanban Helpdesk Board</b>, ระบบ <b>Audit Trail</b> ตรวจสอบย้อนหลังได้ 100%, และรองรับ <b>SSO (Google & Microsoft Entra ID)</b>
</p>

---

</div>

## 📌 สรุปผลงานเด่นสำหรับ Portfolio & Resume (Project Highlights)

โปรเจกต์นี้ได้รับการออกแบบและพัฒนาเพื่อแก้ปัญหาการจัดการเรื่องร้องเรียนในองค์กรขนาดใหญ่ โดยผสานแนวคิด **Modern SaaS UI/UX (อ้างอิง Tasklify Pro & Newswire)** เข้ากับ **Security Engineering & Role-Based Access Control (RBAC)**:

1. **Enterprise Authentication & Single Sign-On (SSO):**
   * รองรับทั้งการล็อกอินด้วย **Google OAuth** และ **Microsoft 365 (Azure Entra ID / SDU Mail)**
   * หน้า Login/Register ออกแบบด้วยสถาปัตยกรรม **Adaptive UI**: บานเลื่อน *Sliding Door Animation (Desktop)* และ *Segmented Thumb Tabs (Mobile)*
2. **Privacy-First Anonymous Whistleblower:**
   * สถาปัตยกรรมปกป้องตัวตนผู้ร้องเรียนขั้นสูงสุด: ข้อมูลชื่อและอีเมลของผู้ร้องเรียนจะถูกตัดทิ้งตั้งแต่ระดับ **PostgreSQL Row-Level Security (RLS)** เจ้าหน้าที่ (Staff) ไม่มีทางเข้าถึงข้อมูลผู้แจ้งได้ไม่ว่าจะผ่าน UI หรือ Direct Query
3. **Helpdesk Kanban Dashboard (Staff Portal):**
   * กระดาน Kanban 4 สถานะ จัดการตั๋วแบบ Realtime พร้อมแผง **Slide-over Drawer** เปิดดูรายละเอียดและพิมพ์ตอบกลับได้ในหน้าเดียว
   * กล่องสรุป **KPI Performance Metrics** แสดงอัตราความสำเร็จในการแก้ไข (Resolution Rate %)
4. **Data Export & Audit Trail Compliance:**
   * ส่งออกรายงานสถิติเป็น **Excel / CSV ด้วยการเข้ารหัส UTF-8 BOM (`\uFEFF`)** เปิดใน Microsoft Excel ภาษาไทยไม่เพี้ยน 100%
   * ระบบ **Safe Delete & Deletion Audit Logs**: บันทึกประวัติการลบคำร้องอย่างโปร่งใส (ใครลบ, ตั๋วไหน, วันที่, เหตุผล)
5. **Anti-Spam Re-open Protection:**
   * ผู้ใช้สามารถขอเปิดเรื่องใหม่ (Re-open) ได้เฉพาะเมื่อเคสปิดแล้ว และ**ต้องแนบรูปถ่ายหลักฐานยืนยัน + พิมพ์เหตุผล** ป้องกันการกดกลั่นแกล้งเจ้าหน้าที่

---

## 🌟 จุดเด่นและฟีเจอร์ของระบบ (Core Features)

| โมดูล / ฟีเจอร์ | รายละเอียดทางเทคนิค (Technical Details) |
| :--- | :--- |
| 🥷 **Anonymous Whistleblower** | ซ่อนตัวตนผู้แจ้งเบาะแส ปลอดภัยตามกฎหมาย PDPA ด้วย PostgreSQL RLS Policies |
| 🗂️ **Kanban Helpdesk Board** | แบ่งคอลัมน์สถานะชัดเจน (`รอดำเนินการ`, `กำลังตรวจสอบ`, `รอข้อมูล`, `แก้ไขเสร็จสิ้น`) |
| 👑 **Admin Executive Dashboard** | แดชบอร์ดสรุปสถิติผู้บริหาร สลับการทำงาน 3 แท็บ: คัดกรองเคส, จัดการหมวดหมู่, และแต่งตั้งสิทธิ์ User/Staff/Admin |
| 📥 **Export to Excel (UTF-8 BOM)** | ส่งออกรายงานเรื่องร้องเรียนเป็นไฟล์ `.csv` รองรับภาษาไทยสมบูรณ์แบบ เปิดใน Excel ทันที |
| 📜 **Audit Logs & Safe Deletion** | บันทึกประวัติการลบตั๋วลงตาราง Audit แยก ตรวจสอบย้อนหลังได้ตลอดเวลา |
| 💬 **Dual-Channel Discussion** | แชท 2 ทาง: คุยกับผู้ร้องเรียน (Public) หรือ บันทึกโน้ตลับปรึกษาภายในทีม (Internal Note 🔒) |
| 🛡️ **Re-open with Proof Gate** | ระบบขอเปิดเรื่องใหม่พร้อมบังคับแนบรูปถ่ายหลักฐานยืนยันความคืบหน้า |
| 🔍 **Guest Ticket Tracking** | ติดตามสถานะผ่าน Tracking Code ลับ (`TRK-XXXX-YYYY`) โดยไม่ต้องสมัครสมาชิก |
| 📱 **Responsive Multi-Device** | ใช้งานลื่นไหลบนทุกหน้าจอ ทั้งสมาร์ทโฟน แท็บเล็ต และคอมพิวเตอร์ตั้งโต๊ะ |

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 16 App Router + Tailwind CSS)"]
        Landing["🏠 Landing Page (/)<br/>- Quick Search & Tracking<br/>- Help Desk Category Cards"]
        AuthUI["🚪 Auth Portal (/login)<br/>- Google OAuth<br/>- Microsoft SDU Mail<br/>- Sliding Overlay UI"]
        UserPortal["🧑‍💼 User Portal (/dashboard)<br/>- ส่งคำร้อง & ระบุช่องทางติดต่อ<br/>- Drawer รายละเอียด & แชทสด<br/>- Re-open with Proof Modal"]
        StaffPortal["🛠️ Staff Portal (/staff)<br/>- กระดาน Kanban Helpdesk 4 สถานะ<br/>- KPI Metrics Summary<br/>- Export CSV (UTF-8 BOM)<br/>- Safe Delete & Audit Logs"]
        AdminPortal["👑 Admin Center (/admin)<br/>- Executive Overview & Stats<br/>- Category Manager (CRUD)<br/>- RBAC Role Isolation"]
    end

    subgraph SecurityBoundary ["Security & Boundary Guard"]
        Middleware["Next.js Route Middleware<br/>(Session Verification & Role Redirection)"]
        RLS["PostgreSQL Row-Level Security<br/>(Strict Tenant & Anonymous Shield)"]
    end

    subgraph CloudBackend ["Cloud Services (Supabase)"]
        AuthService["Supabase Auth Engine<br/>(OAuth Providers & Session Tokens)"]
        DB[("PostgreSQL 15+<br/>- profiles<br/>- tickets<br/>- ticket_messages<br/>- ticket_attachments<br/>- ticket_deletion_logs")]
        Storage["Storage Buckets<br/>(evidence-attachments)"]
    end

    Landing --> Middleware
    AuthUI --> AuthService
    UserPortal --> Middleware
    StaffPortal --> Middleware
    AdminPortal --> Middleware

    Middleware --> RLS
    RLS --> DB
    Middleware --> Storage
```

---

## 🔄 วงจรสถานะของเรื่องร้องเรียน (Ticket Lifecycle State Machine)

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : ผู้ใช้ยื่นเรื่องร้องเรียนเข้าระบบ
    SUBMITTED --> RECEIVED : เจ้าหน้าที่เปิดอ่านและรับเรื่อง
    RECEIVED --> IN_PROGRESS : เจ้าหน้าที่เริ่มลงมือตรวจสอบและแก้ไข
    IN_PROGRESS --> WAITING : เจ้าหน้าที่ขอข้อมูลหรือหลักฐานเพิ่ม
    WAITING --> IN_PROGRESS : ผู้ใช้พิมพ์ชี้แจงผ่านระบบแชท
    IN_PROGRESS --> RESOLVED : ดำเนินการแก้ไขปัญหาเสร็จสิ้น
    RESOLVED --> CLOSED : ปิดเคสและจัดเก็บข้อมูลเข้าคลัง
    RESOLVED --> IN_PROGRESS : ผู้ใช้พบปัญหายังไม่เรียบร้อย (ยื่น Re-open พร้อมแนบรูปหลักฐาน)
    CLOSED --> [*]
```

---

## 🛠️ เทคโนโลยีที่ใช้ในการพัฒนา (Tech Stack)

* **Frontend Framework:** Next.js 16 (React 19 App Router)
* **Styling & Design System:** Tailwind CSS v4, Lucide React Icons
* **Backend as a Service:** Supabase (Database, Auth, Storage)
* **Database Management:** PostgreSQL with Row Level Security (RLS) & Triggers
* **Authentication:** Supabase Auth (Email/Password, Google OAuth 2.0, Microsoft Azure Entra ID)
* **Storage Solution:** Supabase Object Storage (Multipart file uploads for evidence)
* **Data Processing:** Native UTF-8 BOM CSV Generator for Excel Thai localization

---

## 🚀 คู่มือการติดตั้งและรันโปรเจกต์ (Installation & Setup)

### 1. Clone Repository & ติดตั้ง Dependencies
```bash
git clone https://github.com/Hosxiz/complaintSystem.git
cd complaintSystem
npm install
```

### 2. กำหนดค่าตัวแปรสภาพแวดล้อม (Environment Variables)
สร้างไฟล์ `.env.local` ในไดเรกทอรีหลักของโปรเจกต์:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. เตรียมฐานข้อมูล (Database Migration)
รันไฟล์สคริปต์ SQL ต่อไปนี้ใน **Supabase SQL Editor**:
1. `supabase/full_schema.sql` (โครงสร้างตารางหลัก, Enum, และ RLS)
2. `supabase/ticket_deletion_logs.sql` (ตาราง Audit Trail บันทึกการลบ)
3. `supabase/storage_setup.sql` (สร้าง Storage Bucket `evidence-attachments`)

### 4. รัน Dev Server
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

---

## 👨‍💻 ข้อมูลผู้พัฒนา (Author)
* **GitHub:** [@Hosxiz](https://github.com/Hosxiz)
* **สถาบัน:** คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต (Suan Dusit University)
* **ใบอนุญาต:** [MIT License](LICENSE)
