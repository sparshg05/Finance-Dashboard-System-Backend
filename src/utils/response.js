/**
 * Sends a standardized success JSON response.
 */
const sendSuccess = (res, statusCode, data, message = 'Success') => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  };
  
  module.exports = { sendSuccess };