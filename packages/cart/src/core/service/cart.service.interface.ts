import { CartShoppingCart } from '../../persistence/entity/cart-shopping-cart.entity';

export interface AddToCartData {
  productId: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  productAttributes?: Record<string, unknown>;
}

export interface ICartService {
  getUserActiveCart(userId: string): Promise<CartShoppingCart>;
  getCartById(cartId: string): Promise<CartShoppingCart>;
  addToCart(userId: string, data: AddToCartData): Promise<CartShoppingCart>;
  removeFromCart(userId: string, productId: string): Promise<CartShoppingCart>;
  updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartShoppingCart>;
  clearCart(userId: string): Promise<void>;
  completeCart(cartId: string): Promise<CartShoppingCart>;
}