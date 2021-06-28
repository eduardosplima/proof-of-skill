export class SkuNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, SkuNotFoundException);
  }
}
