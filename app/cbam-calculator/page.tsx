"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"


interface CBAMData {
  productName: string;
  productType: string;
  startDate: string;
  endDate: string;
  cnCode: string;
  category: string;
  processData: any[] | null | undefined;
  createdAt: string;
}

export default function CBAMCalculatorPage() {
  const [cbamData, setCbamData] = useState<CBAMData[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingProductIdx, setEditingProductIdx] = useState<number | null>(null);
  //const [showCarbonCostModal, setShowCarbonCostModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('cbamData') || '[]');
    setCbamData(savedData);
  }, []);

  const handleSelect = (createdAt: string, checked: boolean) => {
    setSelected(prev => checked ? [...prev, createdAt] : prev.filter(id => id !== createdAt));
  };

  const handleDelete = () => {
    const newData = cbamData.filter(data => !selected.includes(data.createdAt));
    setCbamData(newData);
    localStorage.setItem('cbamData', JSON.stringify(newData));
    setSelected([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleEdit = (createdAt: string) => {
    router.push(`/cbam-calculator/detail?edit=${createdAt}`);
  };

  const allSimpleProducts = cbamData.every(data => data.productType === "단순제품");
  const hasComplexProduct = cbamData.some(data => data.productType === "복합제품");

  const emissionHeaderColSpan = hasComplexProduct ? 4 : 3;
  const totalTableColSpan = 5 + emissionHeaderColSpan;

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 네비게이션 */}
      <div className="flex justify-between items-center px-8 py-2 border-b border-gray-200">
        <div className="flex gap-2 text-sm">
          <Link href="/cbam" className="hover:underline">CBAM 소개</Link>
          <span>|</span>
          <Link href="/guide" className="hover:underline">이용 안내</Link>
          <span>|</span>
          <span className="font-bold">CBAM 계산기</span>
          <span>|</span>
          <Link href="/mypage" className="hover:underline">My page</Link>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="border px-3 py-1 bg-white">Main</Link>
          <Link href="/logout" className="border px-3 py-1 bg-white">Logout</Link>
        </div>
      </div>

      {/* 타이틀 */}
      <div className="bg-[#00235B] text-white text-3xl font-bold text-center py-8 tracking-wide">CBAM 계산기</div>

      {/* +Add 버튼 */}
      <div className="flex justify-end px-8 mt-4 space-x-2">
        <button 
          onClick={handleDelete} 
          disabled={selected.length === 0}
          className="bg-red-600 text-white px-5 py-2 rounded font-bold disabled:opacity-50"
        >
          삭제
        </button>
        <Link href="/cbam-calculator/detail" className="bg-[#00235B] text-white px-5 py-2 rounded font-bold">
          + Add
        </Link>
      </div>

      {/* 테이블 */}
      <div className="px-8 mt-4">
        <table className="w-full border border-gray-300 text-center">
          <thead>
            <tr className="bg-[#1a2e5c] text-white">
              <th className="border px-2 py-2 w-12" rowSpan={2}></th>
              <th className="border px-2 py-2" rowSpan={2}>No</th>
              <th className="border px-2 py-2" rowSpan={2}>제품명</th>
              <th className="border px-2 py-2" rowSpan={2}>제품구분</th>
              <th className="border px-2 py-2" colSpan={3}>생산기간</th>
              <th className="border px-2 py-2" colSpan={emissionHeaderColSpan}>제품당 배출량</th>
              <th className="border px-2 py-2" rowSpan={2}>작업</th>
            </tr>
            <tr className="bg-[#e6eaf2] text-[#1a2e5c]">
              <th className="border px-2 py-1">시작일</th>
              <th className="border px-2 py-1">종료일</th>
              <th className="border px-2 py-1">기간(일)</th>
              <th className="border px-2 py-1">직접 배출량</th>
              <th className="border px-2 py-1">간접 배출량</th>
              {hasComplexProduct && (
                <th className="border px-2 py-1">전구물질 배출량</th>
              )}
              <th className="border px-2 py-1">총 배출량</th>
            </tr>
          </thead>
          <tbody>
            {cbamData.length === 0 ? (
              <tr>
                <td colSpan={totalTableColSpan} className="p-4 text-center text-gray-500 bg-[#f5f6fa]">-</td>
              </tr>
            ) : (
              cbamData.map((data, index) => {
                const isComplex = data.productType === "복합제품";
                const processData = data.processData ?? [];

                const totalProductDirectEmission = processData.reduce((sum, p) => sum + (p.totalProcessDirectEmission || 0), 0);
                const totalProductIndirectEmission = processData.reduce((sum, p) => sum + (p.totalProcessIndirectEmission || 0), 0);
                const totalProductPrecursorEmission = isComplex ? processData.reduce((sum, p) => sum + (p.totalProcessPrecursorEmission || 0), 0) : 0;
                const overallProductTotalEmission = processData.reduce((sum, p) => sum + (p.totalProcessOverallEmission || 0), 0);

                return (
                  <tr key={data.createdAt} className="bg-white border-b">
                    <td className="border px-2 py-1">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(data.createdAt)}
                        onChange={(e) => handleSelect(data.createdAt, e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                    </td>
                    <td className="border px-2 py-1">{index + 1}</td>
                    <td 
                      className="border px-2 py-1 cursor-pointer text-blue-700 underline"
                      onClick={() => setEditingProductIdx(index)}
                    >
                      {data.productName}
                    </td>
                    <td className="border px-2 py-1">{data.productType}</td>
                    <td className="border px-2 py-1">{data.startDate || '-'}</td>
                    <td className="border px-2 py-1">{data.endDate || '-'}</td>
                    <td className="border px-2 py-1">{(data.startDate && data.endDate) ? Math.max(0, Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000*60*60*24))) : '-'}</td>
                    <td className="border px-2 py-1">{totalProductDirectEmission.toFixed(2)}</td>
                    <td className="border px-2 py-1">{totalProductIndirectEmission.toFixed(2)}</td>
                    {hasComplexProduct && (
                      <td className="border px-2 py-1">
                        {isComplex ? totalProductPrecursorEmission.toFixed(2) : '-'}
                      </td>
                    )}
                    <td className="border px-2 py-1">{overallProductTotalEmission.toFixed(2)}</td>
                    <td className="border px-2 py-1">
                      <div className="flex justify-center space-x-1">
                        <button 
                          onClick={() => handleEdit(data.createdAt)}
                          className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => router.push(`/cbam-calculator/export?createdAt=${data.createdAt}`)}
                          className="bg-[#1a2e5c] text-white px-2 py-1 text-xs rounded hover:bg-[#00235B]"
                        >
                          내보내기
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* 안내문구 */}
        <div className="text-xs text-gray-700 mt-2">
          * 제품당 배출량 산정될 때마다 아래 테이블 추가 생성<br/>
          * [제품구분]이 단순일 경우, 전구물질 배출량에 기본값으로 0 설정
        </div>
      </div>

      {/* 제품명 수정 모달 예시 */}
      {editingProductIdx !== null && cbamData[editingProductIdx] && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg min-w-[400px]">
            <div className="text-lg font-bold mb-4">제품명 수정</div>
            <input
              type="text"
              value={cbamData[editingProductIdx].productName}
              onChange={e => {
                const newData = [...cbamData];
                if (newData[editingProductIdx]) {
                  newData[editingProductIdx].productName = e.target.value;
                  setCbamData(newData);
                }
              }}
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setEditingProductIdx(null)}>취소</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => {
                localStorage.setItem('cbamData', JSON.stringify(cbamData));
                setEditingProductIdx(null);
              }}>저장</button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
}
