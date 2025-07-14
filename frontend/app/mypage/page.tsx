'use client'

import html2canvas from 'html2canvas';
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from 'next/dynamic'
import MainHeader from "@/components/main-header"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PostcodeSearchModal from "@/components/PostcodeSearchModal"
import PrecursorManagementModal from "@/components/PrecursorManagementModal"
import {
  Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, PieChart, Pie, Cell, Bar
} from 'recharts'
import Link from "next/link"
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';

// 1. 색상 팔레트 및 getColor 함수 추가 (import 바로 아래 위치 추천)
const BASE_COLORS = [
  '#4f8ef7', '#f7b84f', '#82ca9d', '#8884d8', '#ff7f50'
];
const getColor = (idx: number): string => {
  if (idx < BASE_COLORS.length) return BASE_COLORS[idx];
  // 랜덤 6자리 hex
  return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
};
interface ReportItem {
  no: number;
  type: string;
  filename: string;
  savedDate: string;
  printedDate: string;
  pdfUrl?: string; // 실제 구현시 PDF 파일의 URL
}

interface UserData {
  id: string;
  email: string;
  password?: string;
  businessName: string;
  businessNameEng: string;
  address: string;
  postalCode: string;
  country: string;
  unlocode: string;
  latitude: string;
  longitude: string;
  representativeName: string;
  phoneNumber: string;
  managerName: string;
  managerContact: string;
  managerEmail: string;
  economicActivity: string;
  logoUrl?: string;
  englishCity: string;
  streetAddress: string;
  postBox?: string;
  name: string;
  industry: string;
}

interface MyPagePrecursor {
  _id?: string;
  no: number;
  name: string;
  nameEn: string;
  productionRoute: string;
  finalCountryCode: string;
  productionRoutes?: { order: number; country: string; countryCode: string }[];
  productionRoutesEn?: { order: number; countryEn: string; countryCode: string }[];
}

interface ProcessTotal {
  label: string;
  value: number;
  percentage: number;
}

const tabs = [
  { id: 'info', label: '회원 정보' },
  { id: 'company', label: '사업장 관리' },
  { id: 'precursors', label: '전구물질 관리' },
  { id: 'ghg', label: '온실가스 배출 현황' },
  { id: 'report', label: '보고서 관리' },
];

export default function MyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id)
  const [precursorList, setPrecursorList] = useState<MyPagePrecursor[]>([])
  const [showPrecursorModal, setShowPrecursorModal] = useState(false)
  const [editingPrecursor, setEditingPrecursor] = useState<MyPagePrecursor | null>(null)
  const [cbamData, setCbamData] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const componentRef = useRef<HTMLDivElement>(null);
  const [reports, setReports] = useState<any[]>([]);

const updateReports = (newReports: any[]) => {
  setReports(newReports);
  localStorage.setItem('reportList', JSON.stringify(newReports));
};
useEffect(() => {
  const saved = localStorage.getItem('reportList');
  if (saved) setReports(JSON.parse(saved));
}, []);

  async function savePdfToServer(pdfBlob: Blob, filename: string): Promise<string | null> {
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const pdfBase64 = await blobToBase64(pdfBlob);

  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, pdfBase64 }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url as string; // /reports/파일명.pdf
}

  function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}
