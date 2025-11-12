import { NotFoundDomainException } from '@tlc/shared-lib/common';

export class PaymentNotFoundException extends NotFoundDomainException {
  constructor(message = 'Payment not found') {
    super(message);
  }
}