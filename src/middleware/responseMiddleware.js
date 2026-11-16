const responseMiddleware = (req, res, next) => {

  res.success = (data, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data
    });
  };

  res.created = (data, message = 'Created successfully') => {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  };
  
  res.noContent = () => {
    return res.status(204).end();
  };

  res.badRequest = (message = 'Invalid request') => {
    return res.status(400).json({
      success: false,
      message
    });
  };

  res.unauthorized = (message = 'Unauthorized') => {
    return res.status(401).json({
      success: false,
      message
    });
  };

  res.notFound = (message = 'Resource not found') => {
    return res.status(404).json({
      success: false,
      message
    });
  };

  next();
};

module.exports = responseMiddleware;