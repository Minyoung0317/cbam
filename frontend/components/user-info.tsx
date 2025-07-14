'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  phone: string;
}

export default function UserInfo() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UserInfo | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/me', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setUserInfo(data);
      setEditedInfo(data);
    } catch (err) {
      console.error('사용자 정보 조회 중 오류:', err);
      setError('사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(userInfo);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSave = async () => {
    try {
      if (!editedInfo) return;

      // 비밀번호 변경이 포함된 경우 유효성 검사
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError('새 비밀번호가 일치하지 않습니다.');
          return;
        }
        if (!currentPassword) {
          setError('현재 비밀번호를 입력해주세요.');
          return;
        }
      }

      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...editedInfo,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('사용자 정보 수정에 실패했습니다.');
      }

      setUserInfo(editedInfo);
      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('사용자 정보가 성공적으로 수정되었습니다.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('사용자 정보 수정 중 오류:', err);
      setError('사용자 정보 수정에 실패했습니다.');
    }
  };

  if (!userInfo) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">회원 정보</h2>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label>아이디</Label>
          <Input
            value={editedInfo?.id || ''}
            disabled
          />
        </div>

        <div>
          <Label>이메일</Label>
          <Input
            value={editedInfo?.email || ''}
            onChange={(e) => setEditedInfo(prev => prev ? {...prev, email: e.target.value} : null)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Label>이름</Label>
          <Input
            value={editedInfo?.name || ''}
            onChange={(e) => setEditedInfo(prev => prev ? {...prev, name: e.target.value} : null)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Label>전화번호</Label>
          <Input
            value={editedInfo?.phone || ''}
            onChange={(e) => setEditedInfo(prev => prev ? {...prev, phone: e.target.value} : null)}
            disabled={!isEditing}
          />
        </div>

        {isEditing && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">비밀번호 변경</h3>
            
            <div>
              <Label>현재 비밀번호</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>새 비밀번호</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>새 비밀번호 확인</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          {!isEditing ? (
            <Button onClick={handleEdit}>
              수정
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button onClick={handleSave}>
                저장
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 