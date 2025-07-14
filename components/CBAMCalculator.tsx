import React, { useState } from 'react';

const CBAMCalculator = ({ productEmission, cbamCertificatePrice }: { productEmission: number, cbamCertificatePrice: number }) => {
  const [totalExportQuantity, setTotalExportQuantity] = useState(0);
  const finalPrepaidCost = 20; // 예시 값

  const calculatePaymentCost = () => {
    return productEmission * totalExportQuantity * cbamCertificatePrice;
  };

  const calculateFinalCBAMAmount = () => {
    return calculatePaymentCost() - finalPrepaidCost;
  };

  const handlePopup = () => {
    alert(`최종 기지불 탄소 비용: ${finalPrepaidCost}`);
  };

  return (
    <div>
      <div>
        <label>제품당 배출량: {productEmission}</label>
      </div>
      <div>
        <label>총제품 수출량: </label>
        <input
          type="number"
          value={totalExportQuantity}
          onChange={(e) => setTotalExportQuantity(Number(e.target.value))}
        />
      </div>
      <div>
        <label>CBAM 인증서 가격: {cbamCertificatePrice}</label>
      </div>
      <div>
        <label>지불 비용: {calculatePaymentCost()}</label>
      </div>
      <div>
        <button onClick={handlePopup}>최종 기지불 탄소 비용 보기</button>
      </div>
      <div>
        <label>CBAM 최종 부과 금액: {calculateFinalCBAMAmount()}</label>
      </div>
    </div>
  );
};

export default CBAMCalculator; 