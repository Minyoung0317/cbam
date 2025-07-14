"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 라벨
const LABELS = {
  kr: {
    cbamDefault: "CBAM 기본값 사용",
    cbamDesc: "이 보고서는 CBAM Default Value에 기반하여 산정된 예시 보고서입니다.",
    businessInfo: "1. 사업장 정보",
    businessName: "사업장명",
    representativeName: "대표자명",
    businessNumber: "사업자번호",
    address: "주소",
    city: "도시",
    country: "국가명",
    postalCode: "우편번호",
    unlocode: "UNLOCODE",
    coord: "주요 배출원 좌표",
    tel: "전화번호",
    email: "이메일",
    productInfo: "2. 제품 정보",
    productName: "품목명",
    cncode: "CN 코드",
    period: "기간",
    processTable: "3. 공정별 배출정보",
    process: "공정",
    material: "원료",
    fuel: "연료",
    emission: "총배출량",
    start: "시작일",
    end: "종료일",
    precursorTable: "4. 전구체 정보",
    precursorName: "전구체명",
    precursorRoute: "생산 경로",
    precursorCountry: "최종 생산 국가코드",
    pdf: "PDF로 저장",
    back: "돌아가기",
    publisher: "발행처",
    publishedDate: "발행일"
  },
  en: {
    cbamDefault: "CBAM Default Used",
    cbamDesc: "This report is a sample using the CBAM Default Value for calculation.",
    businessInfo: "1. Business Information",
    businessName: "Business Name",
    representativeName: "Representative",
    businessNumber: "Business Number",
    address: "Address",
    city: "City",
    country: "Country",
    postalCode: "Post Code",
    unlocode: "UNLOCODE",
    coord: "Coordinates",
    tel: "Contact",
    email: "Email",
    productInfo: "2. Product Information",
    productName: "Product Name",
    cncode: "CN Code",
    period: "Period",
    processTable: "3. Process Emission Info",
    process: "Process",
    material: "Material",
    fuel: "Fuel",
    emission: "Total Emission",
    start: "Start",
    end: "End",
    precursorTable: "4. Precursor Info",
    precursorName: "Precursor Name",
    precursorRoute: "Production Route",
    precursorCountry: "Final Country Code",
    pdf: "Export PDF",
    back: "Back",
    publisher: "Publisher",
    publishedDate: "Published Date"
  }
};
function getTodayString() {
  const today = new Date();
  // YYYY-MM-DD 포맷 반환
  return today.toISOString().slice(0, 10);  // 'YYYY-MM-DD'

}

// 국문 getter
function getKR(obj: any, key: string) {
  return obj?.[key] ?? "-";
}
// 영문 getter
function getEN(obj: any, key: string) {
  const map: any = {
    businessName: "businessNameEng",
    address: "streetAddress",
    city: "englishCity",
    productName: "productNameEng"
  };
  if (map[key]) return obj?.[map[key]] ?? "-";
  return obj?.[key] ?? "-";
}
// util 함수 위쪽에 추가
function formatProductionRoutesEn(routes: any[] = []) {
  if (!routes || !Array.isArray(routes)) return "-";
  return routes
    .map(r => `${r.order}. ${r.countryEn} (${r.countryCode})`)
    .join(' > ');
}

async function savePdfToServer(pdfBlob: Blob, filename: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', pdfBlob, filename);
  try {
    const res = await fetch('/api/report', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.url; // 서버에서 반환되는 파일 URL에 맞게 수정
    }
    return null;
  } catch (e) {
    return null;
  }
}

