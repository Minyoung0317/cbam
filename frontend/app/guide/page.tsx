"use client";

import { useState } from "react";
import Image from "next/image";


const TAB_LIST = [
  { label: "회원가입 및 로그인", key: "login", image: "/a1.png" },
  { label: "제품 정보 입력", key: "product", image: "/a2.png" },
  { label: "생산 공정 정보 입력", key: "process", image: "/a3.png" },
  { label: "배출량 자동 계산", key: "calculation", image: "/a4.png" },
  { label: "보고서 및 이력 관리", key: "report", image: "/a5.png" },
];

export default function GuidePage() {
  const [selectedTab, setSelectedTab] = useState("login");
  

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <header className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-2">
        <nav className="flex space-x-2 text-sm">
          <span> </span>
          <a href="/cbam" className="hover:text-blue-600">CBAM 소개</a>
          <span>|</span>
          <span className="font-bold">이용 안내</span>
          <span>|</span>
          <a href="/cbam-calculator" className="hover:text-blue-600">CBAM 계산기</a>
          <span>|</span>
          <a href="/mypage" className="hover:text-blue-600">My page</a>
        </nav>
        <div className="space-x-2">
          <a href="/" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Main</a>
          <a href="/login" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Logout</a>
        </div>
      </header>

      <div className="bg-[#00235B] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">이용 안내</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8">
        <div className="flex rounded-t-lg overflow-hidden border border-b-0">
          {TAB_LIST.map((tab) => (
            <button
              key={tab.key}
              className={`
                flex-1 py-3 px-4 text-base font-semibold
                ${selectedTab === tab.key ? "bg-[#00235B] text-white" : "bg-white text-gray-900"}
                border-r last:border-r-0 border-gray-200 transition
              `}
              onClick={() => setSelectedTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bg-white border border-t-0 rounded-b-lg p-8 flex flex-col items-center">
          <Image
            src={TAB_LIST.find((tab) => tab.key === selectedTab)?.image || "/cbot_logo.png"}
            alt={TAB_LIST.find((tab) => tab.key === selectedTab)?.label || ""}
            width={1400}
            height={500}
            className="mb-6"
            priority
          />
        </div>
      </div>
     
    </div>
  );
}
