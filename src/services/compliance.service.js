// Evaluate transaction compliance

const evaluateTransactionCompliance = async ({
  fromAccount,
  toAccount,
  amount,
  balance
}) => {

  const violations = [];
  const rulesChecked = [];


  // Rule 1: Sender account must be ACTIVE
  rulesChecked.push('SENDER_ACCOUNT_ACTIVE');

  if (fromAccount.status !== 'ACTIVE') {
    violations.push({
      rule: 'SENDER_ACCOUNT_ACTIVE',
      message: 'Sender account is not active'
    });
  }


  // Rule 2: Receiver account must be ACTIVE
  rulesChecked.push('RECEIVER_ACCOUNT_ACTIVE');

  if (toAccount.status !== 'ACTIVE') {
    violations.push({
      rule: 'RECEIVER_ACCOUNT_ACTIVE',
      message: 'Receiver account is not active'
    });
  }


  // Rule 3: Sender and receiver must be different
  rulesChecked.push('DIFFERENT_ACCOUNTS');

  if (fromAccount._id.equals(toAccount._id)) {
    violations.push({
      rule: 'DIFFERENT_ACCOUNTS',
      message: 'Sender and receiver accounts must be different'
    });
  }


  // Rule 4: Amount must be greater than 0
  rulesChecked.push('POSITIVE_AMOUNT');

  if (amount <= 0) {
    violations.push({
      rule: 'POSITIVE_AMOUNT',
      message: 'Transaction amount must be greater than zero'
    });
  }


  // Rule 5: Transaction amount limit
  rulesChecked.push('TRANSACTION_LIMIT');

  const transactionLimit = 1000000;

  if (amount > transactionLimit) {
    violations.push({
      rule: 'TRANSACTION_LIMIT',
      message: 'Transaction amount exceeds the permitted limit'
    });
  }


  // Rule 6: Sufficient balance
  rulesChecked.push('SUFFICIENT_BALANCE');

  if (balance < amount) {
    violations.push({
      rule: 'SUFFICIENT_BALANCE',
      message: 'Insufficient account balance'
    });
  }


  // Final compliance decision
  if (violations.length > 0) {
    return {
      decision: 'BLOCK',
      compliant: false,
      violations,
      rulesChecked
    };
  }


  return {
    decision: 'ALLOW',
    compliant: true,
    violations: [],
    rulesChecked
  };
};


export {
  evaluateTransactionCompliance
};