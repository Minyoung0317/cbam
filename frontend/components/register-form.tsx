"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PostcodeSearchModal from "./PostcodeSearchModal"

// 국가 목록 (예시, 실제로는 더 많은 국가 또는 API 연동 필요)
const countries = [
  { code: 'KR', name: '대한민국' },
  { code: 'US', name: '미국' },
  { code: 'JP', name: '일본' },
  // ... 다른 국가들
]

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

type FormData = {
  loginId: string;
  companyName: string;
  password: string;
  confirmPassword: string;
  ceoName: string;
  email: string;
  phone: string;
  industry: string;
  employeeCount: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  unlocode: string;
  businessNameEng: string;
  postBox: string;
  latitude: string;
  longitude: string;
  managerName: string;
  managerContact: string;
  managerEmail: string;
  economicActivity: string;
}

// 유효성 검사 함수들
const validators = {
  loginId: (value: string, _: FormData) => {
    if (!value) return '아이디를 입력해주세요.';
    if (!/^[a-zA-Z0-9]{4,20}$/.test(value)) return '아이디는 4-20자의 영문자와 숫자만 사용 가능합니다.';
    return '';
  },
  password: (value: string, _: FormData) => {
    if (!value) return '비밀번호를 입력해주세요.';
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(value)) {
      return '비밀번호는 8자 이상이며, 영문자, 숫자, 특수문자를 포함해야 합니다.';
    }
    return '';
  },
  confirmPassword: (value: string, formData: FormData) => {
    if (!value) return '비밀번호 확인을 입력해주세요.';
    if (value !== formData.password) return '비밀번호가 일치하지 않습니다.';
    return '';
  },
  email: (value: string, _: FormData) => {
    if (!value) return '이메일을 입력해주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '유효한 이메일 주소를 입력해주세요.';
    return '';
  }
} as const;

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  // 폼 데이터 상태
  const [formData, setFormData] = useState<FormData>({
    loginId: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    ceoName: '',
    email: '',
    phone: '',
    industry: '',
    employeeCount: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'KR',
    unlocode: '',
    businessNameEng: '',
    postBox: '',
    latitude: '37.5665',
    longitude: '126.9780',
    managerName: '',
    managerContact: '',
    managerEmail: '',
    economicActivity: '',
  })

  // 주소 관련 상태
  const [showPostcode, setShowPostcode] = useState(false)

  const validateField = (name: string, value: string) => {
    if (validators[name as keyof typeof validators]) {
      const validatorFn = validators[name as keyof typeof validators];
      const error = validatorFn(value, formData);
      
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleAddressSelect = (data: any) => {
    // 카카오 주소 검색 API 응답에서 위도(y), 경도(x) 추출
    const latitude = data.y || '37.5665';  // 기본값: 서울시청
    const longitude = data.x || '126.9780';

    setFormData(prev => ({
      ...prev,
      address: data.roadAddress + (data.buildingName ? ` (${data.buildingName})` : ''),
      postalCode: data.zonecode,
      city: data.sido + (data.sigungu ? ' ' + data.sigungu : ''), 
      unlocode: prev.country + ' ' + (data.sido.substring(0,3).toUpperCase() || 'SEL'),
      latitude: latitude,
      longitude: longitude
    }))
    setShowPostcode(false)
  }

  const isFormValid = () => {
    return (
      formData.loginId &&
      formData.companyName &&
      formData.password &&
      formData.confirmPassword &&
      formData.ceoName &&
      formData.email &&
      formData.phone &&
      formData.industry &&
      formData.address &&
      formData.postalCode &&
      formData.city &&
      formData.country &&
      formData.unlocode &&
      formData.businessNameEng &&
      formData.managerName &&
      formData.managerContact &&
      formData.managerEmail &&
      !isLoading
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    // 모든 필드 유효성 검사
    let hasErrors = false;
    Object.keys(formData).forEach((key) => {
      if (validators[key as keyof typeof validators]) {
        const validatorFn = validators[key as keyof typeof validators];
        const error = validatorFn(formData[key as keyof FormData], formData);
        
        if (error) {
          setFieldErrors(prev => ({ ...prev, [key]: error }));
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    const payload = {
      id: formData.loginId,
      password: formData.password,
      name: formData.ceoName,
      email: formData.email,
      businessName: formData.companyName,
      businessNameEng: formData.businessNameEng,
      address: formData.address,
      industry: formData.industry,
      postalCode: formData.postalCode,
      postBox: formData.postBox,
      city: formData.city,
      country: formData.country,
      unlocode: formData.unlocode,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      representativeName: formData.ceoName,
      phoneNumber: formData.phone,
      managerName: formData.managerName,
      managerContact: formData.managerContact,
      managerEmail: formData.managerEmail,
      economicActivity: formData.industry
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        // 서버에서 반환된 에러 메시지를 적절한 필드에 매핑
        if (result.error.includes('ID')) {
          setFieldErrors(prev => ({ ...prev, loginId: result.error }));
        } else if (result.error.includes('비밀번호')) {
          setFieldErrors(prev => ({ ...prev, password: result.error }));
        } else if (result.error.includes('이메일')) {
          setFieldErrors(prev => ({ ...prev, email: result.error }));
        } else {
          setError(result.error || '회원가입 중 오류가 발생했습니다.');
        }
        throw new Error(result.error || `Error: ${response.status}`);
      }

      setSuccess(result.message || '회원가입이 완료되었습니다. 로그인해주세요.');
      // 폼 초기화
      setFormData({
        loginId: '',
        companyName: '',
        password: '',
        confirmPassword: '',
        ceoName: '',
        email: '',
        phone: '',
        industry: '',
        employeeCount: '',
        address: '',
        postalCode: '',
        city: '',
        country: 'KR',
        unlocode: '',
        businessNameEng: '',
        postBox: '',
        latitude: '37.5665',
        longitude: '126.9780',
        managerName: '',
        managerContact: '',
        managerEmail: '',
        economicActivity: '',
      });
      
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err: any) {
      console.error('Registration failed:', err);
      if (!error && !Object.keys(fieldErrors).length) {
        setError(err.message || '회원가입 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="legacy-window bg-white max-w-2xl mx-auto my-8">
      <div className="flex justify-between items-center bg-[#4169e1] text-white px-2 py-1">
        <div>Smart ESG - 회원가입</div>
        <div className="flex space-x-1">
          <button className="text-xs">_</button>
          <button className="text-xs">□</button>
          <button className="text-xs">×</button>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#4169e1]">Smart ESG</h1>
          <p className="text-sm text-gray-600">지속가능경영 관리 시스템 사용을 위한 계정을 생성하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 아이디 */}
            <div className="space-y-1">
              <label htmlFor="loginId" className="block text-sm">아이디 *</label>
              <input 
                id="loginId" 
                name="loginId" 
                type="text" 
                required 
                className={`legacy-input ${fieldErrors.loginId ? 'border-red-500' : ''}`}
                value={formData.loginId} 
                onChange={handleInputChange}
                onBlur={(e) => validateField('loginId', e.target.value)}
                placeholder="영문, 숫자 조합 4-20자"
              />
              {fieldErrors.loginId && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.loginId}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">영문, 숫자 조합 4-20자</p>
            </div>

            {/* 회사명 (국문) */}
            <div className="space-y-1">
              <label htmlFor="companyName" className="block text-sm">회사명 (국문) *</label>
              <input 
                id="companyName" 
                name="companyName" 
                type="text" 
                required 
                className={`legacy-input ${!formData.companyName ? 'border-red-500' : ''}`}
                value={formData.companyName} 
                onChange={handleInputChange}
                placeholder="예: 스마트이에스지"
              />
              {!formData.companyName && (
                <p className="text-red-500 text-xs mt-1">회사명을 입력해주세요.</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm">비밀번호 *</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className={`legacy-input ${fieldErrors.password ? 'border-red-500' : ''}`}
                value={formData.password} 
                onChange={handleInputChange}
                onBlur={(e) => validateField('password', e.target.value)}
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">영문, 숫자, 특수문자(@$!%*#?&) 포함 8자 이상</p>
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm">비밀번호 확인 *</label>
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                required 
                className={`legacy-input ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                value={formData.confirmPassword} 
                onChange={handleInputChange}
                onBlur={(e) => validateField('confirmPassword', e.target.value)}
                placeholder="비밀번호 재입력"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
            
            {/* 대표자명 */}
            <div className="space-y-1">
              <label htmlFor="ceoName" className="block text-sm">대표자명 *</label>
              <input 
                id="ceoName" 
                name="ceoName" 
                type="text" 
                required 
                className="legacy-input" 
                value={formData.ceoName} 
                onChange={handleInputChange}
                placeholder="예: 홍길동" 
              />
            </div>

            {/* 이메일 */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm">이메일 *</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className={`legacy-input ${fieldErrors.email ? 'border-red-500' : ''}`}
                value={formData.email} 
                onChange={handleInputChange}
                onBlur={(e) => validateField('email', e.target.value)}
                placeholder="예: example@smartesg.com"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* 전화번호 */}
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm">전화번호 *</label>
              <input 
                id="phone" 
                name="phone" 
                type="tel" 
                required 
                className="legacy-input" 
                value={formData.phone} 
                onChange={handleInputChange}
                placeholder="예: 010-1234-5678" 
              />
            </div>
            
            {/* 회사명 (영문) */}
            <div className="space-y-1">
              <label htmlFor="businessNameEng" className="block text-sm">회사명 (영문) *</label>
              <input 
                id="businessNameEng" 
                name="businessNameEng" 
                type="text" 
                required 
                className="legacy-input" 
                value={formData.businessNameEng} 
                onChange={handleInputChange}
                placeholder="예: Smart ESG" 
              />
            </div>

            {/* 업종 */}
            <div className="space-y-1">
              <label htmlFor="industry" className="block text-sm">업종 *</label>
              <div className="relative">
                <select 
                  id="industry" 
                  name="industry" 
                  required 
                  className="legacy-select w-full appearance-none bg-white" 
                  value={formData.industry} 
                  onChange={handleInputChange}
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

            {/* 국가 */}
            <div className="space-y-1">
              <label htmlFor="country" className="block text-sm"> 국가 *</label>
              <select id="country" name="country" required className="legacy-select" value={formData.country} onChange={handleInputChange}>
                {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            
            {/* UNLOCODE */}
            <div className="space-y-1">
              <label htmlFor="unlocode" className="block text-sm"> UNLOCODE * (예: KR INC)</label>
              <input id="unlocode" name="unlocode" type="text" required className="legacy-input" placeholder="국가코드 도시코드" value={formData.unlocode} onChange={handleInputChange} />
            </div>

            {/* 국문 주소 (상세주소까지 포함) */} 
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="address" className="block text-sm"> 국문 주소 (상세주소) *</label>
              <div className="flex gap-2">
                <input id="address" name="address" type="text" required className="legacy-input flex-1" placeholder="도로명 주소 검색 후 상세 주소 입력" value={formData.address} onChange={handleInputChange} />
                <button type="button" className="bg-[#4169e1] text-white px-3 py-1 rounded" onClick={() => setShowPostcode(true)}>
                  주소 검색
                </button>
              </div>
            </div>

            {/* 우편번호 */}
            <div className="space-y-1">
              <label htmlFor="postalCode" className="block text-sm"> 우편번호 *</label>
              <input id="postalCode" name="postalCode" type="text" required className="legacy-input" value={formData.postalCode} onChange={handleInputChange} readOnly />
            </div>

            {/* 도시명 (API는 영문 도시명을 기대) */}
            <div className="space-y-1">
              <label htmlFor="city" className="block text-sm"> 도시명 (국문) *</label>
              <input id="city" name="city" type="text" required className="legacy-input" value={formData.city} onChange={handleInputChange} readOnly />
            </div>
            
            {/* 사서함 */}
            <div className="space-y-1">
              <label htmlFor="postBox" className="block text-sm"> 사서함</label>
              <input id="postBox" name="postBox" type="text" className="legacy-input" value={formData.postBox} onChange={handleInputChange} />
            </div>

            {/* 담당자 정보 섹션 */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">담당자 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="managerName" className="block text-sm">담당자명 *</label>
                  <input
                    id="managerName"
                    name="managerName"
                    type="text"
                    required
                    className="legacy-input"
                    value={formData.managerName}
                    onChange={handleInputChange}
                    placeholder="예: 홍길동"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="managerContact" className="block text-sm">담당자 연락처 *</label>
                  <input
                    id="managerContact"
                    name="managerContact"
                    type="tel"
                    required
                    className="legacy-input"
                    value={formData.managerContact}
                    onChange={handleInputChange}
                    placeholder="예: 010-1234-5678"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="managerEmail" className="block text-sm">담당자 이메일 *</label>
                  <input
                    id="managerEmail"
                    name="managerEmail"
                    type="email"
                    required
                    className={`legacy-input ${fieldErrors.managerEmail ? 'border-red-500' : ''}`}
                    value={formData.managerEmail}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('managerEmail', e.target.value)}
                    placeholder="예: manager@smartesg.com"
                  />
                  {fieldErrors.managerEmail && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.managerEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#4169e1] text-white px-2 py-1 text-sm border border-[#3a5fcc] hover:bg-[#3a5fcc]"
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 text-sm">
          이미 계정이 있으신가요?{" "}
          <Link href="/" className="text-[#4169e1] hover:underline">
            로그인
          </Link>
        </div>

        {showPostcode && (
          <PostcodeSearchModal
            isOpen={showPostcode}
            onOpenChange={setShowPostcode}
            onSelect={handleAddressSelect}
          />
        )}
      </div>
    </div>
  )
}
