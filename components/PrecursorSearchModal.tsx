"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// ProcessAddModal로 전달할 데이터 타입 (name, directFactor, indirectFactor만 필요)
interface SelectedPrecursorData {
  name: string;
  directFactor: number;
  indirectFactor: number;
  cnCode: string;
  cnCode1?: string;
  cnCode2?: string;
}

// API 응답의 배열 요소 데이터 타입 (_id, cnCode 포함)
interface ApiPrecursorData {
  _id: string;
  name: string;
  directFactor: number;
  indirectFactor: number;
  cnCode: string;
  cnCode1?: string;
  cnCode2?: string;
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (precursor: SelectedPrecursorData) => void;
}

// 이름 정규화 함수: 공백, 줄바꿈, 특수문자, 대소문자 모두 제거
function normalizeName(str: string) {
  return (str || "")
    .normalize('NFC')
    .replace(/\s+/g, "")
    .replace(/[\,\-\(\)\[\]\/]/g, "")
    .replace(/[^\w가-힣]/g, "")
    .replace(/[\u00A0\u200b\u2028\u2029]/g, "")
    .toLowerCase()
    .trim();
}

export default function PrecursorSearchModal({ isOpen, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [precursors, setPrecursors] = useState<ApiPrecursorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [materialNames, setMaterialNames] = useState<string[]>([]); // material.품목 리스트

  // material DB에서 품목명 리스트 fetch
  const fetchMaterialNames = async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/materials${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
      if (!response.ok) throw new Error('원료 데이터를 가져오는데 실패했습니다');
      const data = await response.json();
      setMaterialNames((data.materials || []).map((m: any) => m.품목));
    } catch (err) {
      setMaterialNames([]);
    }
  };

  // precursor DB에서 precursors fetch
  const fetchPrecursors = async (searchTerm: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/precursors${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`, {
        cache: 'no-cache',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorData.message || `데이터를 가져오는데 실패했습니다 (${response.status})`);
      }
      if (response.status === 204) {
        setPrecursors([]);
      } else {
        const data = await response.json();
        setPrecursors(data.precursors || []); // 필터링 없이 그대로 저장
      }
    } catch (err: any) {
      setError(err.message || "데이터를 가져오는데 실패했습니다");
      setPrecursors([]);
    } finally {
      setLoading(false);
    }
  };

  // material, precursor 동시 fetch
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      fetchMaterialNames("");
    }
  }, [isOpen]);

  // materialNames가 바뀌거나 검색어가 바뀌면 precursors fetch
  useEffect(() => {
    if (!isOpen) return;
    const debounceTimer = setTimeout(() => {
      fetchMaterialNames(search);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, isOpen]);

  // materialNames가 바뀔 때마다 precursors fetch
  useEffect(() => {
    if (!isOpen) return;
    fetchPrecursors(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialNames, isOpen]);

  const handleSelect = (precursor: ApiPrecursorData) => {
    onSelect({
      name: precursor.name,
      directFactor: precursor.directFactor,
      indirectFactor: precursor.indirectFactor,
      cnCode: precursor.cnCode,
      cnCode1: precursor.cnCode1,
      cnCode2: precursor.cnCode2,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] p-0 bg-white"> {/* 너비 조정 가능 */}
        <DialogTitle className="text-lg font-semibold bg-gradient-to-r from-[#0a357a] to-[#1e4a8f] text-white p-4 m-0">
          전구물질 검색
        </DialogTitle>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              className="flex-1 p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="품목명 또는 CN코드로 검색"
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
                  {precursors.map((precursor) => (
                    <tr key={precursor._id} className="border-b last:border-b-0 hover:bg-gray-50 transition-all">
                      <td className="p-3">{precursor.name}</td>
                      <td className="p-3 text-right tabular-nums">{precursor.directFactor}</td>
                      <td className="p-3 text-right tabular-nums">{precursor.indirectFactor}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleSelect(precursor)}
                          className="w-full p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          선택
                        </button>
                      </td>
                    </tr>
                  ))}
                  {precursors.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
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