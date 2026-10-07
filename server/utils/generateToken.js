import jwt from 'jsonwebtoken';

export const sendTokenCookie = (user, statusCode, res, message = 'Success') => {
  // Create JWT payload
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  // Secure HTTP-Only Cookie options
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JS access
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // CSRF defense
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  };

  res.cookie('token', token, cookieOptions);

  // Return clean user object without password
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    addresses: user.addresses || []
  };

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: userResponse
    }
  });
};