export default function CBAMFullReport() {
  // 1. DB 상태
  const [userData, setUserData] = useState<any>({});
  const [cbamData, setCbamData] = useState<any>({});
  const [precursorList, setPrecursorList] = useState<any[]>([]);
  const krRef = useRef<HTMLDivElement>(null);
  const enRef = useRef<HTMLDivElement>(null);
  const [reports, setReports] = useState<any[]>([]);
  // **createdAt 파싱**
  const searchParams = useSearchParams();
  const createdAt = searchParams ? searchParams.get("createdAt") : null;

  // 2. DB/API fetch (createdAt 반영)
  useEffect(() => {
    // 회원/사업장 정보
    fetch('/api/user/info', { credentials: 'include' })
      .then(r => r.json())
      .then(setUserData);

    // 제품/공정 데이터 (localStorage)
    const localCbam = JSON.parse(localStorage.getItem("cbamData") || "[]");
    const found = createdAt
      ? localCbam.find((d: any) => String(d.createdAt) === String(createdAt))
      : localCbam[0];
    setCbamData(found || {});

    // 전구체 정보
  
  const exported = localStorage.getItem('exportedPrecursors');
  if (exported) {
    setPrecursorList(JSON.parse(exported));
  } else {
    fetch('/api/my-precursors')
      .then(r => r.json())
      .then(setPrecursorList);
  }
}, [createdAt]);

  // 공정
  const processList = cbamData.processData || [];

  // PDF 2페이지 분리 저장
const handleSavePDF = async () => {
  const today = getTodayString();
  const productName = cbamData?.productName || '제품명미입력';
  const filename = `커뮤니케이션_보고서_${productName}_${today}.pdf`;

  const krTarget = krRef.current;
  const enTarget = enRef.current;
  if (!krTarget || !enTarget) {
    alert('캡처 대상이 없습니다.');
    return;
  }

  // jsPDF 캡처/이미지 변환 로직은 기존 그대로
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });

  const canvasKr = await html2canvas(krTarget, { scale: 2, useCORS: true });
  const imgKr = canvasKr.toDataURL('image/png');
  const pdfWidth = 420;
  const pdfHeight = 595;
  const imgWidth = canvasKr.width;
  const imgHeight = canvasKr.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const pdfImgWidth = imgWidth * ratio;
  const pdfImgHeight = imgHeight * ratio;
  pdf.addImage(imgKr, 'PNG', 0, 0, pdfImgWidth, pdfImgHeight);

  const canvasEn = await html2canvas(enTarget, { scale: 2, useCORS: true });
  const imgEn = canvasEn.toDataURL('image/png');
  const imgWidthEn = canvasEn.width;
  const imgHeightEn = canvasEn.height;
  const ratioEn = Math.min(pdfWidth / imgWidthEn, pdfHeight / imgHeightEn);
  const pdfImgWidthEn = imgWidthEn * ratioEn;
  const pdfImgHeightEn = imgHeightEn * ratioEn;
  pdf.addPage();
  pdf.addImage(imgEn, 'PNG', 0, 0, pdfImgWidthEn, pdfImgHeightEn);

  // (공통) PDF 저장: 다운로드
  pdf.save(filename);

  // (공통) 서버 업로드: Blob → Base64 변환 방식 사용(2번 파일 방식)
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  let url = "";
  try {
    const pdfBlob = pdf.output('blob');
    const pdfBase64 = await blobToBase64(pdfBlob);
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, pdfBase64 }),
    });
    if (res.ok) {
      const data = await res.json();
      url = data.url;
    }
  } catch (e) {
    url = "";
  }

  // (공통) localStorage 기록/보고서 관리
  const reportList = JSON.parse(localStorage.getItem('reportList') || '[]');
  reportList.push({
    no: reportList.length + 1,
    type: "커뮤니케이션 보고서",
    filename,
    savedDate: today,      // 'YYYY-MM-DD'
    printedDate: today,    // 'YYYY-MM-DD'
    pdfUrl: url,
  });
  localStorage.setItem('reportList', JSON.stringify(reportList));

  setReports?.(prev => [
    ...(prev || []),
    {
      no: (prev?.length || 0) + 1,
      type: "커뮤니케이션 보고서",
      filename,
      savedDate: today,
      printedDate: today,
      pdfUrl: url,
    }
  ]);

  if (url) {
    alert('PDF 저장 및 업로드 성공!');
  } else {
    alert('PDF 저장(로컬 기록) 완료, 서버 업로드는 실패했습니다.');
  }
};


  // precursor 표 구조(최신 mypage 구조)
  const precursorTableColumns = [
    { key: "no", kr: "No", en: "No" },
    { key: "name", kr: "전구체명", en: "Precursor Name" },
    { key: "productionRoute", kr: "생산 경로", en: "Production Route" },
    { key: "finalCountryCode", kr: "최종 생산 국가코드", en: "Final Country Code" }
  ];

  // 공정 표 구조
  const processTableColumns = [
    { key: "order", kr: "공정", en: "Process" },
    { key: "materials", kr: "원료", en: "Material", isArray: true },
    { key: "fuels", kr: "연료", en: "Fuel", isArray: true },
    { key: "totalProcessOverallEmission", kr: "총배출량", en: "Total Emission" },
    { key: "startDate", kr: "시작일", en: "Start" },
    { key: "endDate", kr: "종료일", en: "End" }
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col items-center py-10">
      <div className="w-full max-w-3xl flex justify-end items-center gap-2 mb-4">
        <button
            className="px-4 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-800"
            onClick={handleSavePDF}
          >
            커뮤니케이션 보고서 PDF 저장
          </button>

      </div>
      {/* --- 국문 보고서 --- */}
      <div ref={krRef} className="w-full max-w-3xl bg-white border rounded-lg shadow p-8 mb-12">
        {/* CBAM 안내 박스 */}
        <div className="flex items-center mb-5">
          <div className="bg-[#f7eac4] border border-[#d9bc6b] text-[#735b13] font-semibold px-4 py-2 rounded mr-4">
            {LABELS.kr.cbamDefault}
          </div>
          <span className="text-xs text-[#555]">{LABELS.kr.cbamDesc}</span>
        </div>
        {/* --- 사업장 정보 --- */}
<div className="font-bold text-base mb-2">{LABELS.kr.businessInfo}</div>
<div className="grid grid-cols-12 gap-2 items-center text-sm">
  {/* 기존 첫 번째 줄 */}
  <div className="col-span-2 font-semibold">{LABELS.kr.businessName}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getKR(userData, "name")}</div>
  <div className="col-span-2 font-semibold">{LABELS.kr.representativeName}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getKR(userData, "representativeName")}</div>
  <div className="col-span-2 font-semibold">{LABELS.kr.businessNumber}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getKR(userData, "businessNumber")}</div>
  {/* 두 번째 줄 */}
  <div className="col-span-2 font-semibold">{LABELS.kr.address}</div>
  <div className="col-span-4 bg-gray-100 rounded px-2 py-1">{getKR(userData, "address")}</div>
  <div className="col-span-2 font-semibold">{LABELS.kr.city}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getKR(userData, "city")}</div>
  <div className="col-span-2"></div>
  {/* 국가코드: 한 칸 아래, 길게 */}
  <div className="col-span-2 font-semibold mt-2">{LABELS.kr.country}</div>
  <div className="col-span-10 bg-gray-100 rounded px-2 py-1 mt-2">
    {getKR(userData, "country")}
  </div>
  {/* 세 번째 줄 */}
  <div className="col-span-2 font-semibold">{LABELS.kr.unlocode}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getKR(userData, "unlocode")}</div>
  <div className="col-span-2 font-semibold">{LABELS.kr.coord}</div>
  <div className="col-span-4 bg-gray-100 rounded px-2 py-1">
  {(userData.latitude !== undefined && userData.latitude !== null && userData.latitude !== "-")
    ? Number(userData.latitude).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "-"}
  {", "}
  {(userData.longitude !== undefined && userData.longitude !== null && userData.longitude !== "-")
    ? Number(userData.longitude).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "-"}
