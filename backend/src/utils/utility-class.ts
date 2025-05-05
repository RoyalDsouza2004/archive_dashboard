class ErrorHandler extends Error {
  code?: string;
  errno?:Number;
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorHandler;