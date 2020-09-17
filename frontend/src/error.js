export class CustomError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'CustomError';
  }
}
