"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const id = formData.get("loginId")
    const password = formData.get("password")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "로그인에 실패했습니다.")
        setIsLoading(false)
        return
      }

      router.push("/")
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-300 shadow-md rounded-lg p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex items-center mb-2">
              <label htmlFor="loginId" className="w-20 text-lg font-bold">ID</label>
              <input id="loginId" name="loginId" type="text" required className="bg-yellow-200 border border-gray-400 px-3 py-2 w-full ml-2 text-lg" />
            </div>
            <div className="flex items-center mb-6">
              <label htmlFor="password" className="w-20 text-lg font-bold">PW</label>
              <input id="password" name="password" type="password" required className="bg-yellow-200 border border-gray-400 px-3 py-2 w-full ml-2 text-lg" />
            </div>
            <button
              type="submit"
              className="w-full bg-[#003893] text-white py-3 text-lg font-bold rounded mb-2 hover:bg-[#002060]"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="w-full bg-[#003893] text-white py-3 text-lg font-bold rounded hover:bg-[#002060]"
            >
              회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
