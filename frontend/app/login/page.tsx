"use client"

import Link from "next/link"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* 헤더 */}
      <header className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-2">
        <nav className="flex space-x-2 text-sm">
          <Link href="/cbam" className="hover:text-blue-600">CBAM 소개</Link>
          <span>|</span>
          <Link href="/guide" className="hover:text-blue-600">이용 안내</Link>
          <span>|</span>
          <Link href="/cbam-calculator" className="hover:text-blue-600">CBAM 계산기</Link>
          <span>|</span>
          <Link href="/mypage" className="hover:text-blue-600">My page</Link>
        </nav>
        <div className="space-x-2">
          <Link href="/" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Main</Link>
          <Link href="/login" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Login</Link>
        </div>
      </header>
      
      {/* 로그인 폼 */}
      <div className="flex justify-center items-center min-h-[calc(100vh-48px)]">
        <LoginForm />
      </div>
    </div>
  )
} 