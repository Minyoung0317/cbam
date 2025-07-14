"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import PrecursorMasterSearchModal from "./PrecursorMasterSearchModal";

interface ProductionRoute {
  order: number;
  country: string;
  countryEn: string;
  countryCode: string;
}

interface PrecursorData {
  name: string;
  nameEn: string; // 영문명
  cnCode?: string;
  cnCode1?: string;
  cnCode2?: string;
  productionRoutes: ProductionRoute[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    nameEn: string;
    cnCode?: string;
    cnCode1?: string;
    cnCode2?: string;
    productionRoutes: ProductionRoute[];
  }) => void;
  editingData?: {
    name: string;
    nameEn?: string;
    cnCode?: string;
    cnCode1?: string;
    cnCode2?: string;
    productionRoutes: ProductionRoute[];
  } | null;
}

export default function PrecursorManagementModal({
  isOpen,
  onClose,
  onSave,
  editingData,
}: Props) {
  const [precursorData, setPrecursorData] = useState<PrecursorData>({
    name: editingData?.name || "",
    nameEn: editingData?.name || "",
    cnCode: editingData?.cnCode || "",
    cnCode1: editingData?.cnCode1 || "",
    cnCode2: editingData?.cnCode2 || "",
    productionRoutes: editingData?.productionRoutes || [
      { order: 1, country: "", countryEn: "", countryCode: "" },
    ],
  });

  // ✅ useEffect로 editingData 변화 감지
  useEffect(() => {
    if (editingData) {
      setPrecursorData({
        name: editingData.name || "",
        nameEn: editingData.nameEn || editingData.name || "",
        cnCode: editingData.cnCode || "",
        cnCode1: editingData.cnCode1 || "",
        cnCode2: editingData.cnCode2 || "",
        productionRoutes: editingData.productionRoutes || [
          { order: 1, country: "", countryEn: "", countryCode: "" },
        ],
      });
    } else {
      setPrecursorData({
        name: "",
        nameEn: "",
        cnCode: "",
        cnCode1: "",
        cnCode2: "",
        productionRoutes: [{ order: 1, country: "", countryEn: "", countryCode: "" }],
      });
    }
  }, [editingData]);

  const [showPrecursorSearch, setShowPrecursorSearch] = useState(false);
  const [countrySearchIdx, setCountrySearchIdx] = useState<number | null>(null);
  const [showCountrySearch, setShowCountrySearch] = useState(false);
  const [countrySearchResults, setCountrySearchResults] = useState<any[]>([]);
  const [countrySearchInput, setCountrySearchInput] = useState("");

  const handleMaterialSelect = (material: {
    품목: string;
    품목영문?: string;
    cn코드?: string;
    cn코드1?: string;
    cn코드2?: string;
  }) => {
    setPrecursorData((prev) => ({
      ...prev,
      name: material.품목,
      nameEn: material.품목영문 || "",
      cnCode: material.cn코드 || "",
      cnCode1: material.cn코드1 || "",
      cnCode2: material.cn코드2 || "",
    }));
    setShowPrecursorSearch(false);
  };

  const handleAddRoute = () => {
    setPrecursorData((prev) => ({
      ...prev,
      productionRoutes: [
        ...prev.productionRoutes,
        { order: prev.productionRoutes.length + 1, country: "", countryEn: "", countryCode: "" },
      ],
    }));
  };

  const handleRemoveRoute = (idx: number) => {
    setPrecursorData((prev) => ({
      ...prev,
      productionRoutes: prev.productionRoutes.filter((_, i) => i !== idx),
    }));
  };

  const handleCountrySearch = async (idx: number) => {
    setCountrySearchIdx(idx);
    setShowCountrySearch(true);
    setCountrySearchInput("");
    setCountrySearchResults([]);
  };

  const handleCountrySearchSubmit = async () => {
    if (!countrySearchInput.trim()) return;
    const res = await fetch("/api/country/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_kr: countrySearchInput }),
    });
    const data = await res.json();
    setCountrySearchResults(data.result || []);
  };

  const handleCountrySelect = (country: any) => {
    if (countrySearchIdx === null) return;
    setPrecursorData((prev) => ({
      ...prev,
      productionRoutes: prev.productionRoutes.map((r, i) =>
        i === countrySearchIdx
          ? {
              ...r,
              country: country.name_kr,
              countryEn: country.name_en,
              countryCode: country.unlocode,
            }
          : r
      ),
    }));
    setShowCountrySearch(false);
    setCountrySearchIdx(null);
  };

  const handleSave = () => {
    if (
      !precursorData.name.trim() ||
      precursorData.productionRoutes.some((r) => !r.country || !r.countryCode)
    ) {
      alert("모든 필드를 입력하세요.");
      return;
    }
    onSave({
      name: precursorData.name,
      nameEn: precursorData.nameEn,
      cnCode: precursorData.cnCode,
      cnCode1: precursorData.cnCode1,
      cnCode2: precursorData.cnCode2,
      productionRoutes: precursorData.productionRoutes,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-lg p-0 rounded-lg overflow-visible shadow-lg border border-[#00235B] bg-white"
        style={{ minWidth: 420 }}
      >
        <div className="bg-[#00235B] flex items-center justify-between px-5 py-3 rounded-t-lg">
          <DialogTitle className="text-white text-lg font-bold p-0 m-0">전구물질 추가</DialogTitle>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={22} />
          </button>
        </div>
        <div className="border-t-4 border-[#00235B]" />
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <label className="w-32 font-semibold">전구 물질명</label>
            <button
              className="flex-1 bg-yellow-200 border px-3 py-2 rounded text-left focus:outline-none"
              onClick={() => setShowPrecursorSearch(true)}
            >
              {precursorData.name || "전구물질명 선택"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1">생산 경로</label>
            {precursorData.productionRoutes.map((route, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 border-b pb-2 mb-2 flex-wrap"
              >
                <span className="w-20">생산 순서</span>
                <input
                  type="number"
                  className="w-16 border px-2 py-1 text-right bg-white"
                  value={route.order}
                  min={1}
                  onChange={(e) =>
                    setPrecursorData((prev) => ({
                      ...prev,
                      productionRoutes: prev.productionRoutes.map((r, i) =>
                        i === idx ? { ...r, order: Number(e.target.value) } : r
                      ),
                    }))
                  }
                />
                <span className="w-20">생산 국가</span>
                <input
                  className="bg-yellow-200 border px-2 py-1 w-32 text-center"
                  value={route.country}
                  readOnly
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded font-bold"
                  onClick={() => handleCountrySearch(idx)}
                  type="button"
                >
                  검색
                </button>
                <span className="w-24">생산 국가 코드</span>
                <input
                  className="border px-2 py-1 w-24 text-center"
                  value={route.countryCode}
                  readOnly
                />
                {precursorData.productionRoutes.length > 1 && (
                  <button
                    className="ml-2 text-red-500 font-bold"
                    onClick={() => handleRemoveRoute(idx)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
            <button
              className="bg-[#00235B] text-white px-4 py-2 rounded mt-2 font-bold w-full"
              onClick={handleAddRoute}
              type="button"
            >
              생산 경로 추가
            </button>
          </div>
          <div className="border-t border-gray-300 my-2" />
          <div className="flex justify-end mt-4">
            <button
              className="bg-black text-white px-6 py-3 rounded font-bold text-lg hover:bg-gray-800"
              onClick={handleSave}
            >
              저장하고 나가기
            </button>
          </div>
        </div>

        {showPrecursorSearch && (
          <PrecursorMasterSearchModal
            isOpen={showPrecursorSearch}
            onOpenChange={setShowPrecursorSearch}
            onSelect={handleMaterialSelect}
          />
        )}

        {showCountrySearch && (
          <Dialog open={showCountrySearch} onOpenChange={setShowCountrySearch}>
            <DialogContent className="max-w-lg  bg-white">
              <DialogTitle>국가 검색</DialogTitle>
              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 border px-2 py-1"
                  value={countrySearchInput}
                  onChange={(e) => setCountrySearchInput(e.target.value)}
                  placeholder="국가명(한글) 입력"
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={handleCountrySearchSubmit}
                >
                  검색
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {countrySearchResults.map((c, i) => (
                  <div
                    key={i}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCountrySelect(c)}
                  >
                    {c.name_kr} ({c.unlocode})
                  </div>
                ))}
                {countrySearchResults.length === 0 && (
                  <div className="text-gray-400 p-2">검색 결과 없음</div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
