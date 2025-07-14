import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// ID 유효성 검사 함수
function isValidId(id: string): boolean {
  // 영문자, 숫자 조합 4-20자
  const idRegex = /^[a-zA-Z0-9]{4,20}$/;
  return idRegex.test(id);
}

// 비밀번호 유효성 검사 함수
function isValidPassword(password: string): boolean {
  // 8-20자의 영문자 또는 숫자
  const passwordRegex = /^[A-Za-z\d]{8,20}$/;
  return passwordRegex.test(password);
}

// 이메일 유효성 검사 함수
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      password, 
      name, 
      email,
      businessName,
      businessNameEng,
      address,        // nationalAddress -> address
      industry,
      postalCode,   // zipCode -> postalCode
      postBox,      // companyMailbox -> postBox
      city,         
      street,       
      country,
      countryEng, // 국가명(영문) 추가  
      unlocode,
      latitude,
      longitude,
      representativeName,
      representativeNameEn,
      phoneNumber,
      businessNumber,
      managerName,
      managerContact,
      managerEmail
    } = body;

    // 필수 입력값 검증 개선
    const requiredFields = [
      { key: 'id', label: '아이디' },
      { key: 'password', label: '비밀번호' },
      { key: 'name', label: '대표자명' },
      { key: 'email', label: '이메일' },
      { key: 'businessName', label: '회사명(국문)' },
      { key: 'businessNameEng', label: '회사명(영문)' },
      { key: 'address', label: '주소' },
      { key: 'industry', label: '업종' },
      { key: 'postalCode', label: '우편번호' },
      { key: 'city', label: '도시명' },
      { key: 'street', label: '상세주소' },
      { key: 'country', label: '국가' },
      { key: 'unlocode', label: 'UNLOCODE' },
      { key: 'latitude', label: '위도' },
      { key: 'longitude', label: '경도' },
      { key: 'representativeName', label: '대표자명' },
      { key: 'representativeNameEn', label: '대표자명(영문)' },
      { key: 'phoneNumber', label: '전화번호' },
      { key: 'businessNumber', label: '사업자번호' },
      { key: 'managerName', label: '담당자명' },
      { key: 'managerContact', label: '담당자 연락처' },
      { key: 'managerEmail', label: '담당자 이메일' }
    ];
    const missingFields = requiredFields.filter(f => !body[f.key]);
    if (missingFields.length > 0) {
      const errorObj: Record<string, string> = {};
      missingFields.forEach(f => {
        errorObj[f.key] = `${f.label}을(를) 입력해주세요.`;
      });
      return NextResponse.json({ error: errorObj }, { status: 400 });
    }

    // ID 유효성 검사
    if (!isValidId(id)) {
      return NextResponse.json(
        { error: 'ID는 4-20자의 영문자와 숫자만 사용 가능합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 유효성 검사
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: '비밀번호는 8-20자의 영문자 또는 숫자로 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 유효성 검사
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // latitude, longitude 안전 파싱 및 검증
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: { latitude: '위도 값이 올바르지 않습니다.', longitude: '경도 값이 올바르지 않습니다.' } }, { status: 400 });
    }

    
 

    // 대표자명(대표자명에 국가명 등 비정상 값이 들어가는 경우 방지)
    if (typeof representativeName !== 'string' || representativeName.length < 2) {
      return NextResponse.json({ error: { representativeName: '대표자명을 올바르게 입력해주세요.' } }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ESG');
    const collection = db.collection('users');

    try {
      // ID 중복 확인
      const existingUser = await collection.findOne({ id });
      if (existingUser) {
        return NextResponse.json(
          { error: '이미 사용 중인 ID입니다.' },
          { status: 400 }
        );
      }

      // 이메일 중복 확인
      const existingEmail = await collection.findOne({ email });
      if (existingEmail) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다.' },
          { status: 400 }
        );
      }

      // 새 사용자 생성 (DB에 저장될 필드명 기준)
      const newUser = {
          id,
          password,
          name,
          email,
          businessName: managerName,         // 담당자명
          businessNameEng,     // 담당자 이메일(선택)
          address,
          nationalAddress: address,
          industry,
          postalCode,
          zipCode: postalCode,
          postBox,
          companyMailbox: postBox,
          englishCity: city,
          streetAddress: street,
          country,
          countryEng,
          unlocode,
          latitude: lat,
          longitude: lng,
          representativeName,
          representativeNameEn: representativeNameEn, // 대표자명(영문)
          phoneNumber,
          businessNumber,    // 담당자 연락처
          managerName,
          managerContact,
          managerEmail,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isActive: true
        };

      const result = await collection.insertOne(newUser);
      
      if (!result.acknowledged) {
        throw new Error('사용자 생성 실패');
      }

      // 생성된 사용자 정보 조회
      const createdUser = await collection.findOne({ _id: result.insertedId });
      if (!createdUser) {
        throw new Error('사용자 생성 후 조회 실패');
      }

      const { password: _, ...userWithoutPassword } = createdUser;

      return NextResponse.json(
        { 
          message: '회원가입이 완료되었습니다.', 
          user: userWithoutPassword,
          success: true
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('데이터베이스 작업 에러:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 작업 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('회원가입 에러:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 