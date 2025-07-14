"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import PostcodeSearchModal from "@/components/PostcodeSearchModal"
import Link from "next/link"

// 업종 목록 추가
const industries = [
  { code: 'manufacturing', name: '제조업' },
  { code: 'service', name: '서비스업' },
  { code: 'finance', name: '금융업' },
  { code: 'it', name: 'IT' },
  { code: 'energy', name: '에너지' },
  { code: 'construction', name: '건설업' },
  { code: 'retail', name: '유통/물류업' },
  { code: 'medical', name: '의료/제약업' },
  { code: 'education', name: '교육업' },
  { code: 'others', name: '기타' }
] as const;

// 유효성 검사 함수들
const validators = {
  id: (value: string) => {
    if (!value) return '아이디를 입력해주세요.';
    if (!/^[a-zA-Z0-9]{4,20}$/.test(value)) return '아이디는 4-20자의 영문자와 숫자만 사용 가능합니다.';
    return '';
  },
  password: (value: string) => {
    if (!value) return '비밀번호를 입력해주세요.';
    if (!/^[A-Za-z\d]{8,20}$/.test(value)) {
      return '비밀번호는 8-20자의 영문자 또는 숫자로 입력해주세요.';
    }
    return '';
  },
  businessNumber: (value: string) => {
    if (!value) return '사업자번호를 입력해주세요.';
    if (!/^\d{10}$/.test(value)) return '사업자번호는 10자리 숫자여야 합니다.';
    return '';
  },
  email: (value: string) => {
    if (!value) return '이메일을 입력해주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '유효한 이메일 주소를 입력해주세요.';
    return '';
  },
  phoneNumber: (value: string) => {
    if (!value) return '전화번호를 입력해주세요.';
    if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(value)) return '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)';
    return '';
  }
};

