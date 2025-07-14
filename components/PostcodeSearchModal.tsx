"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    daum: any;
    kakao: any;
  }
}

interface Props {
  onSelect: (data: {
    address: string;
    zonecode: string;
    latitude: number;
    longitude: number;
    unlocode?: string;
    cityEng?: string;
    street?: string;
  }) => void;
}

export default function PostcodeSearchModal({ onSelect }: Props) {
  const scriptRefs = useRef<HTMLScriptElement[]>([]);
  const isScriptLoaded = useRef(false);

  const openPostcode = () => {
    if (isScriptLoaded.current && window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(data.roadAddress || data.address, (result: any, status: any) => {
              let lat = 37.5665;
              let lng = 126.9780;
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                lat = parseFloat(result[0].y);
                lng = parseFloat(result[0].x);
              }
              onSelect({
                address: data.roadAddress || data.address,
                zonecode: data.zonecode,
                latitude: lat,
                longitude: lng,
                unlocode: `KR ${data.sigunguCode ? data.sigunguCode.substring(0,3).toUpperCase() : (data.bcode ? data.bcode.substring(2,5).toUpperCase() : 'SEL')}`,
                cityEng: data.sidoEnglish || data.sigunguEnglish || '',
                street: data.roadNameEnglish || data.bnameEnglish || '' 
              });
            });
          } else {
            onSelect({
              address: data.roadAddress || data.address,
              zonecode: data.zonecode,
              latitude: 37.5665, // 기본값
              longitude: 126.9780, // 기본값
              unlocode: `KR ${data.sigunguCode ? data.sigunguCode.substring(0,3).toUpperCase() : (data.bcode ? data.bcode.substring(2,5).toUpperCase() : 'SEL')}`,
              cityEng: data.sidoEnglish || data.sigunguEnglish || '',
              street: data.roadNameEnglish || data.bnameEnglish || '' 
            });
          }
        }
      }).open();
    } else {
      alert("주소 검색 API가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (isScriptLoaded.current) return;

    let postcodeScriptInstance: HTMLScriptElement | null = null;
    let mapScriptInstance: HTMLScriptElement | null = null;

    const loadScripts = () => {
      postcodeScriptInstance = document.createElement("script");
      postcodeScriptInstance.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      postcodeScriptInstance.async = true;
      document.head.appendChild(postcodeScriptInstance);
      scriptRefs.current.push(postcodeScriptInstance);

      mapScriptInstance = document.createElement("script");
      mapScriptInstance.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&libraries=services&autoload=false`;
      mapScriptInstance.async = true;
      mapScriptInstance.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            isScriptLoaded.current = true;
          });
        }
      };
      document.head.appendChild(mapScriptInstance);
      scriptRefs.current.push(mapScriptInstance);
    }

    loadScripts();

    return () => {
      scriptRefs.current.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      scriptRefs.current = [];
      isScriptLoaded.current = false;
    };
  }, []);

  return (
    <button
      type="button"
      onClick={openPostcode}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
    >
      주소검색
    </button>
  );
} 