"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ProcessAddModal from "@/components/ProcessAddModal"
import HsCodeSearchModal from "@/components/HsCodeSearchModal"
import CarbonCostModal from "@/app/components/CarbonCostModal"
import Link from "next/link"
import { Suspense, useMemo } from "react"
import { useState, useEffect } from "react"
import { ProcessData, Fuel, Material, Electricity, Precursor } from "@/app/types/ProcessTypes";




interface CBAMProductData {
  productName: string;
  productnameEn: string;
  productType: "단순제품" | "복합제품" | null;
  startDate: string;
  endDate: string;
  cnCode: string;
  category: string;
  item: string;
  processData: ProcessData[];
  createdAt: string;
  productionAmount?: number | '';
}

const getCurrentWeekNumber = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
};


export default function CBAMCalculatorDetailPage( ) {
  const router = useRouter();
  
  // 상태 관리
  const [productType, setProductType] = useState<"단순제품" | "복합제품" | null>("단순제품");
  const [showHSModal, setShowHSModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [productNameEn, setProductNameEn] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [processData, setProcessData] = useState<ProcessData[]>([]);
  const [cnCode, setCnCode] = useState("");
  const [category, setCategory] = useState("");
  const [item, setItem] = useState("");
  const [error, setError] = useState("");
  const [selectedProcesses, setSelectedProcesses] = useState<number[]>([]);
  const [editingProcessIdx, setEditingProcessIdx] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCreatedAt, setEditingCreatedAt] = useState<string | null>(null);
  const [productionAmount, setProductionAmount] = useState<number | ''>('');
  const [showPrepaidCarbonModal, setShowPrepaidCarbonModal] = useState(false);
  const materialOptions = ["철광석", "알루미늄", "구리", "아연", "니켈", "기타"];
  const fuelOptions = ["석탄", "천연가스", "경유", "휘발유", "기타"];
  const [exportAmount, setExportAmount] = useState<number | ''>('');
  const [finalPrepaidCarbonPrice, setFinalPrepaidCarbonPrice] = useState<number>(0);
  const [cbamCertificatePrice, setCbamCertificatePrice] = useState<number>(0)
 
  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (editId) {
      const existingData = JSON.parse(localStorage.getItem('cbamData') || '[]') as CBAMProductData[];
      const dataToEdit = existingData.find(data => data.createdAt === editId);
      if (dataToEdit) {
        setProductName(dataToEdit.productName || '');
        setProductType(dataToEdit.productType || '단순제품');
        setStartDate(dataToEdit.startDate || '');
        setEndDate(dataToEdit.endDate || '');
        setCnCode(dataToEdit.cnCode || '');
        setCategory(dataToEdit.category || '');
        setItem(dataToEdit.item || '');
        setProcessData(dataToEdit.processData || []);
        setIsEditMode(true);
        setEditingCreatedAt(editId ?? '');
        setProductionAmount((dataToEdit as any).productionAmount ?? '');
      } else {
        router.push('/cbam-calculator/detail');
      }
    }
  }, [router]);

  useEffect(() => {
  async function fetchCbamPrice() {
    try {
      const res = await fetch('/api/settings/ETS');
      const data = await res.json();
      if (res.ok && data.price) {
        setCbamCertificatePrice(Number(data.price)* 1561.72);
      } else {
        console.warn("CBAM 인증서 가격 불러오기 실패:", data.error);
      }
    } catch (err) {
      console.error("CBAM 인증서 가격 요청 오류:", err);
    }
  }

  fetchCbamPrice();
}, []);

  // CBAM price fetching removed as it's handled in CarbonCostModal

  // HS 코드 검색 결과 처리
  const handleHSCodeSelect = (data: { cnCode: string; category: string; item: string; englishName: string }) => {
    setCnCode(data.cnCode);
    setCategory(data.category);
    setItem(data.item);
    setProductNameEn(data.englishName); // HS 모달에서 받아온 영문명
     setShowHSModal(false);
   };

  // 공정 추가 처리
  const handleProcessAdd = (newProcess: ProcessData) => {
    if (editingProcessIdx !== null) {
      setProcessData(prev => prev.map((p, idx) => idx === editingProcessIdx ? newProcess : p));
      setEditingProcessIdx(null);
    } else {
      setProcessData(prev => [...prev, { ...newProcess, order: prev.length + 1 }]);
    }
    setShowProcessModal(false);
  };

  // 제품 유형 선택 처리
  const handleProductTypeSelect = (type: "단순제품" | "복합제품") => {
    setProductType(type);
  };

  // 제품명 변경 처리
  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
    setError("");
  };

  // 공정 체크박스 핸들러
  const handleProcessCheck = (idx: number, checked: boolean) => {
    setSelectedProcesses(prev => checked ? [...prev, idx] : prev.filter(i => i !== idx));
  };
  // 전체 선택
  const handleAllProcessCheck = (checked: boolean) => {
    setSelectedProcesses(checked ? processData.map((_, idx) => idx) : []);
  };
  // 선택 삭제
  const handleDeleteProcesses = () => {
    setProcessData(prev => prev.filter((_, idx) => !selectedProcesses.includes(idx)));
    setSelectedProcesses([]);
  };

  // 공정 수정 핸들러
  const openEditModal = (idx: number) => {
    setEditingProcessIdx(idx);
    setShowProcessModal(true);
  }

  // 저장 처리
  const handleSave = () => {
    if (!productName.trim()) {
      setError("제품명을 입력해주세요.");
      return;
    }

    if (!productType) {
      setError("제품 유형을 선택해주세요.");
      return;
    }

    const processedProcessData = processData.map(process => {
      let directEmission = 0;
      process.materials.forEach(m => directEmission += m.emission);
      process.fuels.forEach(f => {
        directEmission += f.emission;
      });
      
      const elecIndirectEmission = (process.electricity.amount || 0) * (process.electricity.factor || 0);
      let precursorTotalDirectEmission = 0;
      if (productType === "복합제품") {
        process.precursors.forEach(p => precursorTotalDirectEmission += p.directEmission);
      }

      const overallProcEmission = directEmission + elecIndirectEmission + precursorTotalDirectEmission;

      return {
        ...process,
        electricity: {
          ...process.electricity,
          indirectEmission: elecIndirectEmission
        },
        totalProcessDirectEmission: directEmission,
        totalProcessIndirectEmission: elecIndirectEmission,
        totalProcessPrecursorEmission: precursorTotalDirectEmission,
        totalProcessOverallEmission: overallProcEmission,
      };
    });

    // 데이터 저장
    try {
      let existingData = JSON.parse(localStorage.getItem('cbamData') || '[]') as CBAMProductData[];
      const currentProductData: CBAMProductData & { productionAmount?: number | '' } = {
        productName: productName.trim(),
        productnameEn: productNameEn.trim(), // 추가된 영문명
        productType,
        startDate: minStartDate,
        endDate: maxEndDate,
        cnCode,
        category,
        item,
        processData: processedProcessData,
        createdAt: isEditMode && editingCreatedAt ? editingCreatedAt : new Date().toISOString(),
        productionAmount: productionAmount === '' ? undefined : productionAmount,
      };
      
      if (isEditMode && editingCreatedAt) {
        existingData = existingData.map(data => data.createdAt === editingCreatedAt ? currentProductData : data);
      } else {
        existingData.push(currentProductData);
      }
      
      localStorage.setItem('cbamData', JSON.stringify(existingData));
      router.push('/cbam-calculator');
    } catch (e) {
      setError("저장 중 오류가 발생했습니다.");
      console.error(e);
    }
  };

  // 통합된 groupedRows 로직
  const allGroupedRows: Array<any> = [];
  processData.forEach((process, pIdx) => {
    const itemsInProcess: Array<any> = [];
    process.materials.forEach((material, mIdx) => {
      itemsInProcess.push({
        type: 'material',
        pIdx,
        itemIdx: mIdx,
        originalProcess: process, // 공정 수정 버튼용
        data: material,
        order: process.order,
        name: process.name,
      });
    });
    process.fuels.forEach((fuel, fIdx) => {
      itemsInProcess.push({
        type: 'fuel',
        pIdx,
        itemIdx: fIdx,
        originalProcess: process, // 공정 수정 버튼용
        data: fuel,
        order: process.order,
        name: process.name,
        indirectEmission: fuel.indirectEmission || 0
      });
    });

    if (itemsInProcess.length === 0) { // 원료나 연료가 없는 공정도 표시 (공정명만)
      allGroupedRows.push({
        type: 'empty_process',
        pIdx,
        originalProcess: process,
        order: process.order,
        name: process.name,
        rowSpan: 1,
        isFirstInProcess: true,
      });
    } else {
      itemsInProcess.forEach((item, idxInProcess) => {
        allGroupedRows.push({
          ...item,
          rowSpan: itemsInProcess.length,
          isFirstInProcess: idxInProcess === 0,
        });
      });
    }
  });

  // 1. 총배출량 계산
  const totalOverallEmission = allGroupedRows
    .filter(row => row.isFirstInProcess)
    .reduce((sum, row) => {
      const process = processData[row.pIdx];
      let totalDirectEmissionForProcess = 0;
      process.materials.forEach(m => totalDirectEmissionForProcess += m.emission);
      process.fuels.forEach(f => totalDirectEmissionForProcess += f.emission);
      const electricityIndirectEmission = (process.electricity.amount || 0) * (process.electricity.factor || 0);
      let precursorEmissionForProcess = 0;
      if (productType === "복합제품" && process.precursors && Array.isArray(process.precursors)) {
        process.precursors.forEach(p => precursorEmissionForProcess += (typeof p.directEmission === 'number' ? p.directEmission : 0) + (typeof p.indirectEmission === 'number' ? p.indirectEmission : 0));
      }
      const overallEmissionForProcess = totalDirectEmissionForProcess + electricityIndirectEmission + precursorEmissionForProcess;
      return sum + overallEmissionForProcess;
    }, 0);

  // 1. processData의 모든 공정의 startDate, endDate 중 가장 빠른/늦은 날짜 계산
  const minStartDate = processData.length > 0 ? processData.filter(p => p.startDate).map(p => p.startDate).sort()[0] || '' : '';
  const maxEndDate = processData.length > 0 ? processData.filter(p => p.endDate).map(p => p.endDate).sort().reverse()[0] || '' : '';
   const payableCost = useMemo(() => {
  if (!productionAmount || !exportAmount || !cbamCertificatePrice) return null;
  const emissionPerTon = totalOverallEmission / Number(productionAmount);
  const totalCost = emissionPerTon * Number(exportAmount) * cbamCertificatePrice;
  return {
    emissionPerTon,
    totalCost,
  };
}, [productionAmount, exportAmount, cbamCertificatePrice, totalOverallEmission]);

