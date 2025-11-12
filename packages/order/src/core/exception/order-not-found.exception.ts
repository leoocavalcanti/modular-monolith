import { NotFoundDomainException } from '@tlc/shared-lib/common';

export class OrderNotFoundException extends NotFoundDomainException {
  constructor(message = 'Order not found') {
    super(message);
  }
}