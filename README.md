<div align="center">

# 🛡️ Complaint Management System
### ระบบบริหารจัดการเรื่องร้องเรียนระดับองค์กร (Enterprise Grade)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-black?style=for-the-badge)](https://ui.shadcn.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

<p align="center">
  <b>ระบบจัดการเรื่องร้องเรียนที่ให้ความสำคัญกับความเป็นส่วนตัว (Privacy-First) คัดกรองรวดเร็ว และโปร่งใสตรวจสอบได้</b><br>
  พร้อมสถาปัตยกรรม <b>Anonymous Whistleblower</b> ป้องกันข้อมูลรั่วไหลในระดับ Row-Level Security
</p>

---

</div>

## 🌟 จุดเด่นของระบบ (Key Features)

| ความสามารถ | รายละเอียด |
| :--- | :--- |
| 🕵️‍♂️ **Anonymous Whistleblower Mode** | ผู้ร้องเรียนสามารถเลือก "ซ่อนตัวตน" ได้ โดยเจ้าหน้าที่ (Staff) จะไม่สามารถเข้าถึงชื่อ/อีเมลของผู้ร้องเรียนได้ทั้งทาง UI และ Database Query |
| 🎫 **Smart Ticket & Tracking Code** | สร้างรหัสเคสอัตโนมัติ พร้อมรหัสลับติดตามเคส (Tracking Code) ให้ผู้ใช้เช็กความคืบหน้าได้ทันที |
| 👥 **3-Tier Role Permissions** | แยกสิทธิ์ชัดเจนระดับสถาปัตยกรรม: **User**, **Staff** (ดูเฉพาะเคสที่รับมอบหมาย), และ **Admin** (ควบคุมทุกภาพรวม) |
| 💬 **Dual-Channel Discussion** | แชทได้ทั้ง **Public Message** (สื่อสารกับผู้ร้องเรียน) และ **Internal Note** (คุยกันเฉพาะทีมภายใน ไม่เปิดเผยให้ User เห็น) |
| 📊 **Real-time Analytics Dashboard** | รายงานสถิติเคส คัดกรองหมวดหมู่ และระบบช่วยจับคู่แนะนำเจ้าหน้าที่ที่เหมาะสมโดยอัตโนมัติ |
| 🔔 **Omni-channel Notifications** | แจ้งเตือนความคืบหน้าทั้ง In-app Badge และส่งตรงถึงอีเมลผ่าน Resend |

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js + Tailwind + shadcn/ui)"]
        UserPortal["🧑‍💼 User Portal<br/>- ส่งคำร้อง / แนบหลักฐาน<br/>- ซ่อนตัวตน (Anonymous)<br/>- ติดตามสถานะ (Tracking Code)"]
        AdminPortal["👑 Admin Portal<br/>- Dashboard & Overview<br/>- คัดกรอง & จัดหมวดหมู่<br/>- มอบหมายงาน Staff"]
        StaffPortal["🛠️ Staff Portal<br/>- รับเคสเฉพาะที่ได้รับมอบหมาย<br/>- Public Chat / Internal Note<br/>- อัปเดตสถานะงาน"]
    end

    subgraph SecurityBoundary ["Security & API Boundary"]
        Cloudflare["Cloudflare Edge Workers / Next.js API Routes"]
        RLS["PostgreSQL Row-Level Security (RLS)"]
    end

    subgraph Backend ["Backend & Database (Supabase)"]
        Auth["Supabase Auth<br/>(Email / Password & Google OAuth)"]
        DB[("PostgreSQL DB<br/>- Profiles<br/>- Tickets<br/>- Messages<br/>- Audit Logs")]
        Storage["Supabase Storage<br/>(Evidence Buckets)"]
        ResendAPI["📧 Resend Email Engine"]
    end

    UserPortal --> Cloudflare
    AdminPortal --> Cloudflare
    StaffPortal --> Cloudflare

    Cloudflare --> RLS
    RLS --> DB
    Cloudflare --> Auth
    Cloudflare --> Storage
    Cloudflare -.-> ResendAPI
```

---

## 🔄 วงจรสถานะของ Ticket (State Machine)

ระบบดำเนินเรื่องตามลำดับขั้นตอน เพื่อให้ตรวจสอบย้อนหลังและจัดการ SLA ได้อย่างแม่นยำ:

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : ผู้ใช้ส่งเรื่องร้องเรียน
    SUBMITTED --> RECEIVED : Admin ตรวจสอบและรับเรื่อง
    RECEIVED --> IN_PROGRESS : Admin มอบหมายให้ Staff ดำเนินการ
    IN_PROGRESS --> WAITING : Staff รอข้อมูลเพิ่มเติมจากผู้ใช้
    WAITING --> IN_PROGRESS : ผู้ใช้ตอบกลับข้อมูลเพิ่มเติม
    IN_PROGRESS --> RESOLVED : Staff แก้ไขปัญหาเสร็จสิ้น
    RESOLVED --> CLOSED : ผู้ใช้พึงพอใจ / ปิดเคสอัตโนมัติ
    RESOLVED --> IN_PROGRESS : ผู้ใช้ไม่พอใจ (Re-open เคส)
    CLOSED --> [*]
```

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Schema Overview)

```mermaid
erDiagram
    PROFILES ||--o{ TICKETS : "submits (as user)"
    PROFILES ||--o{ TICKETS : "assigned_to (as staff)"
    CATEGORIES ||--o{ TICKETS : "categorized in"
    TICKETS ||--o{ TICKET_MESSAGES : "contains"
    TICKETS ||--o{ TICKET_ATTACHMENTS : "has"

    PROFILES {
        uuid id PK
        string email
        string full_name
        string role "user | staff | admin"
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        string name
        string description
    }

    TICKETS {
        uuid id PK
        string ticket_code "TK-2026-XXXX"
        string tracking_code "Secret Tracking Key"
        uuid user_id FK
        uuid assigned_staff_id FK
        uuid category_id FK
        string title
        text description
        boolean is_anonymous "ซ่อนตัวตนจาก Staff"
        enum status "SUBMITTED -> CLOSED"
        timestamp created_at
    }

    TICKET_MESSAGES {
        uuid id PK
        uuid ticket_id FK
        uuid sender_id FK
        text message
        boolean is_internal "true = เฉพาะทีมภายใน"
        timestamp created_at
    }
```

---

## 🚀 แผนการพัฒนา (Learning & Engineering Roadmap)

- [x] **Step 0:** วิเคราะห์ Requirement และวางสถาปัตยกรรมระบบ
- [ ] **Step 1:** ออกแบบฐานข้อมูล Supabase + เขียนคำสั่ง RLS Policies (เน้นศึกษา Data Security)
- [ ] **Step 2:** Scaffold โปรเจกต์ Next.js (App Router) + ติดตั้ง Tailwind CSS & shadcn/ui
- [ ] **Step 3:** ระบบ Authentication & Role-based Guards (Middleware ปกป้องหน้า Admin/Staff)
- [ ] **Step 4:** Ticket Engine & กลไก Anonymous + การสร้าง Tracking Code
- [ ] **Step 5:** พัฒนา 3 พอร์ทัลหลัก (User Portal, Staff Portal, Admin Dashboard)
- [ ] **Step 6:** ระบบส่งอีเมลแจ้งเตือนผ่าน Resend & Deploy ไปยัง Cloudflare

---

<div align="center">
  <sub>Built with ❤️ for High-Quality System Engineering & Clean Code Education.</sub>
</div>