</div>

  <div className="col-span-2"></div>
  {/* 전화번호: 한 칸 아래, 길게 */}
  <div className="col-span-2 font-semibold mt-2">{LABELS.kr.tel}</div>
  <div className="col-span-10 bg-gray-100 rounded px-2 py-1 mt-2">
    {getKR(userData, "phoneNumber")}
  </div>
  {/* 이메일 줄은 그대로 */}
  <div className="col-span-2 font-semibold">{LABELS.kr.email}</div>
  <div className="col-span-4 bg-gray-100 rounded px-2 py-1">{getKR(userData, "email")}</div>
</div>

       {/* --- 제품 정보 --- */}
<div className="font-bold text-base mb-2">{LABELS.kr.productInfo}</div>
<div className="grid grid-cols-12 gap-2 items-center text-sm">
  {/* 1줄: 제품명, CN 코드 */}
  <div className="col-span-2 font-semibold">{LABELS.kr.productName}</div>
  <div className="col-span-3 bg-gray-100 rounded px-2 py-1">{getKR(cbamData, "item")}</div>
  <div className="col-span-2 font-semibold">{LABELS.kr.cncode}</div>
  <div className="col-span-3 bg-gray-100 rounded px-2 py-1">{getKR(cbamData, "cnCode")}</div>
  {/* 나머지 2칸은 비워두기 (정렬 유지) */}
  <div className="col-span-2"></div>
  {/* 2줄: 기간(한줄 전체) */}
  <div className="col-span-2 font-semibold mt-2">{LABELS.kr.period}</div>
  <div className="col-span-10 bg-gray-100 rounded px-2 py-1 mt-2">
    {getKR(cbamData, "startDate")} ~ {getKR(cbamData, "endDate")}
  </div>
