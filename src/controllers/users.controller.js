
//=================== Controllers ======================
export async function getCurrentUserController(req, res) {
  try {
    return res.status(200).json({
      message: 'User profile fetched successfully',
      status: 'successful',
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong',
      status: 'Failed'
    });
  };
};