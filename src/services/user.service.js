const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');


//Fetches the currently authenticated user's full profile.
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

module.exports = { getMe };