// 에러 메시지 유틸 함수 추가
function getErrorMessage(error: any): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    // 여러 필드 에러일 경우 value만 추출
    return Object.values(error).join('\n');
  }
  return String(error);
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    id: '', password: '',
    facilityNameKor: '', facilityNameEng: '', businessNumber: '', ceoName: '', ceoNameEn: '', ceoContact: '',
    country: '', countryAddress: '',
    managerName: '', managerContact: '', managerEmail: '',
    unlocode: '', cityEng: '', street: '', postalCode: '', postBox: '',
    industry: '',
    latitude: '',
    longitude: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showIdCheck, setShowIdCheck] = useState(false)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [idCheckInput, setIdCheckInput] = useState("")
  const [idCheckResult, setIdCheckResult] = useState<string|null>(null)
  const [idCheckLoading, setIdCheckLoading] = useState(false)
  const [countryInput, setCountryInput] = useState("");
  const [countryResult, setCountryResult] = useState<any>(null);
  const [countryLoading, setCountryLoading] = useState(false);
  const [showCountryConfirm, setShowCountryConfirm] = useState(false);
  const [countryResults, setCountryResults] = useState<any[]>([]);
  const [selectedCountryIdx, setSelectedCountryIdx] = useState<number|null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value);
  }

  const validateField = (name: string, value: string) => {
    // 값이 비어있고 필수 필드가 아닌 경우 에러 없음
    const requiredFields = [
      'id', 'password', 'facilityNameKor', 'facilityNameEng',
      'businessNumber', 'ceoName', 'ceoContact', 'country',
      'countryAddress', 'managerName', 'managerContact', 'managerEmail',
      'industry'
    ];
    
    if (!value.trim()) {
      if (requiredFields.includes(name)) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: '이 필드는 필수입니다.'
        }));
        return '이 필드는 필수입니다.';
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return '';
      }
    }

    if (validators[name as keyof typeof validators]) {
      const error = validators[name as keyof typeof validators](value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return error;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const userData: any = {
      id: formData.id,
      password: formData.password,
      name: formData.facilityNameKor,
      email: formData.managerEmail,
      managerEmail: formData.managerEmail,
      businessName: formData.facilityNameKor,
      businessNameEng: formData.facilityNameEng,
      address: formData.countryAddress,
      industry: formData.industry,
      postalCode: formData.postalCode,
      postBox: formData.postBox || '',
      city: formData.cityEng,
      country: formData.country,
      countryEng: formData.countryEng, // 국가 영문명
      unlocode: formData.unlocode,
      latitude: parseFloat(formData.latitude) || 37.5665,
      longitude: parseFloat(formData.longitude) || 126.9780,
      representativeName: formData.ceoName,
      representativeNameEn: formData.ceoNameEn,
      phoneNumber: formData.ceoContact,
      businessNumber: formData.businessNumber,
      managerName: formData.managerName,
      managerContact: formData.managerContact,
      street: formData.street
    };
    const requiredFields = [
      'id', 'password', 'name', 'email', 'businessName', 'businessNameEng',
      'address', 'industry', 'postalCode', 'city', 'street', 'country', 'unlocode',
      'latitude', 'longitude', 'representativeName', 'phoneNumber', 'businessNumber'
    ];
    const emptyFields = requiredFields.filter(field => !userData[field]);
    if (emptyFields.length > 0) {
      setError(`다음 필드가 비어 있습니다: ${emptyFields.join(', ')}`);
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(getErrorMessage(data.error || '회원가입 중 오류가 발생했습니다.'));
        return;
      }
      router.push('/login');
    } catch (err: any) {
      setError(getErrorMessage(err.message || '회원가입 중 오류가 발생했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdCheck = async () => {
    setIdCheckLoading(true)
    setIdCheckResult(null)
    try {
      const response = await fetch("/api/auth/check-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idCheckInput })
      })
      const data = await response.json()
      if (response.ok && data.available) {
        setIdCheckResult("사용 가능한 ID입니다.")
      } else {
        setIdCheckResult(data.message || data.error || "이미 사용 중인 ID입니다.")
      }
    } catch (e) {
      setIdCheckResult("오류가 발생했습니다.")
    } finally {
      setIdCheckLoading(false)
    }
  }

  const handleIdCheckConfirm = () => {
    if (idCheckResult === "사용 가능한 ID입니다.") {
      setFormData(prev => ({ ...prev, id: idCheckInput }))
      setShowIdCheck(false)
    }
  }

  const handleCountrySearch = async () => {
    if (!countryInput.trim()) {
      setCountryResults([]);
      setCountryResult({ error: "국가명을 입력하세요." });
      return;
    }
    setCountryLoading(true);
    setCountryResult(null);
    setCountryResults([]);
    setSelectedCountryIdx(null);
    try {
      const response = await fetch("/api/country/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_kr: countryInput })
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.result)) {
        setCountryResults(data.result);
        if (data.result.length === 0) {
          setCountryResult({ error: "검색 결과가 없습니다." });
        }
      } else {
        setCountryResult({ error: data.error || "검색 결과가 없습니다." });
      }
    } catch (e) {
      setCountryResult({ error: "오류가 발생했습니다." });
    } finally {
      setCountryLoading(false);
    }
  };

  const handleCountrySave = () => {
    if (selectedCountryIdx !== null && countryResults[selectedCountryIdx]) {
      const selectedCountry = countryResults[selectedCountryIdx];
      setFormData(prev => ({
        ...prev,
        country: selectedCountry.name_kr,
        countryEng: selectedCountry.name_en || '',
        unlocode: selectedCountry.unlocode || ''
      }));
      setShowCountryModal(false);
    }
  };

  const handleAddressComplete = (data: {
    address: string; 
    zonecode: string; 
    latitude: number;
    longitude: number;
    unlocode?: string; 
    cityEng?: string; 
    street?: string;  
  }) => {
    setFormData(prev => ({
      ...prev,
      countryAddress: data.address,
      postalCode: data.zonecode,
      cityEng: data.cityEng || '',
      street: data.street || '',
      // unlocode: data.unlocode || '', // 주소 검색 시 UNLOCODE 업데이트 않도록 주석 처리
      latitude: String(data.latitude || prev.latitude || '37.5665'),
      longitude: String(data.longitude || prev.longitude || '126.9780')
    }));
  };

  const isFormValid = () => {
    // 필수 필드 목록
    const requiredFields = [
      'id', 'password', 'facilityNameKor', 'facilityNameEng',
      'businessNumber', 'ceoName', 'ceoContact', 'country',
      'countryAddress', 'managerName', 'managerContact', 'managerEmail',
      'industry'
    ];

    // 필수 필드가 모두 채워져 있는지 확인
    const allFieldsFilled = requiredFields.every(field => 
      formData[field as keyof typeof formData]?.trim() !== ''
    );

    // 현재 에러가 있는지 확인
    const hasErrors = Object.values(fieldErrors).some(error => error !== '');

    return allFieldsFilled && !hasErrors;
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {/* 헤더 */}
      <header className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-2">
        <nav className="flex space-x-2 text-sm">
          <Link href="/cbam" className="hover:text-blue-600">CBAM 소개</Link>
          <span>|</span>
          <Link href="/guide" className="hover:text-blue-600">이용 안내</Link>
          <span>|</span>
          <Link href="/cbam-calculator" className="hover:text-blue-600">CBAM 계산기</Link>
          <span>|</span>
          <Link href="/mypage" className="hover:text-blue-600">My page</Link>
        </nav>
        <div className="space-x-2">
          <Link href="/" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Main</Link>
          <Link href="/login" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Login</Link>
        </div>
      </header>

      {/* 회원가입 폼 */}
      <div className="flex justify-center items-center py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm w-[800px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
                {getErrorMessage(error)}
              </div>
            )}
            <div className="border-b border-blue-900 pb-2">
              <h2 className="text-lg font-bold text-blue-900">기본 정보</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-sm mb-1">ID *</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      onBlur={(e) => validateField('id', e.target.value)}
                      className={`w-full p-2 border rounded bg-[#ffffd4] ${fieldErrors.id ? 'border-red-500' : ''}`}
                      placeholder="영문, 숫자 조합 4-20자"
                    />
                    {fieldErrors.id && (
                      <div className="absolute left-0 -bottom-5 text-red-500 text-xs">
                        {fieldErrors.id}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowIdCheck(true)}
                    className="px-4 py-2 bg-blue-900 text-white rounded text-sm"
                  >
                    중복확인
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">영문자와 숫자 조합으로 4-20자 입력</p>
              </div>
              <div>
                <label className="block text-sm mb-1">PW *</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={(e) => validateField('password', e.target.value)}
                    className={`w-full p-2 border rounded bg-[#ffffd4] ${fieldErrors.password ? 'border-red-500' : ''}`}
                    placeholder="영문, 숫자 조합 8-20자"
                  />
                  {fieldErrors.password && (
                    <div className="absolute left-0 -bottom-5 text-red-500 text-xs">
                      {fieldErrors.password}
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1">영문자와 숫자 조합으로 8-20자 입력</p>
              </div>
            </div>

            <div className="border-b border-blue-900 pb-2">
              <h2 className="text-lg font-bold text-blue-900">일반 정보</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-sm mb-1 text-red-500">사업자(사업장) 국문 이름 *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="facilityNameKor"
                    value={formData.facilityNameKor}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded bg-[#ffffd4] ${!formData.facilityNameKor ? 'border-red-500' : ''}`}
                    placeholder="예: 스마트이에스지"
                  />
                  {!formData.facilityNameKor && (
                    <div className="absolute left-0 -bottom-5 text-red-500 text-xs">
                      사업자(사업장) 국문 이름을 입력해주세요.
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-red-500">사업자(사업장) 영문 이름 *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="facilityNameEng"
                    value={formData.facilityNameEng}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded bg-[#ffffd4] ${!formData.facilityNameEng ? 'border-red-500' : ''}`}
                    placeholder="예: Smart ESG"
                  />
                  {!formData.facilityNameEng && (
                    <div className="absolute left-0 -bottom-5 text-red-500 text-xs">
                      사업자(사업장) 영문 이름을 입력해주세요.
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">사업자번호 *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleChange}
                    onBlur={(e) => validateField('businessNumber', e.target.value)}
                    className={`w-full p-2 border rounded bg-[#ffffd4] ${fieldErrors.businessNumber ? 'border-red-500' : ''}`}
                    placeholder="예: 1234567890"
                  />
                  {fieldErrors.businessNumber && (
                    <div className="absolute left-0 -bottom-5 text-red-500 text-xs">
                      {fieldErrors.businessNumber}
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1">10자리 숫자로 입력 (-제외)</p>
              </div>
              <div>
                <label className="block text-sm mb-1">대표자명</label>
                <input
                  type="text"
                  name="ceoName"
                  value={formData.ceoName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-[#ffffd4]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">대표자영문명</label>
                <input
                  type="text"
                  name="ceoNameEn"
                  value={formData.ceoNameEn}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-[#ffffd4]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">대표자 연락처 *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="ceoContact"
                    value={formData.ceoContact}
                    onChange={handleChange}
                    onBlur={(e) => validateField('phoneNumber', e.target.value)}
                    className={`w-full p-2 border rounded bg-[#ffffd4] ${fieldErrors.phoneNumber ? 'border-red-500' : ''}`}
                    placeholder="예: 010-1234-5678"
                  />
                  {fieldErrors.phoneNumber && (
                    <div className="absolute left-0 -bottom-5 text-red-500 text-xs">
                      {fieldErrors.phoneNumber}
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1">하이픈(-) 포함하여 입력</p>
              </div>
              <div>
                <label className="block text-sm mb-1">국가</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    className="flex-1 p-2 border rounded bg-gray-100"
                    readOnly
                  />
                  <button
                    onClick={() => setShowCountryModal(true)}
                    className="px-4 py-2 bg-blue-900 text-white rounded text-sm"
                  >
                    검색
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="unlocode">UNLOCODE</label>
                <input
                  type="text"
                  id="unlocode"
                  name="unlocode"
                  value={formData.unlocode}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="countryAddress">국문 주소 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="countryAddress"
                      name="countryAddress"
                      value={formData.countryAddress}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100"
                      placeholder="주소 검색 버튼을 이용하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="postalCode">우편번호</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <PostcodeSearchModal onSelect={handleAddressComplete} />
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="cityEng">영문 도시명</label>
                    <input
                      type="text"
                      id="cityEng"
                      name="cityEng"
                      value={formData.cityEng}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="street">영문 상세주소</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="postBox">사서함</label>
                <input
                  type="text"
                  id="postBox"
                  name="postBox"
                  value={formData.postBox}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="(선택) 사서함 주소를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">경제 활동 (업종) *</label>
                <div className="relative">
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-[#ffffd4] appearance-none"
                    required
                  >
                    <option value="">선택하세요</option>
                    {industries.map(industry => (
                      <option key={industry.code} value={industry.code}>
                        {industry.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">담당자명 *</label>
                <input
                  type="text"
                  name="managerName"
                  value={formData.managerName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded bg-[#ffffd4] ${!formData.managerName ? 'border-red-500' : ''}`}
                  placeholder="예: 홍길동"
                  required
                />
                {!formData.managerName && (
                  <div className="text-red-500 text-xs mt-1">담당자명을 입력해주세요.</div>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">담당자 연락처 *</label>
                <input
                  type="text"
                  name="managerContact"
                  value={formData.managerContact}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded bg-[#ffffd4] ${!formData.managerContact ? 'border-red-500' : ''}`}
                  placeholder="예: 010-1234-5678"
                  required
                />
                {!formData.managerContact && (
                  <div className="text-red-500 text-xs mt-1">담당자 연락처를 입력해주세요.</div>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">담당자 이메일 *</label>
                <input
                  type="email"
                  name="managerEmail"
                  value={formData.managerEmail}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded bg-[#ffffd4] ${!formData.managerEmail ? 'border-red-500' : ''}`}
                  placeholder="예: manager@smartesg.com"
                  required
                />
                {!formData.managerEmail && (
                  <div className="text-red-500 text-xs mt-1">담당자 이메일을 입력해주세요.</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0b4a1c] text-white py-3 rounded text-lg"
            >
              {isLoading ? '처리 중...' : '등록하기'}
            </button>
          </form>
        </div>
      </div>

      {/* ID 중복확인 모달 */}
      <Dialog open={showIdCheck} onOpenChange={setShowIdCheck}>
        <DialogContent>
          <DialogTitle>ID 중복확인</DialogTitle>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={idCheckInput}
                onChange={(e) => setIdCheckInput(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="사용할 ID를 입력하세요"
              />
              <button
                onClick={handleIdCheck}
                disabled={idCheckLoading}
                className="px-4 py-2 bg-blue-900 text-white rounded"
              >
                확인
              </button>
            </div>
            {idCheckResult && (
              <div className={`text-sm ${idCheckResult.includes("사용 가능") ? "text-green-600" : "text-red-600"}`}>
                {idCheckResult}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleIdCheckConfirm}
                disabled={idCheckResult !== "사용 가능한 ID입니다."}
                className="px-4 py-2 bg-blue-900 text-white rounded"
              >
                사용하기
              </button>
              <button
                onClick={() => setShowIdCheck(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                취소
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 국가 검색 모달 */}
      <Dialog open={showCountryModal} onOpenChange={setShowCountryModal}>
        <DialogContent className="max-w-[600px]">
          <DialogTitle>국가 검색</DialogTitle>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="국가명을 입력하세요"
              />
              <button
                onClick={handleCountrySearch}
                disabled={countryLoading}
                className="px-4 py-2 bg-blue-900 text-white rounded"
              >
                검색
              </button>
            </div>
            {countryResults.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">국가명(한글)</th>
                      <th className="px-4 py-2 text-left">국가명(영문)</th>
                      <th className="px-4 py-2 text-left">UNLOCODE</th>
                      <th className="px-4 py-2 text-center">선택</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countryResults.map((country, idx) => (
                      <tr 
                        key={idx}
                        className={`border-t hover:bg-gray-50 cursor-pointer ${
                          selectedCountryIdx === idx ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedCountryIdx(idx)}
                      >
                        <td className="px-4 py-2">{country.name_kr}</td>
                        <td className="px-4 py-2">{country.name_en}</td>
                        <td className="px-4 py-2">{country.unlocode}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCountryIdx(idx);
                              handleCountrySave();
                            }}
                            className="px-3 py-1 bg-blue-900 text-white rounded text-sm hover:bg-blue-800"
                          >
                            선택
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {countryLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-900 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">검색중...</p>
              </div>
            )}
            {countryResult?.error && (
              <div className="text-sm text-red-600 p-4 bg-red-50 rounded">
                {countryResult.error}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCountryModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                닫기
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
