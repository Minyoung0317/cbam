"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Fuel {
  연료명: string;
  연료명En?: string;
  배출계수: number;
  순발열량: number;
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (fuel: Fuel) => void;
}

export default function FuelSearchModal({ isOpen, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 데이터 가져오기
  const fetchFuels = async (searchTerm: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fuels${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
      if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다');
      const data = await response.json();
      setFuels(data.fuels || []);
      setError("");
    } catch (err) {
      setError("데이터를 가져오는데 실패했습니다");
      setFuels([]);
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 전체 데이터 로드
  useEffect(() => {
    if (isOpen) {
      fetchFuels("");
    }
  }, [isOpen]);

  // 검색어 변경 시 데이터 로드
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isOpen) {
        fetchFuels(search);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, isOpen]);

  const handleSelect = (fuel: Fuel) => {
    onSelect(fuel);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 bg-white">
        <DialogTitle className="text-lg font-semibold bg-gradient-to-r from-[#0a357a] to-[#1e4a8f] text-white p-4 m-0">
          연료 검색
        </DialogTitle>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              className="flex-1 p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="연료명을 입력하세요"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 border-b border-gray-200 font-semibold text-gray-600">연료명</th>
                    <th className="text-left p-3 border-b border-gray-200 font-semibold text-gray-600">배출계수(tCO₂/TJ)</th>
                    <th className="text-left p-3 border-b border-gray-200 font-semibold text-gray-600">순발열량(TJ/Gg)</th>
                    <th className="w-20 p-3 border-b border-gray-200"></th>
                  </tr>
                </thead>
                <tbody>
                  {fuels.map((fuel, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50 transition-all">
                      <td className="p-3">{fuel.연료명}</td>
                      <td className="p-3">{typeof fuel.배출계수 === "number" && !isNaN(fuel.배출계수) ? fuel.배출계수.toFixed(2) : "-"}</td>
                      <td className="p-3">{typeof fuel.순발열량 === "number" && !isNaN(fuel.순발열량) ? fuel.순발열량.toFixed(2) : "-"}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleSelect(fuel)}
                          className="w-full p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          선택
                        </button>
                      </td>
                    </tr>
                  ))}
                  {fuels.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">
                        검색 결과가 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 