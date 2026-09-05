// Evaluate final transaction decision

const evaluateTransactionDecision = ({
  riskResult,
  complianceResult
}) => {

  // Compliance violation always blocks the transaction
  if (!complianceResult.compliant) {
    return {
      decision: 'BLOCK',
      reason: 'Transaction failed compliance checks'
    };
  }


  // HIGH risk transaction requires OTP verification
  if (riskResult.riskLevel === 'HIGH') {
    return {
      decision: 'VERIFY',
      reason: 'Transaction requires additional verification'
    };
  }


  // LOW and MEDIUM risk transactions can proceed
  return {
    decision: 'ALLOW',
    reason: 'Transaction passed risk and compliance checks'
  };
};


export {
  evaluateTransactionDecision
};