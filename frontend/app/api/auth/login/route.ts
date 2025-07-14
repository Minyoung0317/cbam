import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json();

    // 입력값 검증
    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID와 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ESG');
    const collection = db.collection('users');

    try {
      // MongoDB에서 사용자 확인
      const user = await collection.findOne({ id });
      
      if (!user) {
        return NextResponse.json(
          { error: '존재하지 않는 ID입니다.' },
          { status: 401 }
        );
      }

      // 비밀번호 확인 (대소문자 구분)
      if (user.password !== password) {
        return NextResponse.json(
          { error: '비밀번호가 일치하지 않습니다.' },
          { status: 401 }
        );
      }

      // 로그인 시간 업데이트
      await collection.updateOne(
        { id },
        { $set: { lastLoginAt: new Date() } }
      );

      // 로그인 성공 시 사용자 정보 반환 (비밀번호 제외)
      const { password: _, ...userWithoutPassword } = user;
      
      // 응답 생성
      const response = NextResponse.json(
        { 
          message: '로그인 성공', 
          user: userWithoutPassword,
          success: true 
        },
        { status: 200 }
      );

      // 쿠키 설정 (24시간 유효)
      response.cookies.set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24시간
      });

      return response;
    } catch (dbError) {
      console.error('데이터베이스 작업 에러:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 작업 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 