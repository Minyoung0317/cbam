import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// ID 유효성 검사 함수
function isValidId(id: string): boolean {
  // 영문자, 숫자 조합 4-20자
  const idRegex = /^[a-zA-Z0-9]{4,20}$/;
  return idRegex.test(id);
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID를 입력해주세요.' },
        { status: 400 }
      );
    }

    // ID 유효성 검사
    if (!isValidId(id)) {
      return NextResponse.json(
        { error: 'ID는 4-20자의 영문자와 숫자만 사용 가능합니다.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ESG');
    const collection = db.collection('users');

    try {
      // ID 중복 확인
      const existingUser = await collection.findOne({ id });
      
      if (existingUser) {
        return NextResponse.json(
          { 
            available: false,
            message: '이미 사용 중인 ID입니다.'
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { 
          available: true,
          message: '사용 가능한 ID입니다.'
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('데이터베이스 조회 에러:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('ID 중복 확인 에러:', error);
    return NextResponse.json(
      { error: 'ID 중복 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 