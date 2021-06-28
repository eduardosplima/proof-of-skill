export class DuplicatedSkuException extends Error {
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, DuplicatedSkuException);
  }
}