const handleSaveReport = async () => {
  const today = getTodayString();
  const filename = `온실가스_배출_현황_${today}.pdf`;

  // 1. 캡처할 영역 가져오기
  const target = componentRef.current;
  if (!target) {
    alert('캡처 대상이 없습니다.');
    return;
  }

  // 2. html2canvas로 전체 화면 캡처
  const canvas = await html2canvas(target, { scale: 2, useCORS: true });

  // 3. 이미지 데이터 준비
  const imgData = canvas.toDataURL('image/png');

  // 4. PDF 사이즈/비율 계산
  const pdfWidth = 842; // landscape width(px)
  const pdfHeight = 595; // landscape height(px)
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const pdfImgWidth = imgWidth * ratio;
  const pdfImgHeight = imgHeight * ratio;

  // 5. 여러 페이지 나누기
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [pdfWidth, pdfHeight]
  });

  if (pdfImgHeight <= pdfHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, pdfImgWidth, pdfImgHeight);
  } else {
    let remainHeight = pdfImgHeight;
    let y = 0;
    while (remainHeight > 0) {
      pdf.addImage(
        imgData,
        'PNG',
        0,
        y ? 0 : 0,
        pdfImgWidth,
        pdfImgHeight,
        undefined,
        'FAST'
      );
      remainHeight -= pdfHeight;
      y += pdfHeight;
      if (remainHeight > 0) pdf.addPage([pdfWidth, pdfHeight], 'landscape');
    }
  }

  // 6. 브라우저 다운로드 폴더에 PDF 저장
  pdf.save(filename);

  // 7. 서버 업로드(기존 로직, 필요할 때만 사용)
  const pdfBlob = pdf.output('blob');
  const url = await savePdfToServer(pdfBlob, filename);

  // 8. 보고서 목록에 추가 (여기서 updateReports로 바꿔주세요!)
  if (url) {
    const newReports = [
      ...reports,
      {
        no: reports.length + 1,
        type: "온실가스 배출 현황",
        filename,
        savedDate: today,
        printedDate: today,
        pdfUrl: url,
      }
    ];
    updateReports(newReports);
    alert('PDF 저장 및 업로드 성공!');
  } else {
    alert('PDF 저장 실패');
  }
};

const handleExportPrecursors = async () => {
  try {
    const res = await fetch('http://192.168.0.9:3000/cbam-calculator/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(precursorList),
    });
    if (!res.ok) throw new Error('전송 실패');
    // alert('전구물질 데이터가 성공적으로 내보내졌습니다.');
    // 자동이므로 alert는 빼거나 콘솔로만!
    console.log('전구물질 데이터 자동 내보내기 성공');
  } catch (e: any) {
    // alert('내보내기 실패: ' + e.message);
    console.error('전구물질 자동 내보내기 실패:', e.message);
  }
};

  function getProcessMonthlyEmission(productData: any) {
  if (!productData) return [];
  const processMap: { [name: string]: number[] } = {};
  productData.processData.forEach((proc: any) => {
    if (!processMap[proc.name]) processMap[proc.name] = Array(12).fill(0);
    const month = proc.startDate ? new Date(proc.startDate).getMonth() : 0;
    processMap[proc.name][month] += proc.totalProcessOverallEmission || 0;
  });
  return Object.entries(processMap).map(([name, monthly], idx) => ({
    name,
    monthly,
    color: getColor(idx)
  }));
}
 const visibleReports = reports.length > 0
    ? reports
    : [{ no: 1, type: '', filename: '', savedDate: '', printedDate: '', }];

  useEffect(() => {
    fetchUserData()

    const tabFromUrl = searchParams?.get('tab');
    if (tabFromUrl === 'emissionStatus') {
      const targetTab = tabs.find(t => t.id === 'ghg');
      if (targetTab) {
        setActiveTab(targetTab.id);
      }
    } else if (tabFromUrl) {
      const targetTab = tabs.find(t => t.id === tabFromUrl);
      if (targetTab) {
        setActiveTab(targetTab.id);
      }
    }

    if (typeof window !== "undefined") {
      const data = JSON.parse(localStorage.getItem("cbamData") || "[]");
      setCbamData(data);
      if (data.length > 0) setSelectedProduct(data[0].productName);
    }

  }, [searchParams])
