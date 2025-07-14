"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Material extends Record<string, any> {
  품목: string;
  직접: number;
  간접: number;
}

interface Precursor {
  cnCode: string;
  cnCode1?: string;
  cnCode2?: string;
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (material: Material) => void;
}

export default function PrecursorIntersectionSearchModal({ isOpen, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // material DB fetch
  const fetchMaterials = async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/precursor-materials${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
      if (!response.ok) throw new Error('material 데이터를 가져오는데 실패했습니다');
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (err) {
      setMaterials([]);
    }
  };

  // material만 fetch
  useEffect(() => {
    if (isOpen) {
      fetchMaterials("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const debounceTimer = setTimeout(() => {
      fetchMaterials(search);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, isOpen]);

  const handleSelect = (material: Material) => {
    onSelect(material);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] p-0 bg-white">
        <DialogTitle className="text-lg font-semibold bg-gradient-to-r from-[#0a357a] to-[#1e4a8f] text-white p-4 m-0">
          전구물질 교집합 검색
        </DialogTitle>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              className="flex-1 p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="전구물질명 또는 CN코드로 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loading}
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
                    <th className="text-left p-3 border-b border-gray-200 font-semibold text-gray-600">품목명</th>
                    <th className="text-right p-3 border-b border-gray-200 font-semibold text-gray-600">직접계수</th>
                    <th className="text-right p-3 border-b border-gray-200 font-semibold text-gray-600">간접계수</th>
                    <th className="w-20 p-3 border-b border-gray-200 text-center">선택</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((mat, idx) => (
                    <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50 transition-all">
                      <td className="p-3">{mat.품목}</td>
                      <td className="p-3 text-right tabular-nums">{mat.직접}</td>
                      <td className="p-3 text-right tabular-nums">{mat.간접}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleSelect(mat)}
                          className="w-full p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          선택
                        </button>
                      </td>
                    </tr>
                  ))}
                  {materials.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        {search ? "검색 결과가 없습니다" : "표시할 전구물질 데이터가 없습니다."}
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