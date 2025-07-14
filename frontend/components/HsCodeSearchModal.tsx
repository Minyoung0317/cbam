"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (data: { cnCode: string; category: string; item: string; englishName: string }) => void;
}

export default function HsCodeSearchModal({ isOpen, onOpenChange, onSelect }: Props) {
  const [hsCode, setHsCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // 검색
  const handleSearch = async (p = 1) => {
    if (!hsCode.trim()) {
      setError("HS 코드를 입력해주세요.");
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setResult(null);
    
    try {
      const res = await fetch(`/api/hscode?hs=${encodeURIComponent(hsCode.trim())}&page=${p}`);
      if (!res.ok) {
        throw new Error('서버 오류가 발생했습니다.');
      }
      
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setTotal(data.total);
        setPage(data.page);
        setError("");
      } else {
        setResults([]);
        setTotal(0);
        setError("검색 결과가 없습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색 중 오류가 발생했습니다.");
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (row: any) => {
    const korCategory = row["품목군__(cn기준)"] || "";
      const engCategory = row["품목군_(cn기준)"] || "";
  const engItem = row["품목_(cn기준)"] || ""; 
   const korItem = row["품목_(hs기준)"] || "";
  const englishName = row["품목_(cn기준_영문)"] || "";
 onSelect({
    cnCode: row["cn_코드"]?.toString() || "",
    category: korCategory || engCategory,
    item: engItem || korItem,
    englishName,
  });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] bg-white">
        <DialogTitle className="text-center bg-[#0a357a] text-white py-2 rounded">
          HS코드로 CN코드 검색
        </DialogTitle>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 p-2 border rounded"
              value={hsCode}
              onChange={e => setHsCode(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              placeholder="HS 코드를 입력하세요"
            />
            <button
              className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-[#0a357a]'}`}
              onClick={() => handleSearch()}
              disabled={loading}
            >
              {loading ? '검색중...' : '검색'}
            </button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#0a357a] border-t-transparent"></div>
              <p className="mt-2 text-gray-600">검색중...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-4 bg-red-50 rounded">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                총 {total}개의 결과 중 {(page - 1) * PAGE_SIZE + 1}~{Math.min(page * PAGE_SIZE, total)}번째 결과
              </div>
              <div className="max-h-[400px] overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">HS코드</th>
                      <th className="px-4 py-2 text-left">CN코드</th>
                      <th className="px-4 py-2 text-left">품목군</th>
                      <th className="px-4 py-2 text-left">품목</th>
                      <th className="px-4 py-2 text-center">선택</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, idx) => (
                      <tr 
                        key={idx}
                        className="border-t hover:bg-gray-50"
                      >
                         <td>{row["hs_코드"]}</td>
                        <td>{row["cn_코드"]}</td>
                        <td>{row["품목군_(cn기준)"] || row["품목군__(cn기준)"]}</td>
                        <td className="px-4 py-2">
                          <div>
                          {row["품목_(cn기준)"] && <div>{row["품목_(cn기준)"]}</div>}
                          
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleSelectRow(row)}
                            className="px-3 py-1 bg-[#0a357a] text-white rounded text-sm hover:bg-[#0a357a]/90"
                          >
                            선택
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {total > PAGE_SIZE && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    className={`px-3 py-1 rounded border ${page <= 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'}`}
                    disabled={page <= 1}
                    onClick={() => handleSearch(page - 1)}
                  >
                    이전
                  </button>
                  <span className="text-sm">{page} / {Math.ceil(total / PAGE_SIZE)}</span>
                  <button
                    className={`px-3 py-1 rounded border ${page >= Math.ceil(total / PAGE_SIZE) ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'}`}
                    disabled={page >= Math.ceil(total / PAGE_SIZE)}
                    onClick={() => handleSearch(page + 1)}
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
