export class PaymentNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentNotFoundException';
  }
}