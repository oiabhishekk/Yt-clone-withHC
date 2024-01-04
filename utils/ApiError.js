class ApiError extends Error {
  constructor(
    message = "something went wrong",
    statusCode,
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors=errors;
    this.stack=stack;
    this.data=null;
    this.success=false;
  }
}
