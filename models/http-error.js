class HttpError extends Error {
  constructor(message, error) {
    super(message); //message property
    this.code = error; // code property
  }
}

module.exports = HttpError;
