const evaluateTransactionRisk = async ({
  user,
  fromAccount,
  toAccount,
  amount
}) => {

  let riskScore = 0;
  const riskReasons = [];


  // Rule 1: High transaction amount
  if (amount >= 100000) {
    riskScore += 40;

    riskReasons.push('High transaction amount');
  }


  // Rule 2: Very high transaction amount
  if (amount >= 500000) {
    riskScore += 30;

    riskReasons.push('Very high transaction amount');
  }


  // Rule 3: Sender and receiver are the same
  if (fromAccount._id.equals(toAccount._id)) {
    riskScore += 30;

    riskReasons.push('Sender and receiver accounts are the same');
  }


  // Keep score within 0-100
  riskScore = Math.min(riskScore, 100);


  // HIGH risk
  if (riskScore >= 70) {
    return {
      riskLevel: 'HIGH',
      riskScore,
      riskReasons,
      requiresOtp: true
    };
  }


  // MEDIUM risk
  if (riskScore >= 40) {
    return {
      riskLevel: 'MEDIUM',
      riskScore,
      riskReasons,
      requiresOtp: false
    };
  }


  // LOW risk
  return {
    riskLevel: 'LOW',
    riskScore,
    riskReasons,
    requiresOtp: false
  };
};


export {
  evaluateTransactionRisk
};