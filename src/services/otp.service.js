import bcrypt from 'bcryptjs';


const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10);
};


const getOtpExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000);
};


export {
  generateOtp,
  hashOtp,
  getOtpExpiry
};