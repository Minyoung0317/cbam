import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';

// 비밀번호 유효성 검사 함수
function isValidPassword(password: string): boolean {
  return /^[A-Za-z\d]{8,20}$/.test(password);
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const updateData: any = {};

    // 비밀번호 변경 요청이 있는 경우
    if (data.password) {
      if (!isValidPassword(data.password)) {
        return NextResponse.json(
          { error: '비밀번호는 8-20자의 영문자 또는 숫자로 입력해주세요.' },
          { status: 400 }
        );
      }
      updateData.password = data.password;
    }

    // 사업장 정보 업데이트
    const allowedFields = [
      'businessName', 'businessNameEng', 'address', 'industry',
      'postalCode', 'postBox',
      'city', 'country', 'unlocode', 'latitude',
      'longitude', 'representativeName', 'phoneNumber',
      'managerName', 'managerContact', 'managerEmail', 'economicActivity',
      'englishCity', 'streetAddress'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    // 주소 관련 필드 중복 저장 로직 (이전 상태 복원)
    if (data.address !== undefined) {
      updateData.nationalAddress = data.address;
    }
    if (data.postalCode !== undefined) {
      updateData.zipCode = data.postalCode;
    }
    if (data.postBox !== undefined) {
      updateData.companyMailbox = data.postBox;
    }

    const client = await clientPromise;
    const db = client.db('ESG');
    const collection = db.collection('users');

    const result = await collection.updateOne(
      { id: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '사용자 정보가 업데이트되었습니다.',
      success: true
    });
  } catch (error) {
    console.error('사용자 정보 업데이트 에러:', error);
    return NextResponse.json(
      { error: '사용자 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 