</div>
        {/* --- 공정별 배출정보 --- */}
        <div className="font-bold text-base mb-2">{LABELS.kr.processTable}</div>
        <table className="w-full border text-center text-xs mb-6">
          <thead className="bg-gray-100">
            <tr>
              {processTableColumns.map(col => (
                <th key={col.key} className="border px-2 py-1">{col.kr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(processList.length === 0) ? (
              <tr><td className="border px-2 py-1" colSpan={processTableColumns.length}>-</td></tr>
            ) : processList.map((p: any, i: number) => (
              <tr key={i}>
                <td className="border px-2 py-1">{getKR(p, "order")}</td>
                <td className="border px-2 py-1">{(p.materials ?? []).map((m: any) => getKR(m, "name")).join(", ") || "-"}</td>
                <td className="border px-2 py-1">{(p.fuels ?? []).map((f: any) => getKR(f, "name")).join(", ") || "-"}</td>
                <td className="border px-2 py-1">
  {p.totalProcessOverallEmission !== undefined && p.totalProcessOverallEmission !== null
    ? Number(p.totalProcessOverallEmission).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "-"}
</td>

                <td className="border px-2 py-1">{getKR(p, "startDate")}</td>
                <td className="border px-2 py-1">{getKR(p, "endDate")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* --- 전구체 정보 --- */}
        <div className="font-bold text-base mb-2">{LABELS.kr.precursorTable}</div>
        <table className="w-full border text-center text-xs">
          <thead className="bg-gray-100">
            <tr>
              {precursorTableColumns.map(col => (
                <th key={col.key} className="border px-2 py-1">{col.kr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(precursorList.length === 0) ? (
              <tr><td className="border px-2 py-1" colSpan={precursorTableColumns.length}>-</td></tr>
            ) : precursorList.map((p, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{i + 1}</td>
                <td className="border px-2 py-1">{p.name}</td>
                <td className="border px-2 py-1">{p.productionRoute}</td>
                <td className="border px-2 py-1">{p.finalCountryCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* --- 영문 보고서 --- */}
      <div ref={enRef} className="w-full max-w-3xl bg-white border rounded-lg shadow p-8">
        {/* CBAM 안내 박스 */}
        <div className="flex items-center mb-5">
          <div className="bg-[#e5f0ff] border border-[#8cb4e9] text-[#1a2e5c] font-semibold px-4 py-2 rounded mr-4">
            {LABELS.en.cbamDefault}
          </div>
          <span className="text-xs text-[#555]">{LABELS.en.cbamDesc}</span>
        </div>
        {/* Business Info */}
<div className="font-bold text-base mb-2">{LABELS.en.businessInfo}</div>
<div className="grid grid-cols-12 gap-2 items-center text-sm">
  {/* 첫 번째 줄 */}
  <div className="col-span-2 font-semibold">{LABELS.en.businessName}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getEN(userData, "businessName")}</div>
  <div className="col-span-2 font-semibold">{LABELS.en.representativeName}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getEN(userData, "representativeNameEn")}</div>
  <div className="col-span-2 font-semibold">{LABELS.en.businessNumber}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getEN(userData, "businessNumber")}</div>
  {/* 두 번째 줄 */}
  <div className="col-span-2 font-semibold">{LABELS.en.address}</div>
  <div className="col-span-4 bg-gray-100 rounded px-2 py-1">{getEN(userData, "address")}</div>
  <div className="col-span-2 font-semibold">{LABELS.en.city}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getEN(userData, "city")}</div>
  <div className="col-span-2"></div>
  {/* Country Code: 한 칸 아래, 길게 */}
  <div className="col-span-2 font-semibold mt-2">{LABELS.en.country}</div>
  <div className="col-span-10 bg-gray-100 rounded px-2 py-1 mt-2">
    {getEN(userData, "countryEng")}
  </div>
  {/* 세 번째 줄 */}
  <div className="col-span-2 font-semibold">{LABELS.en.unlocode}</div>
  <div className="col-span-2 bg-gray-100 rounded px-2 py-1">{getEN(userData, "unlocode")}</div>
  <div className="col-span-2 font-semibold">{LABELS.en.coord}</div>
  <div className="col-span-4 bg-gray-100 rounded px-2 py-1">
  {(userData.latitude !== undefined && userData.latitude !== null && userData.latitude !== "-")
    ? Number(userData.latitude).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "-"}
  {", "}
  {(userData.longitude !== undefined && userData.longitude !== null && userData.longitude !== "-")
    ? Number(userData.longitude).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "-"}
</div>
  <div className="col-span-2"></div>
  {/* Tel: 한 칸 아래, 길게 */}
  <div className="col-span-2 font-semibold mt-2">{LABELS.en.tel}</div>
  <div className="col-span-10 bg-gray-100 rounded px-2 py-1 mt-2">
    {getEN(userData, "phoneNumber")}
  </div>
  {/* Email 줄은 그대로 */}
  <div className="col-span-2 font-semibold">{LABELS.en.email}</div>
  <div className="col-span-4 bg-gray-100 rounded px-2 py-1">{getEN(userData, "email")}</div>
</div>

        {/* Product Info */}
<div className="font-bold text-base mb-2">{LABELS.en.productInfo}</div>
<div className="grid grid-cols-12 gap-2 items-center text-sm">
  {/* 1st row: Product Name, CN Code */}
  <div className="col-span-2 font-semibold">{LABELS.en.productName}</div>
  <div className="col-span-3 bg-gray-100 rounded px-2 py-1">{getEN(cbamData, "productnameEn")}</div>
  <div className="col-span-2 font-semibold">{LABELS.en.cncode}</div>
  <div className="col-span-3 bg-gray-100 rounded px-2 py-1">{getEN(cbamData, "cnCode")}</div>
  <div className="col-span-2"></div>
  {/* 2nd row: Period */}
  <div className="col-span-2 font-semibold mt-2">{LABELS.en.period}</div>
  <div className="col-span-10 bg-gray-100 rounded px-2 py-1 mt-2">
    {getEN(cbamData, "startDate")} ~ {getEN(cbamData, "endDate")}
  </div>
</div>

        {/* Process Table */}
        <div className="font-bold text-base mb-2">{LABELS.en.processTable}</div>
        <table className="w-full border text-center text-xs mb-6">
          <thead className="bg-gray-100">
            <tr>
              {processTableColumns.map(col => (
                <th key={col.key} className="border px-2 py-1">{col.en}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(processList.length === 0) ? (
              <tr><td className="border px-2 py-1" colSpan={processTableColumns.length}>-</td></tr>
            ) : processList.map((p: any, i: number) => (
              <tr key={i}>
                <td className="border px-2 py-1">{getEN(p,"order")}</td>
                <td className="border px-2 py-1">{(p.materials ?? []).map((m: any) => getEN(m, "nameEn")).join(", ") || "-"}</td>
                <td className="border px-2 py-1">{(p.fuels ?? []).map((f: any) => getEN(f, "nameEn")).join(", ") || "-"}</td>
                <td className="border px-2 py-1">
  {p.totalProcessOverallEmission !== undefined && p.totalProcessOverallEmission !== null
    ? Number(p.totalProcessOverallEmission).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "-"}
</td>
                <td className="border px-2 py-1">{getEN(p, "startDate")}</td>
                <td className="border px-2 py-1">{getEN(p, "endDate")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Precursor Info (mypage 표 그대로) */}
        <div className="font-bold text-base mb-2">{LABELS.en.precursorTable}</div>
        <table className="w-full border text-center text-xs">
          <thead className="bg-gray-100">
            <tr>
              {precursorTableColumns.map(col => (
                <th key={col.key} className="border px-2 py-1">{col.en}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(precursorList.length === 0) ? (
              <tr><td className="border px-2 py-1" colSpan={precursorTableColumns.length}>-</td></tr>
            ) : precursorList.map((p, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{i + 1}</td>
                <td className="border px-2 py-1">{p.nameEn || p.name}</td>
                <td className="border px-2 py-1">{p.productionRoutesEn
    ? formatProductionRoutesEn(p.productionRoutesEn)
    : p.productionRoutesEn || p.productionRoute}</td>
                <td className="border px-2 py-1">{p.finalCountryCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
