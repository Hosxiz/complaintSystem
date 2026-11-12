# UI/UX Specification: Authentication Portal
**Role:** Stage 2: UI/UX Designer  
**Scope:** Login & Registration Screen (`/login`), OAuth Google Button, Tab Switching, Form States

---

## 1. Visual Hierarchy & Aesthetic Standard
- **Layout:** Centered Bento-card floating on subtle slate mesh background (`bg-slate-50`).
- **Card:** Rounded-3xl (`rounded-2xl` on mobile), soft border (`border-slate-200/80`), subtle drop shadow (`shadow-xl shadow-slate-200/50`).
- **Brand Identity:** Clean Security/Hospitality tone (Navy Blue `#2563EB`, Slate, Emerald accents for success).

---

## 2. Interaction & State Specifications
1. **Mode Switcher (Tabs):**
   - Toggle between **"เข้าสู่ระบบ (Sign In)"** and **"สมัครสมาชิกใหม่ (Sign Up)"**.
   - Smooth animated transition without page reloads.
2. **Form Inputs:**
   - Email (Input type `email`, icon `Mail`)
   - Password (Input type `password`, icon `Lock`, toggleable eye icon)
   - Full Name (Optional during Sign Up)
3. **Primary Actions:**
   - Direct Email/Password Submit Button (with loading spinner & disabled state).
   - Horizontal Divider: "หรือเข้าสู่ระบบด้วย" (Or continue with).
   - **Google OAuth Button:** Branded button triggering Supabase `signInWithOAuth({ provider: 'google' })`.
4. **Error & Notification Banners:**
   - Top banner inside card with clear icon and actionable messages.

---

## 3. Pipeline Gate: PASSED ✅
Ready for Stage 4: Production Coder implementation.

