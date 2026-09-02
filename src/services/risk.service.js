// Evaluate transaction risk
const evaluateTransactionRisk = async ({
  user,
  fromAccount,
  toAccount,
  amount
}) => {
  let riskScore = 0;

  // Example basic rules
  if (amount >= 100000) {
    riskScore += 40;
  }

  if (fromAccount._id.equals(toAccount._id)) {
    riskScore += 30;
  }

  if (riskScore >= 70) {
    return {
      riskLevel: 'HIGH',
      riskScore,
      requiresOtp: true
    };
  }

  if (riskScore >= 40) {
    return {
      riskLevel: 'MEDIUM',
      riskScore,
      requiresOtp: false
    };
  }

  return {
    riskLevel: 'LOW',
    riskScore,
    requiresOtp: false
  };
};

export {
  evaluateTransactionRisk
};