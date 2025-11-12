export { OrderModule } from './order.module';

// Export public facades
export { OrderFacade } from './src/public-api/facade/order.facade';

// Export public enums
export { OrderStatus } from './src/core/enum/order-status.enum';
export { PaymentStatus } from './src/core/enum/payment-status.enum';

// Export public interfaces
export type { OrderManagementApi } from './src/public-api/facade/order.facade';
export type { IOrderPublicApi, OrderStatusResponse, OrderSummary } from './src/public-api/interface/order-public.interface';