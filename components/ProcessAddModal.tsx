"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import MaterialSearchModal from "./MaterialSearchModal"
import FuelSearchModal from "./FuelSearchModal"
import EvidenceUploadModal from "./EvidenceUploadModal"
import { Button } from "./ui/button"
import PrecursorIntersectionSearchModal from "./PrecursorIntersectionSearchModal"
import { ProcessData } from "../app/types/ProcessTypes";

// Field 컴포넌트 - 파일 상단 import 밑에 선언
function Field({
  label,
  value,
  unit,
  infoTitle,
  infoContent
}: {
  label: string;
  value: string | number;
  unit?: string;
  infoTitle?: string;
  infoContent?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 relative">
      <span className="font-semibold">{label}</span>
      <span className="text-blue-900 font-bold">{value}</span>
      {unit && <span className="text-gray-500 ml-1">{unit}</span>}
      {infoTitle && (
        <button
          type="button"
          className="ml-1 flex items-center justify-center w-6 h-6 rounded-full border border-gray-400 bg-white text-gray-700 hover:bg-gray-100"
          onClick={() => setOpen(!open)}
          aria-label="도움말"
        >
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>?</span>
        </button>
      )}
      {open && (
        <div className="absolute z-50 top-8 left-0 bg-white border border-gray-300 rounded shadow-lg p-4 w-72">
          <div className="font-bold mb-2">{infoTitle}</div>
          <div className="text-sm whitespace-pre-line">{infoContent}</div>
          <button
            className="mt-2 text-blue-700 underline text-xs"
            type="button"
            onClick={() => setOpen(false)}
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}

interface Material {
  name: string;
  nameEn: string;
  amount: number;
  factor: number; // 배출계수
  oxidation: number; // 산화계수
  emission: number; // 직접 배출량
  isPrevious: boolean;
  evidence?: { name: string; path: string }; // 증빙자료 정보
}

interface Fuel {
  name: string;
  nameEn: string;
  amount: number;
  factor: number; // 배출계수
  netCalorific: number; // 순발열량
  oxidation: number; // 산화계수
  emission: number; // 직접 배출량
  evidence?: { name: string; path: string }; // 증빙자료 정보
}

interface Electricity {
  amount: number;
  factor: number; // 간접 배출 계수
  indirectEmission?: number; // 간접 배출량 (amount * factor)
}

interface Precursor {
  name: string;        // PrecursorSearchModal에서 선택 (품목명)
  amount: number;       // 사용자 입력 (투입량)
  directFactor: number; // PrecursorSearchModal에서 선택 (직접 배출계수)
  indirectFactor: number; // PrecursorSearchModal에서 선택 (간접 배출계수)
  directEmission: number;  // 자동 계산 (amount * directFactor)
  indirectEmission: number; // 자동 계산 (amount * indirectFactor)
  isIndirectEmissionManual?: boolean;
}


interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (process: ProcessData) => void;
  order?: number;
  name?: string;
  materials?: Material[];
  fuels?: Fuel[];
  electricity?: Electricity;
  precursors?: Precursor[]; // Props에도 추가 (초기 데이터 전달용)
  productType: string;
  defaultData?: ProcessData;
}


export default function ProcessAddModal({
  isOpen,
  onOpenChange,
  onAdd,
  order,
  name,
  materials,
  fuels,
  electricity,
  precursors,
  productType,
  defaultData
}: Props) {
  const [formData, setFormData] = useState<ProcessData>(() => ({
    order: 1,
    name: "",
    startDate: "",
    endDate: "",
    materials: [],
    fuels: [],
    electricity: {
      amount: 0,
      factor: 0.4567,
      indirectEmission: 0
    },
    precursors: []
  }));

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [currentEvidenceTarget, setCurrentEvidenceTarget] = useState<{ itemType: 'material' | 'fuel', index: number } | null>(null);
  const [showPrecursorSearchModal, setShowPrecursorSearchModal] = useState(false); // 전구물질 모달 상태 추가
  const [tempElectricityAmount, setTempElectricityAmount] = useState(0);
  const [tempElectricityEmission, setTempElectricityEmission] = useState(0);
  const [editingPrecursorIndex, setEditingPrecursorIndex] = useState<number | null>(null); // 전구물질 수정 인덱스 상태 추가
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [materialModalIndex, setMaterialModalIndex] = useState<number | null>(null);
  const [fuelModalIndex, setFuelModalIndex] = useState<number | null>(null);
  const [showPrecursorHelp, setShowPrecursorHelp] = useState(false);
  const [showPrecursorHelpIndex, setShowPrecursorHelpIndex] = useState<number | null>(null);
  useEffect(() => {
  if (isOpen) {
    if (defaultData) {
      setFormData(defaultData); // ✅ 수정 모드: 기존 데이터 사용
    } else {
      setFormData({
        order: typeof order === 'number' ? order : 1,
        name: typeof name === 'string' ? name : "",
        startDate: (typeof (name as any)?.startDate === 'string') ? (name as any).startDate : '',
        endDate: (typeof (name as any)?.endDate === 'string') ? (name as any).endDate : '',
        materials: materials || [],
        fuels: fuels || [],
        electricity: electricity || { amount: 0, factor: 0.4567, indirectEmission: 0 },
        precursors: precursors || []
      });
    }
  }
}, [isOpen, defaultData, order, name, materials, fuels, electricity, precursors]);


  useEffect(() => {
    setTotalSteps(productType === '복합제품' ? 4 : 3);
    setStep(0);
  }, [productType, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onOpenChange(false); // 모달 닫기
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateEmission = (amount: number, factor: number, oxidation: number = 1) => {
    return amount * factor * oxidation;
  };

  const handleMaterialSelect = (material: { 품목: string; 직접: number; 품목En: string }) => {
    if (materialModalIndex === null) return;
    setFormData(prev => {
      const newMaterials = [...prev.materials];
      newMaterials[materialModalIndex] = {
        ...newMaterials[materialModalIndex],
        name: material.품목,
        nameEn: material.품목En || '',
        factor: material.직접,
      };
      return { ...prev, materials: newMaterials };
    });
    setMaterialModalIndex(null);
  };

  const handleFuelSelect = (fuel: { 연료명: string; 배출계수: number; 순발열량: number; 연료명En: string }) => {
    if (fuelModalIndex === null) return;
    setFormData(prev => {
      const newFuels = [...prev.fuels];
      newFuels[fuelModalIndex] = {
        ...newFuels[fuelModalIndex],
        name: fuel.연료명,
        nameEn: fuel.연료명En || '',
        factor: fuel.배출계수,
        netCalorific: fuel.순발열량
      };
      return { ...prev, fuels: newFuels };
    });
    setFuelModalIndex(null);
  };

  const calculateFuelEmission = (amount: number, factor: number, netCalorific: number, oxidation: number = 1) => {
    return amount * 1e-3 * factor * oxidation * netCalorific;
  };

  const handleMaterialAmountChange = (index: number, amount: number) => {
    const safeAmount = amount < 0 ? 0 : amount;
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((mat, idx) => 
        idx === index ? {
          ...mat,
          amount: safeAmount,
          emission: calculateEmission(safeAmount, mat.factor, mat.oxidation)
        } : mat
      )
    }));
  };

  const handleFuelAmountChange = (index: number, amount: number) => {
    const safeAmount = amount < 0 ? 0 : amount;
    setFormData(prev => ({
      ...prev,
      fuels: prev.fuels.map((fuel, idx) => 
        idx === index ? {
          ...fuel,
          amount: safeAmount,
          emission: calculateFuelEmission(safeAmount, fuel.factor, fuel.netCalorific, fuel.oxidation)
        } : fuel
      )
    }));
  };

  const handleElectricityChange = (amount: number, factor?: number) => {
    const currentFactor = factor !== undefined ? factor : formData.electricity.factor;
    const newAmount = amount < 0 ? 0 : amount;
    const indirectEmission = newAmount * currentFactor;
    setFormData(prev => ({
      ...prev,
      electricity: {
        ...prev.electricity,
        amount: newAmount,
        factor: currentFactor,
        indirectEmission: indirectEmission
      }
    }));
    setTempElectricityAmount(newAmount); 
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, idx) => idx !== index)
    }));
  };

  const removeFuel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fuels: prev.fuels.filter((_, idx) => idx !== index)
    }));
  };

  const handleOpenEvidenceModal = (itemType: 'material' | 'fuel', index: number) => {
    setCurrentEvidenceTarget({ itemType, index });
    setShowEvidenceModal(true);
  };

  const handleEvidenceUpload = (file: File, target: { itemType: 'material' | 'fuel', index: number } | null) => {
    if (!target) return;

    const { itemType, index } = target;
    const evidenceData = { name: file.name, path: `temp/uploads/${file.name}` };

    setFormData(prev => {
      if (itemType === 'material') {
        const newMaterials = [...prev.materials];
        if (newMaterials[index]) {
          newMaterials[index] = { ...newMaterials[index], evidence: evidenceData };
        }
        return { ...prev, materials: newMaterials };
      } else if (itemType === 'fuel') {
        const newFuels = [...prev.fuels];
        if (newFuels[index]) {
          newFuels[index] = { ...newFuels[index], evidence: evidenceData };
        }
        return { ...prev, fuels: newFuels };
      }
      return prev;
    });
  };

  const handlePrecursorSelect = (selectedPrecursor: { name: string; directFactor: number; indirectFactor: number }) => {
    if (editingPrecursorIndex === null) return;
    setFormData(prev => {
      const newPrecursors = [...prev.precursors];
      if (newPrecursors[editingPrecursorIndex]) {
        newPrecursors[editingPrecursorIndex] = {
          ...newPrecursors[editingPrecursorIndex],
          name: selectedPrecursor.name,
          directFactor: selectedPrecursor.directFactor,
          indirectFactor: selectedPrecursor.indirectFactor,
          directEmission: newPrecursors[editingPrecursorIndex].amount * selectedPrecursor.directFactor,
          indirectEmission: newPrecursors[editingPrecursorIndex].isIndirectEmissionManual
            ? newPrecursors[editingPrecursorIndex].indirectEmission
            : newPrecursors[editingPrecursorIndex].amount * selectedPrecursor.indirectFactor,
        };
      }
      return { ...prev, precursors: newPrecursors };
    });
    setShowPrecursorSearchModal(false);
    setEditingPrecursorIndex(null);
  };

  const handlePrecursorAmountChange = (index: number, amount: number) => {
    const safeAmount = amount < 0 ? 0 : amount;
    setFormData(prev => ({
      ...prev,
      precursors: prev.precursors.map((pre, idx) =>
        idx === index
          ? {
              ...pre,
              amount: safeAmount,
              directEmission: safeAmount * pre.directFactor,
              indirectEmission: pre.isIndirectEmissionManual ? pre.indirectEmission : safeAmount * pre.indirectFactor
            }
          : pre
      )
    }));
  };

  const removePrecursor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      precursors: prev.precursors.filter((_, idx) => idx !== index)
    }));
  };

  const addNewPrecursorLine = () => {
    setFormData(prev => ({
      ...prev,
      precursors: [
        ...prev.precursors,
        { name: "", amount: 0, directFactor: 0, indirectFactor: 0, directEmission: 0, indirectEmission: 0 }
      ]
    }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const stepLabels = [
    '공정 기본 정보',
    '직접 귀속 배출량',
    '간접 귀속 배출량',
    ...(productType === '복합제품' ? ['전구물질'] : [])
  ];

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col gap-4 bg-white">
            <div className="flex items-center gap-4 ">
              <label className="w-32 text-right font-bold">공정 순서</label>
              <input type="number" min={1} value={formData.order} onChange={handleChange} name="order" className="bg-yellow-200 border px-4 py-2 w-40 font-bold text-lg" />
            </div>
            <div className="flex items-center gap-4  ">
              <label className="w-32 text-right font-bold">공정명</label>
              <input type="text" value={formData.name} onChange={handleChange} name="name" className="bg-yellow-200 border px-4 py-2 w-80 font-bold text-lg" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-right font-bold">시작일</label>
              <input type="date" className="border px-4 py-2 w-48" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} />
              <label className="w-20 text-right font-bold">종료일</label>
              <input type="date" className="border px-4 py-2 w-48" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col gap-4 bg-white">
            {/* 원료 입력 테이블 */}
            <div className="rounded-lg border border-gray-200 shadow-lg overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-[#0a357a] to-[#1e4a8f] text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">원료 | 공정 배출 활동량</h3>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, materials: [...prev.materials, { name: '', amount: 0, factor: 0, oxidation: 1, emission: 0, isPrevious: false }] }))} className="px-4 py-2 bg-white text-[#0a357a] rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-md">원료 추가 +</button>
              </div>
              <div className="p-4 ">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">원료명</th>
                      <th className="text-center p-2">투입량(ton)</th>
                      <th className="text-center p-2">배출계수</th>
                      <th className="text-center p-2">산화계수</th>
                      <th className="text-center p-2">배출량</th>
                      <th className="text-center p-2">EU 수입</th>
                      <th className="text-center p-2">삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.materials.map((material, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <button
                            type="button"
                            className="w-full bg-yellow-100 border rounded px-2 py-1 text-left"
                            onClick={() => setMaterialModalIndex(index)}
                          >
                            {material.name || "원료명 선택"}
                          </button>
                          {materialModalIndex === index && (
                            <MaterialSearchModal
                              isOpen={materialModalIndex === index}
                              onOpenChange={() => setMaterialModalIndex(null)}
                              onSelect={handleMaterialSelect}
                            />
                          )}
                        </td>
                        <td className="p-2">
                          <input type="number" min="0" value={material.amount} onChange={(e) => handleMaterialAmountChange(index, parseFloat(e.target.value))} className="w-full p-1 border rounded text-center" />
                        </td>
                        <td className="p-2 text-center">{material.factor}</td>
                        <td className="p-2">
                          <div className="flex items-center justify-center">
                            <input type="number" min="0" max="1" value={material.oxidation} onChange={(e) => { const newOxidation = parseFloat(e.target.value); let finalOxidation = newOxidation; if (isNaN(finalOxidation)) finalOxidation = 0; if (finalOxidation < 0) finalOxidation = 0; if (finalOxidation > 1) finalOxidation = 1; setFormData(prev => ({ ...prev, materials: prev.materials.map((mat, idx) => idx === index ? { ...mat, oxidation: finalOxidation, emission: calculateEmission(mat.amount, mat.factor, finalOxidation) } : mat ) })); }} className="w-16 p-1 border rounded text-center" step="0.01" />
                            <Button type="button" onClick={() => handleOpenEvidenceModal('material', index)} className="ml-1 px-2 py-1 text-xs">수정</Button>
                          </div>
                        </td>
                        <td className="p-2 text-center">{material.emission.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <input type="checkbox" checked={material.isPrevious} onChange={(e) => { setFormData(prev => ({ ...prev, materials: prev.materials.map((m, i) => i === index ? { ...m, isPrevious: e.target.checked } : m ) })); }} />
                        </td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => removeMaterial(index)} className="text-red-500 hover:text-red-700">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* 연료 입력 테이블 */}
            <div className="rounded-lg border border-gray-200 shadow-lg overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-[#0a357a] to-[#1e4a8f] text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">연료 사용량</h3>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, fuels: [...prev.fuels, { name: '', amount: 0, factor: 0, netCalorific: 0, oxidation: 1, emission: 0 }] }))} className="px-4 py-2 bg-white text-[#0a357a] rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-md">연료 추가 +</button>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">연료명</th>
                      <th className="text-center p-2">사용량(ton)</th>
                      <th className="text-center p-2">배출계수</th>
                      <th className="text-center p-2">순발열량</th>
                      <th className="text-center p-2">산화계수</th>
                      <th className="text-center p-2">배출량</th>
                      <th className="text-center p-2">삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.fuels.map((fuel, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <button
                            type="button"
                            className="w-full bg-yellow-100 border rounded px-2 py-1 text-left"
                            onClick={() => setFuelModalIndex(index)}
                          >
                            {fuel.name || "연료명 선택"}
                          </button>
                          {fuelModalIndex === index && (
                            <FuelSearchModal
                              isOpen={fuelModalIndex === index}
                              onOpenChange={() => setFuelModalIndex(null)}
                              onSelect={handleFuelSelect}
                            />
                          )}
                        </td>
                        <td className="p-2">
                          <input type="number" value={fuel.amount} min="0" onChange={(e) => handleFuelAmountChange(index, parseFloat(e.target.value))} className="w-full p-1 border rounded text-center" />
                        </td>
                        <td className="p-2 text-center">{fuel.factor}</td>
                        <td className="p-2 text-center">{fuel.netCalorific}</td>
                        <td className="p-2">
                          <div className="flex items-center justify-center">
                            <input type="number" min="0" max="1" value={fuel.oxidation} onChange={(e) => { const newOxidation = parseFloat(e.target.value); let finalOxidation = newOxidation; if (isNaN(finalOxidation)) finalOxidation = 0; if (finalOxidation < 0) finalOxidation = 0; if (finalOxidation > 1) finalOxidation = 1; setFormData(prev => ({ ...prev, fuels: prev.fuels.map((f, idx) => idx === index ? { ...f, oxidation: finalOxidation, emission: calculateFuelEmission(f.amount, f.factor, f.netCalorific, finalOxidation) } : f ) })); }} className="w-16 p-1 border rounded text-center" step="0.01" />
                            <Button type="button" onClick={() => handleOpenEvidenceModal('fuel', index)} className="ml-1 px-2 py-1 text-xs">수정</Button>
                          </div>
                        </td>
                        <td className="p-2 text-center">{fuel.emission.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => removeFuel(index)} className="text-red-500 hover:text-red-700">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-xl bg-[#00235B] text-white text-lg font-bold text-center py-2 mb-4 rounded-t">전기 | 전력 사용에 따른 배출량</div>
            <div className="w-full max-w-xl border-2 border-[#00235B] rounded-b p-6 bg-white flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <label className="w-32 text-right font-bold">전력 사용량(MWh)</label>
                <input type="number" min="0" value={tempElectricityAmount} onChange={e => { const val = parseFloat(e.target.value); setTempElectricityAmount(isNaN(val) || val < 0 ? 0 : val); }} className="bg-yellow-200 border px-4 py-2 w-40 font-bold text-lg text-right" />
                <button type="button" className="ml-2 px-4 py-2 bg-[#8fd16a] text-[#00235B] font-bold rounded hover:bg-[#7bc05b]" onClick={() => setTempElectricityEmission(tempElectricityAmount * formData.electricity.factor)}>확인</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-right font-bold">전력 배출계수</label>
                <input type="text" readOnly value={formData.electricity.factor} className="bg-gray-100 border px-4 py-2 w-40 font-bold text-lg text-right" />
              </div>
              <hr className="border-t border-[#00235B] my-2" />
              <div className="flex items-center gap-2">
                <label className="w-32 text-right font-bold">간접 귀속 배출량</label>
                <input type="text" readOnly value={tempElectricityEmission.toFixed(2)} className="bg-gray-100 border px-4 py-2 w-40 font-bold text-lg text-right" />
                <button type="button" className="ml-2 px-4 py-2 bg-[#8fd16a] text-[#00235B] font-bold rounded hover:bg-[#7bc05b]" onClick={() => setFormData(prev => ({ ...prev, electricity: { ...prev.electricity, amount: tempElectricityAmount, indirectEmission: tempElectricityEmission } }))}>저장</button>
              </div>
              <div className="text-xs text-gray-600 mt-2">* 전력 배출계수는 2014~2016 연평균 기준값 사용 (0.4567 tCO₂/MWh)</div>
            </div>
          </div>
        );
      case 3:
        if (productType === '복합제품') {
          return (
            <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto max-h-[400px]">
             
              <div className="bg-[#00235B] text-white text-lg font-bold px-4 py-2 rounded-t mb-3 flex justify-between items-center">
                <span>전구물질 관리</span>
                <Button type="button" onClick={addNewPrecursorLine} variant="outline" className="w-full bg-white text-[#0a357a] font-bold py-2.5">+ 전구물질 추가</Button>
              </div>
               {showPrecursorHelpIndex !== null && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-2 flex justify-between items-center">
                      <div>
                        <div className="font-bold mb-1">전구물질 안내</div>
                        <div className="text-sm whitespace-pre-line">
                          {formData.precursors[showPrecursorHelpIndex]?.name
                            ? `${formData.precursors[showPrecursorHelpIndex].name}에 대한 상세 설명을 여기에 입력하세요.`
                            : "전구물질은 기등록된 물질만 등록해야 합니다.\n [MyPage] – [전구물질관리] 페이지에서 기업에서 사용하고 있는 전구물질에 대한 정보를 추가한 후 입력을 진행하세요."
                          }
                        </div>
                      </div>
                      <button
                        className="ml-4 text-blue-700 underline text-xs"
                        type="button"
                        onClick={() => setShowPrecursorHelpIndex(null)}
                      >
                        닫기
                      </button>
                    </div>
                  )}
              <div className="bg-white border rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">전구물질명</th>
                      <th className="p-2">투입량</th>
                      <th className="p-2">직접 배출계수</th>
                      <th className="p-2">직접 배출량</th>
                      <th className="p-2">간접 배출계수</th>
                      <th className="p-2">간접 배출량</th>
                      <th className="p-2">삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.precursors.map((precursor, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="w-full bg-yellow-100 border rounded px-2 py-1 text-left"
                            onClick={() => { setEditingPrecursorIndex(index); setShowPrecursorSearchModal(true); }}
                          >
                            {precursor.name || "전구물질명 선택"}
                          </button>
                           <button
                            type="button"
                            className="ml-1 flex items-center justify-center w-6 h-6 rounded-full border border-gray-400 bg-white text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowPrecursorHelpIndex(index)}
                            aria-label="도움말"
                          >
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>?</span>
                          </button>
                                                
                      
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={precursor.amount}
                            onChange={e => handlePrecursorAmountChange(index, parseFloat(e.target.value))}
                            className="w-full p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-2 text-center">{precursor.directFactor}</td>
                        <td className="p-2 text-center">{precursor.directEmission.toFixed(2)}</td>
                        <td className="p-2 text-center">{precursor.indirectFactor}</td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            value={precursor.indirectEmission}
                            onChange={e => handlePrecursorIndirectEmissionChange(index, parseFloat(e.target.value))}
                            className="w-full p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => removePrecursor(index)} className="text-red-500 hover:text-red-700">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {showPrecursorSearchModal && (
                <PrecursorIntersectionSearchModal
                  isOpen={showPrecursorSearchModal}
                  onOpenChange={setShowPrecursorSearchModal}
                  onSelect={(mat) => {
                    if (editingPrecursorIndex === null) return;
                    setFormData(prev => {
                      const newPrecursors = [...prev.precursors];
                      if (newPrecursors[editingPrecursorIndex]) {
                        newPrecursors[editingPrecursorIndex] = {
                          ...newPrecursors[editingPrecursorIndex],
                          name: mat.품목,
                          directFactor: mat.직접,
                          indirectFactor: mat.간접,
                          directEmission: newPrecursors[editingPrecursorIndex].amount * mat.직접,
                          indirectEmission: newPrecursors[editingPrecursorIndex].isIndirectEmissionManual
                            ? newPrecursors[editingPrecursorIndex].indirectEmission
                            : newPrecursors[editingPrecursorIndex].amount * mat.간접,
                        };
                      }
                      return { ...prev, precursors: newPrecursors };
                    });
                    setShowPrecursorSearchModal(false);
                    setEditingPrecursorIndex(null);
                  }}
                />
              )}
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  // 전구물질 간접 배출량 직접 입력 핸들러
  const handlePrecursorIndirectEmissionChange = (index: number, value: number) => {
    setFormData(prev => ({
      ...prev,
      precursors: prev.precursors.map((pre, idx) =>
        idx === index ? { ...pre, indirectEmission: isNaN(value) ? 0 : value, isIndirectEmissionManual: true } : pre
      )
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] p-0 gap-0 overflow-y-auto max-h-[80vh] bg-white ">
        <DialogTitle className="text-lg font-semibold bg-gradient-to-r from-[#0a357a] to-[#1e4a8f] text-white p-4 m-0 rounded-t">
          생산 공정 추가
        </DialogTitle>
        <div className="p-6">
          <div className="flex bg-[#00235B] text-white mb-8">
            {stepLabels.map((label, idx) => (
              <div
                key={label}
                className={`flex-1 py-2 text-center ${step === idx ? 'bg-[#00235B] font-bold' : 'bg-[#1a2e5c]'}`}
              >
                {label}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {renderStepContent()}
            <div className="flex justify-end gap-3 mt-8">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={handlePrev}>
                  이전
                </Button>
              )}
              {step < totalSteps - 1 && (
                <Button type="button" onClick={handleNext}>
                  다음
                </Button>
              )}
              {step === totalSteps - 1 && (
                <Button type="submit" className="bg-[#00235B] text-white hover:bg-[#001a4d]">
                  저장
                </Button>
              )}
            </div>
          </form>
          {showEvidenceModal && currentEvidenceTarget && (
            <EvidenceUploadModal
              isOpen={showEvidenceModal}
              onOpenChange={setShowEvidenceModal}
              onUpload={handleEvidenceUpload}
              target={currentEvidenceTarget}
            />
          )}
        
        </div>
      </DialogContent>
    </Dialog>
  );
} 