const finalCBAMCharge = payableCost?.totalCost ? payableCost.totalCost - finalPrepaidCarbonPrice : null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-[#f5f6fa]">
        <div className="container mx-auto px-4 py-6 max-w-[1800px]"> {/* 최대 너비 더욱 확장 */}
          {/* 헤더 */}
          <div className="bg-[#00235B] text-white text-xl font-bold py-4 px-6 mb-6 text-center">
            CBAM 계산기 {isEditMode ? "(수정 모드)" : ""}
          </div>

          {/* 메인 폼 */}
          <div className="space-y-4">
            {/* 제품명 & 제품 유형 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-24 font-medium">제품명</div>
                <input
                  type="text"
                  value={productName}
                  onChange={handleProductNameChange}
                  className="flex-1 border p-2 bg-yellow-100"
                />
              </div>
              <div className="col-span-2 flex items-center gap-4">
                <div className="w-24 font-medium">제품구분</div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      checked={productType === "단순제품"}
                      onChange={() => handleProductTypeSelect("단순제품")}
                      className="form-radio text-blue-600"
                    />
                    <span>단순제품</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      checked={productType === "복합제품"}
                      onChange={() => handleProductTypeSelect("복합제품")}
                      className="form-radio text-blue-600"
                    />
                    <span>복합제품</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 기간 & HS 코드 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-24 font-medium">시작일</div>
                <input
                  type="date"
                  value={minStartDate}
                  readOnly
                  className="flex-1 border p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center">
                <div className="w-24 font-medium">종료일</div>
                <input
                  type="date"
                  value={maxEndDate}
                  readOnly
                  className="flex-1 border p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center">
                <Button onClick={() => setShowHSModal(true)} className="bg-gray-200 text-black hover:bg-gray-300">
                  HS CODE 검색
                </Button>
              </div>
            </div>
            {showHSModal && <HsCodeSearchModal isOpen={showHSModal} onOpenChange={setShowHSModal} onSelect={handleHSCodeSelect} />}

            {/* HS 코드 정보 표시 */}
            <div className="grid grid-cols-3 gap-4">
              <div>CN CODE: {cnCode}</div>
              <div>품목: {item}</div>
              <div>카테고리: {category}</div>
            </div>

            {/* 공정 관리 헤더 */}
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-xl font-semibold">공정 관리</h2>
              <div className="space-x-2">
                <Button onClick={() => setShowProcessModal(true)} className="bg-blue-500 hover:bg-blue-600">공정 추가</Button>
                {selectedProcesses.length > 0 && (
                  <Button onClick={handleDeleteProcesses} className="bg-red-500 hover:bg-red-600">선택 삭제</Button>
                )}
              </div>
            </div>

            {/* 공정 추가 모달 */}
           <ProcessAddModal
              isOpen={showProcessModal}
              onOpenChange={(open) => {
                if (!open) setEditingProcessIdx(null);
                setShowProcessModal(open);
              }}
              onAdd={handleProcessAdd}
              productType={productType || "단순제품"}
              defaultData={editingProcessIdx !== null ? processData[editingProcessIdx] : undefined}
            />


            {/* 공정 테이블 */}
            {processData.length > 0 && (
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 w-12">
                        <input type="checkbox" onChange={(e) => handleAllProcessCheck(e.target.checked)} />
                      </th>
                      <th className="border p-2">공정순서</th>
                      <th className="border p-2">공정명</th>
                      <th className="border p-2">구분</th>
                      <th className="border p-2">항목명</th>
                      <th className="border p-2">증빙자료</th>
                      <th className="border p-2">투입량</th>
                      <th className="border p-2">배출계수</th>
                      <th className="border p-2">산화계수</th>
                      <th className="border p-2">직접배출량</th>
                      <th className="border p-2">총 직접배출량</th>
                      <th className="border p-2">전력사용량</th>
                      <th className="border p-2">배출계수(전력)</th>
                      <th className="border p-2">간접배출량</th>
                      <th className="border p-2">총 공정 배출량</th>
                      <th className="border p-2">총배출량</th>
                      <th className="border p-2">시작일</th>
                      <th className="border p-2">종료일</th>
                      <th className="border p-2">수정</th>
                    </tr>
                  </thead>
                 

<tbody>
  {allGroupedRows.map((row, index) => {
    const process = processData[row.pIdx];
    const materialOrFuel = row.data;
    const isMaterial = row.type === 'material';
    const isFuel = row.type === 'fuel';
    const isEmptyProcess = row.type === 'empty_process';

    let totalDirectEmissionForProcess = 0;
    process.materials.forEach(m => totalDirectEmissionForProcess += m.emission);
    process.fuels.forEach(f => totalDirectEmissionForProcess += f.emission);
    const electricityIndirectEmission = (process.electricity.amount || 0) * (process.electricity.factor || 0);

    let precursorEmissionForProcess = 0;
    if (productType === "복합제품" && process.precursors && Array.isArray(process.precursors)) {
      process.precursors.forEach(p => {
        precursorEmissionForProcess += (p.directEmission || 0) + (p.indirectEmission || 0);
      });
    }

    const overallEmissionForProcess = totalDirectEmissionForProcess + electricityIndirectEmission + precursorEmissionForProcess;

    return (
      <tr key={index}>
        {row.isFirstInProcess && (
          <>
            <td className="border p-2" rowSpan={row.rowSpan}>
              <input
                type="checkbox"
                checked={selectedProcesses.includes(row.pIdx)}
                onChange={(e) => handleProcessCheck(row.pIdx, e.target.checked)}
              />
            </td>
            <td className="border p-2" rowSpan={row.rowSpan}>{row.order}</td>
            <td className="border p-2" rowSpan={row.rowSpan}>{row.name}</td>
          </>
        )}

        {/* ✅ if not empty process */}
        {!isEmptyProcess && (
          <>
            <td className="border p-2">{isMaterial ? '원료' : '연료'}</td>
            <td className="border p-2">{materialOrFuel?.name || '-'}</td>
            <td className="border p-2">{materialOrFuel?.evidence?.name || '-'}</td>
            <td className="border p-2 text-right">{materialOrFuel?.amount?.toFixed(2) || '-'}</td>
            <td className="border p-2 text-right">{materialOrFuel?.factor?.toFixed(2) || '-'}</td>
            <td className="border p-2 text-right">{materialOrFuel?.oxidation?.toFixed(2) || '-'}</td>
            <td className="border p-2 text-right">{materialOrFuel?.emission?.toFixed(2) || '-'}</td>

            {row.isFirstInProcess && (
              <>
                <td className="border p-2 text-right" rowSpan={row.rowSpan}>{totalDirectEmissionForProcess.toFixed(2)}</td>
                <td className="border p-2 text-right" rowSpan={row.rowSpan}>{process.electricity.amount.toFixed(2)}</td>
                <td className="border p-2 text-right" rowSpan={row.rowSpan}>{process.electricity.factor.toFixed(2)}</td>
                <td className="border p-2 text-right" rowSpan={row.rowSpan}>{electricityIndirectEmission.toFixed(2)}</td>
                <td className="border p-2 text-right" rowSpan={row.rowSpan}>{overallEmissionForProcess.toFixed(2)}</td>
              </>
            )}

            {index === 0 && (
              <td
                className="border p-2 align-middle text-center font-bold"
                rowSpan={allGroupedRows.length}
              >
                {totalOverallEmission.toFixed(2)}
              </td>
            )}

            {row.isFirstInProcess && (
              <>
                <td className="border p-2 text-center" rowSpan={row.rowSpan}>{process.startDate || '-'}</td>
                <td className="border p-2 text-center" rowSpan={row.rowSpan}>{process.endDate || '-'}</td>
                <td className="border p-2 text-center" rowSpan={row.rowSpan}>
                  <Button onClick={() => openEditModal(row.pIdx)} className="bg-green-500 hover:bg-green-600 text-white">수정</Button>
                </td>
              </>
            )}
          </>
        )}

        {/* ✅ empty process → 강제 colSpan 13으로 고정, 나머지 셀도 채워줌 */}
        {isEmptyProcess && (
          <>
            <td className="border p-2 text-center" colSpan={13}>-</td>

            {index === 0 && (
              <td
                className="border p-2 align-middle text-center font-bold"
                rowSpan={allGroupedRows.length}
              >
                {totalOverallEmission.toFixed(2)}
              </td>
            )}

            <td className="border p-2 text-center">{process.startDate || '-'}</td>
            <td className="border p-2 text-center">{process.endDate || '-'}</td>
            <td className="border p-2 text-center">
              <Button onClick={() => openEditModal(row.pIdx)} className="bg-green-500 hover:bg-green-600 text-white">수정</Button>
            </td>
          </>
        )}
      </tr>
    );
  })}
</tbody>
                </table>
              </div>
            )}

            {/* 전구물질 테이블 (복합제품인 경우) */}
            {productType === "복합제품" && processData.some(p => p.precursors && p.precursors.length > 0) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">전구물질 정보</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">공정순서</th>
                        <th className="border p-2">공정명</th>
                        <th className="border p-2">전구물질명</th>
                        <th className="border p-2">투입량</th>
                        <th className="border p-2">직접배출계수</th>
                        <th className="border p-2">직접배출량</th>
                        <th className="border p-2">간접배출계수</th>
                        <th className="border p-2">간접배출량</th>
                        <th className="border p-2">전구물질 고려 직접배출량</th>
                        <th className="border p-2">전구물질 고려 간접배출량</th>
                        <th className="border p-2">전구물질 고려 총배출량</th>
                      </tr>
                    </thead>
                    <tbody>
              {processData.map((process, pIndex) => {
                // precursors가 없거나 비어있으면 빈 행을 출력
                if (!process.precursors || process.precursors.length === 0) {
                  return (
                    <tr key={`${pIndex}-empty`}>
                      <td className="border p-2">{process.order}</td>
                      <td className="border p-2">{process.name}</td>
                      <td className="border p-2 text-center" colSpan={8}>-</td>
                    </tr>
                  );
                }

                // precursors가 하나 이상 있을 때 기존 방식대로 출력
                const processDirect = (process.materials?.reduce((s, m) => s + (m.emission || 0), 0) || 0) + (process.fuels?.reduce((s, f) => s + (f.emission || 0), 0) || 0);
                const processIndirect = (process.electricity?.amount || 0) * (process.electricity?.factor || 0);
                let prevConsideredDirect = 0;
                let prevConsideredIndirect = 0;
                return process.precursors.map((precursor, prIndex) => {
                  let consideredDirect = 0;
                  let consideredIndirect = 0;
                  if (prIndex === 0) {
                    consideredDirect = (precursor.directEmission || 0) + processDirect;
                    consideredIndirect = (precursor.indirectEmission || 0) + processIndirect;
                  } else {
                    consideredDirect = prevConsideredDirect + (precursor.directEmission || 0);
                    consideredIndirect = prevConsideredIndirect + (precursor.indirectEmission || 0);
                  }
                  prevConsideredDirect = consideredDirect;
                  prevConsideredIndirect = consideredIndirect;
                  const consideredTotal = consideredDirect + consideredIndirect;
                  return (
                    <tr key={`${pIndex}-${prIndex}`}>
                      {prIndex === 0 && (
                        <>
                          <td className="border p-2" rowSpan={process.precursors.length}>{process.order}</td>
                          <td className="border p-2" rowSpan={process.precursors.length}>{process.name}</td>
                        </>
                      )}
                      <td className="border p-2">{precursor.name}</td>
                      <td className="border p-2">{precursor.amount.toFixed(2)}</td>
                      <td className="border p-2">{precursor.directFactor.toFixed(2)}</td>
                      <td className="border p-2">{precursor.directEmission.toFixed(2)}</td>
                      <td className="border p-2">{precursor.indirectFactor.toFixed(2)}</td>
                      <td className="border p-2">{precursor.indirectEmission.toFixed(2)}</td>
                      <td className="border p-2">{consideredDirect.toFixed(2)}</td>
                      <td className="border p-2">{consideredIndirect.toFixed(2)}</td>
                      <td className="border p-2">{consideredTotal.toFixed(2)}</td>
                    </tr>
                  );
                });
              })}
          </tbody>

                  </table>
                </div>
              </div>
            )}

            {/* 생산량 입력창 */}
            {(productType === "단순제품" || (productType === "복합제품" && processData.some(p => p.precursors && p.precursors.length > 0))) && (
              <>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">생산량(ton)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded p-2"
                    placeholder="생산량을 입력하세요"
                    value={productionAmount}
                    onChange={e => setProductionAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <div className="text-xs text-red-500 mt-1">양품수량을 입력하시오</div>
                </div>
                <div className="mb-4 text-right font-semibold">
                  제품별 내제 배출량: {productionAmount && Number(productionAmount) > 0 ? (totalOverallEmission / Number(productionAmount)).toFixed(2) : '-'} tCO₂/ton
                </div>
                <div className="border rounded-md p-4 bg-white shadow-sm mt-4">
  <h3 className="font-semibold text-lg mb-4">CBAM 인증서 가격 예측</h3>
  <div className="grid grid-cols-5 gap-2 text-center items-center text-sm">
    <div className="font-semibold">제품별 내제배출량 (tCO₂/ton)</div>
    <div className="font-semibold">총제품 수출량 (ton)</div>
    <div className="font-semibold">CBAM 인증서 가격 (원 / tCO₂)</div>
    <div className="font-semibold">지불 필요 비용 (원)</div>
    <div className="grid grid-cols-5 gap-2 ...">
  <Button
  onClick={() => setShowPrepaidCarbonModal(true)}
  className="col-span-5 justify-self-center bg-[#00235B] text-white hover:bg-blue-800"
  >
  최종 기지불 탄소 비용
</Button>
</div>


    <div className="border py-1">{payableCost?.emissionPerTon?.toFixed(2) || '-'}</div>
    <input
      type="number"
      min="0"
      className="border py-1 px-2"
      value={exportAmount}
      onChange={(e) => setExportAmount(e.target.value === '' ? '' : Number(e.target.value))}
    />
    <div className="border py-1">
  {cbamCertificatePrice?cbamCertificatePrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) : '-'}
</div>
   <div className="border py-1 font-semibold text-blue-700">{payableCost?.totalCost ? Number(payableCost.totalCost.toFixed(0)).toLocaleString() : '-'}</div>
    <div className="border py-1 font-semibold text-blue-700">
    {finalPrepaidCarbonPrice ? Number(finalPrepaidCarbonPrice.toFixed(0)).toLocaleString() : '-'}
    </div>
  </div>
  <div className="text-right mt-2 font-semibold">
    CBAM 최종부과금액: {finalCBAMCharge !== null ? `${Number(finalCBAMCharge.toFixed(0)).toLocaleString()} 원` : '-'}
  </div>
</div>
<div className="text-xs text-gray-500 mt-1">
  ※ 2025-05-22 기준 환율 적용(1,561.72원/€)
</div>
              </>
            )}

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* 버튼 그룹 */}
            <div className="flex justify-end space-x-2 mt-6 mb-4">
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">저장</Button> 
              
              <Link href="/cbam-calculator">
                <Button variant="outline">목록</Button>
              </Link>
            </div>
          </div>
          <CarbonCostModal 
  isOpen={showPrepaidCarbonModal} 
  onClose={() => setShowPrepaidCarbonModal(false)}
  productEmission={productionAmount && Number(productionAmount) > 0 ? (totalOverallEmission / Number(productionAmount)) : 0}
  totalEmission={totalOverallEmission}
  electricityUsage={processData.reduce((sum, process) => sum + (process.electricity?.amount || 0), 0)}
  fuelsData={processData.reduce((acc: Array<{name: string; amount: number}>, process) => [
    ...acc,
    ...process.fuels.map(fuel => ({
      name: fuel.name,
      amount: fuel.amount
    }))
  ], [])}
  totalExportAmount={Number(exportAmount) || 0}
  onFinalPrepaidCarbonChange={setFinalPrepaidCarbonPrice}  // ✅ 새 props 추가
/>
        </div>
      </div>
    </Suspense>
  );
}