useEffect(() => {
  if (activeTab === 'precursors' && precursorList.length > 0) {
    handleExportPrecursors();
    localStorage.setItem('exportedPrecursors', JSON.stringify(precursorList));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, precursorList]);
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/info', {
        credentials: 'include'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '사용자 정보를 불러올 수 없습니다.')
      }

      console.log('API Response:', data)
      setUserData(data)
      setEditData(data)
    } catch (err: any) {
      console.error('Error fetching user data:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData(userData)
    setIsEditing(false)
    setError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditData(prev => prev ? {
      ...prev,
      [name]: value
    } : null)
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '정보 업데이트에 실패했습니다.')
      }

      setUserData(editData)
      setIsEditing(false)
      setError(null)
      alert('정보가 성공적으로 업데이트되었습니다.')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAddressComplete = (data: {
    address: string;
    zonecode: string;
    latitude: number;
    longitude: number;
    unlocode?: string;
    cityEng?: string;
    street?: string;
  }) => {
    console.log("MyPage Address data received:", data);
    setEditData(prev => {
      const baseData = prev || (
        userData || {
          id: '', email: '', password: '', businessName: '', businessNameEng: '',
          address: '', postalCode: '',
          country: '', latitude: '',
          longitude: '', representativeName: '', phoneNumber: '', managerName: '',
          managerContact: '', managerEmail: '', economicActivity: '', logoUrl: '',
          englishCity: '', streetAddress: '', postBox: '',
          unlocode: ''
        } as UserData
      );
      const newState = {
        ...baseData,
        address: data.address,
        postalCode: data.zonecode,
        englishCity: data.cityEng || '',
        streetAddress: data.street || '',
        unlocode: data.unlocode || baseData.unlocode || '',
        latitude: String(data.latitude || baseData.latitude || '37.5665'),
        longitude: String(data.longitude || baseData.longitude || '126.9780'),
      } as UserData;
      console.log("MyPage New editData state:", newState);
      return newState;
    });
  };

  const fetchPrecursorsFromDB = async () => {
    try {
      const res = await fetch('/api/my-precursors');
      if (!res.ok) throw new Error('DB 조회 오류');
      const data = await res.json();
      setPrecursorList(
        data.map((item: any, idx: number) => ({
          _id: item._id,
          no: idx + 1,
          name: item.name,
          nameEn: item.nameEn,
          productionRoute: (item.productionRoutes || []).map((r: any) => `${r.order}. ${r.country}(${r.countryCode})`).join(' > '),
          finalCountryCode: (item.productionRoutes || []).slice(-1)[0]?.countryCode || '',
          productionRoutes: item.productionRoutes || [],
          productionRoutesEn: (item.productionRoutes || []).map((r: any) => ({
            order: r.order, 
            countryEn: r.countryEn,
            countryCode: r.countryCode,
          })),

        }))
      );
    } catch (e) {
      setPrecursorList([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'precursors') {
      fetchPrecursorsFromDB();
    }
  }, [activeTab]);

  const handleAddPrecursorClick = () => {
    setEditingPrecursor(null);
    setShowPrecursorModal(true);
  };

  const handleEditPrecursorClick = (precursor: MyPagePrecursor) => {
    setEditingPrecursor(precursor);
    setShowPrecursorModal(true);
  };

  const handleDeletePrecursor = async (precursorId: string | undefined) => {
    if (!precursorId) return;
    if (confirm('정말로 이 전구물질 정보를 삭제하시겠습니까?')) {
      try {
        const res = await fetch(`/api/my-precursors?id=${precursorId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('DB 삭제 오류');
        await fetchPrecursorsFromDB();
      } catch (e) {
        alert('삭제 실패');
      }
    }
  };

  const handleSavePrecursor = async (data: { name: string; nameEn: string;
    string; productionRoutes: { order: number; country: string; countryCode: string; 
    productionRoutesEn: { order: number; countryEn: string; countryCode: string; } }[] }) => {
    try {
      const res = await fetch('/api/my-precursors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([data]),
      });
      if (!res.ok) throw new Error('DB 저장 오류');
      await fetchPrecursorsFromDB();
      setShowPrecursorModal(false);
    } catch (e) {
      alert('저장 실패');
    }
  };

  const handleSaveAllPrecursors = async () => {
    try {
      const modifiedPrecursors = precursorList.filter(precursor => precursor._id === undefined);

      const response = await fetch('/api/my-precursors/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modifiedPrecursors),
      });
      if (!response.ok) throw new Error('DB 저장 오류');
      alert('모든 전구물질이 성공적으로 저장되었습니다.');
    } catch (error: any) {
      alert('저장 실패: ' + error.message);
    }
  };

  // 2. 제품/공정/월별 그룹핑
  const productList = Array.from(new Set(cbamData.map(d => d.productName)));
  const selectedProductData = cbamData.find(d => d.productName === selectedProduct);

  // 월별 라벨 (1~12월)
  const monthLabels = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

  // 제품별 월별 총배출량
  const productMonthly = productList.map((product: string) => {
    const productData = cbamData.find((d: any) => d.productName === product);
    const monthly = Array(12).fill(0);
    if (productData) {
      productData.processData.forEach((proc: any) => {
        const month = proc.startDate ? new Date(proc.startDate).getMonth() : 0;
        monthly[month] += proc.totalProcessOverallEmission || 0;
      });
    }
    return {
      label: product,
      data: monthly,
      borderColor: "#" + Math.floor(Math.random()*16777215).toString(16),
      fill: false,
    };
  });

  // 선택 제품의 공정별 총배출량
  const processList = selectedProductData?.processData.map((p: any) => p.name) || [];
  const processTotal: ProcessTotal[] = selectedProductData?.processData.map((proc: any) => ({
    label: proc.name,
    value: proc.totalProcessOverallEmission || 0,
  })) || [];
  const totalEmission = processTotal.reduce((sum: number, p: any) => sum + p.value, 0);

  // 차트 데이터
  const lineData = {
    labels: monthLabels,
    datasets: productMonthly,
  };
  const barData = {
    labels: processList,
    datasets: [{
      label: "공정별 배출량",
      data: processTotal.map(p => p.value),
      backgroundColor: processList.map(() => "#" + Math.floor(Math.random()*16777215).toString(16)),
    }]
  };
  const pieData = {
    labels: processList,
    datasets: [{
      data: processTotal.map(p => p.value),
      backgroundColor: processList.map(() => "#" + Math.floor(Math.random()*16777215).toString(16)),
    }]
  };

  const handleTabChange = (tabId: string) => {
    const targetTab = tabs.find(t => t.id === tabId);
    if (targetTab) {
      setActiveTab(targetTab.id);
    }
  };

  const handlePrint = useReactToPrint({
  contentRef: componentRef,
  documentTitle: `온실가스_배출_현황_${getTodayString()}`,
  onAfterPrint: () => {
    const today = getTodayString();
    const fileName = `온실가스_배출_현황_${today}.pdf`;

    setReports(prev => [
      ...prev,
      {
        no: prev.length + 1,
        type: "온실가스 배출 현황",
        filename: fileName,
        savedDate: today,
        printedDate: today,
        // pdfUrl: 실제 PDF 다운로드/저장 기능 구현시 저장된 경로
      }
    ]);
  }
});



  if (isLoading) {
    return (
      <>
        <div>로딩 중...</div>
      </>
    );
  }
  

return (
  <div className="min-h-screen bg-[#f5f6fa]">
    <header className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-2">
  <nav className="flex space-x-2 text-sm">
    <span> </span>
    <a href="/cbam" className="hover:text-blue-600">CBAM 소개</a>
    <span>|</span>
    <a href="/guide" className="hover:text-blue-600">이용 안내</a>
    <span>|</span>
    <a href="/cbam-calculator" className="hover:text-blue-600">CBAM 계산기</a>
    <span>|</span>
    <span className="font-bold">My page</span>
  </nav>
  <div className="space-x-2">
    <a href="/" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Main</a>
    <a href="/login" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Logout</a>
  </div>
</header>

    {/* 상단: 타이틀+탭 */}
    <div className="bg-[#00235B] pb-2">
      <h1 className="text-center text-4xl font-bold text-white py-4">My page</h1>
      <nav className="flex justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-6 py-3 text-base font-bold border-b-4 transition-all
              ${activeTab === tab.id 
                ? 'bg-white text-[#00235B] border-[#00235B] z-10' 
                : 'bg-[#00235B] text-white border-transparent hover:bg-blue-900'}`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            style={{ minWidth: '140px' }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>

    {/* 카드 컨테이너로 탭별 내용, 버튼, 모달 전체 감싸기 */}
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded shadow-lg p-8 border border-gray-200">

      {/* 회원 정보 탭 */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold mb-4">회원 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID</label>
                <input
                  type="text"
                  value={userData?.id || ''}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">비밀번호</label>
                {isEditing ? (
                  <input
                    type="password"
                    name="password"
                    placeholder="변경할 비밀번호 입력"
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <input
                    type="password"
                    value="********"
                    disabled
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 사업장 정보 탭 */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold mb-4">사업장 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">사업장명 (국문)</label>
                <input
                  type="text"
                  name="name"
                  value={isEditing ? editData?.name : userData?.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">사업장명 (영문)</label>
                <input
                  type="text"
                  name="businessNameEng"
                  value={isEditing ? editData?.businessNameEng : userData?.businessNameEng}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">대표자명</label>
                <input
                  type="text"
                  name="representativeName"
                  value={isEditing ? editData?.representativeName : userData?.representativeName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">연락처</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={isEditing ? editData?.phoneNumber : userData?.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">담당자명</label>
                <input
                  type="text"
                  name="managerName"
                  value={isEditing ? editData?.managerName || editData?.name || '' : userData?.managerName || userData?.name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">담당자 연락처</label>
                <input
                  type="text"
                  name="managerContact"
                  value={isEditing ? editData?.managerContact || editData?.phoneNumber || '' : userData?.managerContact || userData?.phoneNumber || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">담당자 이메일</label>
                <input
                  type="email"
                  name="managerEmail"
                  value={isEditing ? editData?.managerEmail || editData?.email || '' : userData?.managerEmail || userData?.email || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">경제 활동(업종)</label>
                <input
                  type="text"
                  name="economicActivity"
                  value={isEditing ? editData?.economicActivity || editData?.industry || '' : userData?.economicActivity || userData?.industry || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">국문 주소</label>
                <input
                  type="text"
                  name="address"
                  value={isEditing ? editData?.address || '' : userData?.address || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">우편번호</label>
                <input
                  type="text"
                  name="postalCode"
                  value={isEditing ? editData?.postalCode || '' : userData?.postalCode || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">영문 도시</label>
                <input
                  type="text"
                  name="englishCity"
                  value={(isEditing ? editData?.englishCity : userData?.englishCity) || ''}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">영문 도로명/지번</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={(isEditing ? editData?.streetAddress : userData?.streetAddress) || ''}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">국가</label>
                <input
                  type="text"
                  name="country"
                  value={(isEditing ? editData?.country : userData?.country) || ''}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">UNLOCODE</label>
                <input
                  type="text"
                  name="unlocode"
                  value={(isEditing ? editData?.unlocode : userData?.unlocode) || ''}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">위도</label>
                <input
                  type="text"
                  name="latitude"
                  value={(isEditing ? editData?.latitude : userData?.latitude) || ''}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">경도</label>
                <input
                  type="text"
                  name="longitude"
                  value={(isEditing ? editData?.longitude : userData?.longitude) || ''}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">사서함</label>
                <input
                  type="text"
                  name="postBox"
                  value={isEditing ? editData?.postBox || '' : userData?.postBox || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${!isEditing && 'bg-gray-100'}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전구물질 관리 탭 */}
      {activeTab === 'precursors' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSaveAllPrecursors}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
            >
              저장
            </button>
            <button
              onClick={() => setShowPrecursorModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add
            </button>
          </div>
          <PrecursorManagementModal
            isOpen={showPrecursorModal}
            onClose={() => setShowPrecursorModal(false)}
            onSave={handleSavePrecursor}
          />
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-[#00235B] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">전구물질명</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">생산 경로</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">최종 생산 국가 코드</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody>
                {precursorList.map((precursor, index) => (
                  <tr key={precursor._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{precursor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{precursor.productionRoute}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{precursor.finalCountryCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleEditPrecursorClick(precursor)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 mr-2"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeletePrecursor(precursor._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 온실가스 배출 현황(ghg) 탭 */}
      {activeTab === 'ghg' && (
        <>
          {/* 1. PDF 버튼 */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={handleSaveReport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              PDF로 출력
            </button>
          </div>
          {/* 2. 선택 제품별 대시보드 */}
          <div ref={componentRef}>
            <div className="flex gap-6">
              {/* 2-1. 왼쪽: 제품 선택 */}
              <div className="w-40 flex-shrink-0">
                <h3 className="font-bold mb-2">제품</h3>
                <ul>
                  {productList.map(name => (
                    <li key={name}>
                      <button
                        className={`w-full text-left px-2 py-1 rounded ${selectedProduct === name ? "bg-blue-200" : ""}`}
                        onClick={() => setSelectedProduct(name)}
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* 2-2. 가운데: 선택 제품 월별 차트/표 + 공정별 차트/표(아래) */}
              <div className="flex-1 pr-4">
                {/* 월별 차트/테이블 */}
                <h3 className="font-bold mb-2">{selectedProduct} 월간 온실가스 배출량</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthLabels.map((label, i) => {
                    const row = { month: label };
                    productMonthly.forEach(pm => { row[pm.label] = pm.data[i]; });
                    return row;
                  })}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
  formatter={(value: any) =>
    typeof value === "number"
      ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value
  }
/>
                    <Legend />
                    {productMonthly.map((pm, idx) => (
                      <Line
                        key={pm.label}
                        type="monotone"
                        dataKey={pm.label}
                        stroke={getColor(idx)}
                        strokeWidth={selectedProduct === pm.label ? 3 : 1.5}
                        dot={selectedProduct === pm.label}
                        opacity={selectedProduct === pm.label ? 1 : 0.4}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <table className="w-full mt-4 border text-xs">
                  <thead>
                    <tr>
                      <th>제품명</th>
                      {monthLabels.map((m, i) => <th key={i}>{m}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {productMonthly.map(pm => (
                      <tr
                        key={pm.label}
                        className={selectedProduct === pm.label ? "font-bold bg-blue-50" : ""}
                      >
                        <td>{pm.label}</td>
                        {pm.data.map((v, i) => <td key={i}>{v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* 공정별 차트/테이블: 아래로 배치 */}
                <div className="mt-8">
                  <h3 className="font-bold mb-2">{selectedProduct} 공정별 배출량</h3>
                  <ResponsiveContainer width="100%" height={110}>
                    <BarChart data={processTotal}>
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
  formatter={(value: any) =>
    typeof value === "number"
      ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value
  }
/>
                      <Bar dataKey="value">
                        {processTotal.map((p, idx) => (
                          <Cell key={p.label} fill={getColor(idx)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={110}>
                    <PieChart>
                      <Pie
                        data={processTotal}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={40}
                        label={(entry) =>
    entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
>
  {processTotal.map((p, idx) => (
    <Cell key={p.label} fill={getColor(idx)} />
  ))}
</Pie>
                      <Tooltip
  formatter={(value: any) =>
    typeof value === "number"
      ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value
  }
/>
                    </PieChart>
                  </ResponsiveContainer>
                  <table className="w-full mt-2 border text-xs">
                    <thead>
                      <tr>
                        <th>공정명</th>
                        <th>총배출량</th>
                        <th>비중(%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processTotal.map((p, idx) => (
                        <tr key={p.label}>
                          <td>{p.label}</td>
                          <td>{p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
<td>
  {totalEmission
    ? ((p.value / totalEmission) * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00"
  }%
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* 3. 전체 제품/공정 종합 대시보드 */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-[#00235B]">전체 제품 온실가스 배출 현황</h2>
              {productList.map((product, pIdx) => {
                const productData = cbamData.find(d => d.productName === product);
                // 제품별 월간 총배출량
                const monthlyTotal = Array(12).fill(0);
                productData?.processData.forEach((proc) => {
                  const month = proc.startDate ? new Date(proc.startDate).getMonth() : 0;
                  monthlyTotal[month] += proc.totalProcessOverallEmission || 0;
                });
                // 공정별 월간 집계
                const processMonthly = getProcessMonthlyEmission(productData);
                return (
                  <section key={product} className="mb-12 border-b pb-8">
                    <h3 className="text-xl font-semibold mb-4 text-[#00235B]">{product}</h3>
                    <h4 className="font-bold mb-2">월간 온실가스 배출량</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={monthLabels.map((label, i) => ({ month: label, [product]: monthlyTotal[i] }))}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
  formatter={(value: any) =>
    typeof value === "number"
      ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value
  }
/>
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={product}
                          stroke={getColor(pIdx)}
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <table className="w-full mt-2 border text-xs">
                      <thead>
                        <tr>
                          <th>제품명</th>
                          {monthLabels.map((m, i) => <th key={i}>{m}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{product}</td>
                          {monthlyTotal.map((v, i) => <td key={i}>{v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>)}
                        </tr>
                      </tbody>
                    </table>
                    {/* 공정별 월간 차트+표 */}
                    <h4 className="font-bold mt-6 mb-2">공정별 월간 온실가스 배출량 (군집형 비교)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={monthLabels.map((label, monthIdx) => {
                          const row = { month: label };
                          processMonthly.forEach(proc => { row[proc.name] = proc.monthly[monthIdx]; });
                          return row;
                        })}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        barCategoryGap={12}
                      >
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
  formatter={(value: any) =>
    typeof value === "number"
      ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value
  }
/>
                        <Legend />
                        {processMonthly.map((proc, idx) => (
                          <Bar
                            key={proc.name}
                            dataKey={proc.name}
                            fill={proc.color}
                            radius={[6, 6, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                    <table className="w-full mt-2 border text-xs">
                      <thead>
                        <tr>
                          <th>공정명</th>
                          {monthLabels.map((m, i) => <th key={i}>{m}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {processMonthly.map(proc => (
                          <tr key={proc.name}>
                            <td>{proc.name}</td>
                            {proc.monthly.map((v, i) => <td>{v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                );
              })}
            </div>
          </div>
        </>
      )}


      {/* 오류 메시지 */}
      {error && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    

        {/* 보고서 관리 탭 */}
        {activeTab === 'report' && (
  <div>
    <div className="mb-2">
      <h2 className="text-xl font-bold">보고서 관리</h2>
      <p className="text-gray-600 text-sm mt-1 mb-4">
        저장 및 출력했던 보고서 목록을 확인할 수 있습니다.
      </p>
    </div>
    <div className="overflow-x-auto rounded border border-gray-300">
      <table className="min-w-full text-center">
        <thead>
          <tr className="bg-[#00235B] text-white text-sm">
            <th className="py-2 px-3 border-r">No</th>
            <th className="py-2 px-3 border-r">보고서 종류</th>
            <th className="py-2 px-3 border-r">파일명</th>
            <th className="py-2 px-3 border-r">저장 일자</th>
            <th className="py-2 px-3 border-r">출력 일자</th>
            <th className="py-2 px-3">재출력하기</th>
          </tr>
        </thead>
        <tbody>
  {visibleReports.map((row, idx) => (
    <tr key={idx} className="bg-gray-100 border-b">
      <td className="py-2 px-3 border-r">{row.no || idx + 1}</td>
      <td className="py-2 px-3 border-r">{row.type}</td>
      <td className="py-2 px-3 border-r">{row.filename}</td>
      <td className="py-2 px-3 border-r">{row.savedDate}</td>
      <td className="py-2 px-3 border-r">{row.printedDate}</td>
      <td className="py-2 px-3">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 text-xs"
          onClick={() => {
            const today = getTodayString();
            setReports(reports =>
              reports.map((r, i) =>
                i === idx ? { ...r, printedDate: today } : r
              )
            );
            if (row.pdfUrl) {
              window.open(row.pdfUrl, "_blank");
            } else {
              alert("PDF 파일이 없습니다.");
            }
          }}
        >
          재출력
        </button>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  </div>
)}


          {/* 수정/저장 버튼 */}
          {(activeTab === 'info' || activeTab === 'company') && (
            <div className="flex justify-end space-x-2 mt-6">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  수정
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    저장
                  </button>
                </>
              )}
      </div>
          )}

{/* 전구물질 모달 */}
{showPrecursorModal && (
  <PrecursorManagementModal
    isOpen={showPrecursorModal}
    onClose={() => setShowPrecursorModal(false)}
    onSave={handleSavePrecursor}
    editingData={editingPrecursor ? {
      name: editingPrecursor.name,
      nameEn: editingPrecursor.nameEn,
      productionRoutes: editingPrecursor.productionRoutes || []
    } : undefined}
  />
)}
  </div> 
  </div>
  )
}
