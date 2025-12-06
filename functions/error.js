class AppHttpError extends Error {
  constructor(message, httpCode) {
    super(message);
    this.httpCode = httpCode; 
  }
}

const buildResponseForAppHttpError = function(err, res){
    return res.status(err.httpCode).json({ message: err.message });
}

module.exports = { AppHttpError, buildResponseForAppHttpError };