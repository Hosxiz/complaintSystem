import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// รวมคลาส CSS ของ Tailwind เข้าด้วยกันแบบไม่ชนกัน
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

