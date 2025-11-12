import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../../cart.service';
import { CartShoppingCartRepository } from '../../../../persistence/repository/cart-shopping-cart.repository';
import { CartShoppingCartItemRepository } from '../../../../persistence/repository/cart-shopping-cart-item.repository';
import { cartShoppingCartFactory, cartShoppingCartItemFactory } from '../../../../../__test__/factory/cart-shopping-cart.test-factory';
import { NotFoundDomainException, DomainException } from '@tlc/shared-lib/common';
import { CartStatus } from '../../../enum/cart-status.enum';

// Mock the Transactional decorator
jest.mock('typeorm-transactional', () => ({
  Transactional: () => (_target: any, _propertyName: string, descriptor: PropertyDescriptor) => descriptor,
}));

type MockedCartRepository = jest.Mocked<CartShoppingCartRepository>;
type MockedCartItemRepository = jest.Mocked<CartShoppingCartItemRepository>;

describe('CartService', () => {
  let service: CartService;
  let mockCartRepository: MockedCartRepository;
  let mockCartItemRepository: MockedCartItemRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartShoppingCartRepository,
          useValue: {
            findActiveCartByUserId: jest.fn(),
            findCartByIdWithItems: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CartShoppingCartItemRepository,
          useValue: {
            findByCartIdAndProductId: jest.fn(),
            findByCartId: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    mockCartRepository = module.get<CartShoppingCartRepository>(
      CartShoppingCartRepository
    ) as MockedCartRepository;
    mockCartItemRepository = module.get<CartShoppingCartItemRepository>(
      CartShoppingCartItemRepository
    ) as MockedCartItemRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserActiveCart', () => {
    it('should return existing active cart', async () => {
      // Arrange
      const userId = 'user-123';
      const cart = cartShoppingCartFactory.build({ userId });
      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);

      // Act
      const result = await service.getUserActiveCart(userId);

      // Assert
      expect(result).toEqual(cart);
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(userId);
    });

    it('should create new cart when no active cart exists', async () => {
      // Arrange
      const userId = 'user-123';
      const newCart = cartShoppingCartFactory.build({ userId });
      mockCartRepository.findActiveCartByUserId.mockResolvedValue(null);
      mockCartRepository.save.mockResolvedValue(newCart);

      // Act
      const result = await service.getUserActiveCart(userId);

      // Assert
      expect(result).toEqual(newCart);
      expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(userId);
      expect(mockCartRepository.save).toHaveBeenCalled();
    });
  });

  describe('getCartById', () => {
    it('should return cart when found', async () => {
      // Arrange
      const cartId = 'cart-123';
      const cart = cartShoppingCartFactory.build({ id: cartId });
      mockCartRepository.findCartByIdWithItems.mockResolvedValue(cart);

      // Act
      const result = await service.getCartById(cartId);

      // Assert
      expect(result).toEqual(cart);
      expect(mockCartRepository.findCartByIdWithItems).toHaveBeenCalledWith(cartId);
    });

    it('should throw NotFoundDomainException when cart not found', async () => {
      // Arrange
      const cartId = 'non-existent-cart';
      mockCartRepository.findCartByIdWithItems.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCartById(cartId)).rejects.toThrow(NotFoundDomainException);
      expect(mockCartRepository.findCartByIdWithItems).toHaveBeenCalledWith(cartId);
    });
  });

  describe('addToCart', () => {
    it('should update existing cart item quantity', async () => {
      // Arrange
      const userId = 'user-123';
      const cart = cartShoppingCartFactory.build({ userId });
      const existingItem = cartShoppingCartItemFactory.build({ 
        cartId: cart.id, 
        quantity: 2 
      });
      const addToCartData = {
        productId: existingItem.productId,
        productName: 'Test Product',
        productSku: 'TEST-001',
        price: 100,
        quantity: 3,
      };

      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);
      mockCartItemRepository.findByCartIdAndProductId.mockResolvedValue(existingItem);
      mockCartItemRepository.save.mockResolvedValue(existingItem);
      mockCartRepository.findCartByIdWithItems.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue(cart);

      // Act
      const result = await service.addToCart(userId, addToCartData);

      // Assert
      expect(existingItem.quantity).toBe(5); // 2 + 3
      expect(existingItem.price).toBe(100);
      expect(mockCartItemRepository.save).toHaveBeenCalledWith(existingItem);
      expect(result).toEqual(cart);
    });

    it('should create new cart item when item does not exist', async () => {
      // Arrange
      const userId = 'user-123';
      const cart = cartShoppingCartFactory.build({ userId });
      const addToCartData = {
        productId: 'product-123',
        productName: 'New Product',
        productSku: 'NEW-001',
        price: 50,
        quantity: 1,
      };

      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);
      mockCartItemRepository.findByCartIdAndProductId.mockResolvedValue(null);
      mockCartItemRepository.save.mockResolvedValue(
        cartShoppingCartItemFactory.build(addToCartData)
      );
      mockCartRepository.findCartByIdWithItems.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue(cart);

      // Act
      const result = await service.addToCart(userId, addToCartData);

      // Assert
      expect(mockCartItemRepository.save).toHaveBeenCalled();
      expect(result).toEqual(cart);
    });
  });

  describe('removeFromCart', () => {
    it('should remove cart item successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const productId = 'product-123';
      const cart = cartShoppingCartFactory.build({ userId });
      const cartItem = cartShoppingCartItemFactory.build({ 
        cartId: cart.id,
        productId 
      });

      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);
      mockCartItemRepository.findByCartIdAndProductId.mockResolvedValue(cartItem);
      mockCartItemRepository.remove.mockResolvedValue(cartItem);
      mockCartRepository.findCartByIdWithItems.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue(cart);

      // Act
      const result = await service.removeFromCart(userId, productId);

      // Assert
      expect(mockCartItemRepository.remove).toHaveBeenCalledWith(cartItem);
      expect(result).toEqual(cart);
    });

    it('should throw NotFoundDomainException when item not found', async () => {
      // Arrange
      const userId = 'user-123';
      const productId = 'non-existent-product';
      const cart = cartShoppingCartFactory.build({ userId });

      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);
      mockCartItemRepository.findByCartIdAndProductId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removeFromCart(userId, productId)).rejects.toThrow(
        NotFoundDomainException
      );
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update cart item quantity successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const productId = 'product-123';
      const newQuantity = 5;
      const cart = cartShoppingCartFactory.build({ userId });
      const cartItem = cartShoppingCartItemFactory.build({ 
        cartId: cart.id,
        productId,
        quantity: 2
      });

      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);
      mockCartItemRepository.findByCartIdAndProductId.mockResolvedValue(cartItem);
      mockCartItemRepository.save.mockResolvedValue(cartItem);
      mockCartRepository.findCartByIdWithItems.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue(cart);

      // Act
      const result = await service.updateCartItemQuantity(userId, productId, newQuantity);

      // Assert
      expect(cartItem.quantity).toBe(newQuantity);
      expect(mockCartItemRepository.save).toHaveBeenCalledWith(cartItem);
      expect(result).toEqual(cart);
    });

    it('should throw DomainException for invalid quantity', async () => {
      // Arrange
      const userId = 'user-123';
      const productId = 'product-123';
      const invalidQuantity = 0;

      // Act & Assert
      await expect(
        service.updateCartItemQuantity(userId, productId, invalidQuantity)
      ).rejects.toThrow(DomainException);
    });

    it('should throw NotFoundDomainException when item not found', async () => {
      // Arrange
      const userId = 'user-123';
      const productId = 'non-existent-product';
      const quantity = 5;
      const cart = cartShoppingCartFactory.build({ userId });

      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);
      mockCartItemRepository.findByCartIdAndProductId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateCartItemQuantity(userId, productId, quantity)
      ).rejects.toThrow(NotFoundDomainException);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', async () => {
      // Arrange
      const userId = 'user-123';
      const cart = cartShoppingCartFactory.build({ userId });
      const items = [
        cartShoppingCartItemFactory.build({ cartId: cart.id }),
        cartShoppingCartItemFactory.build({ cartId: cart.id }),
      ];

      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);
      mockCartItemRepository.findByCartId.mockResolvedValue(items);
      mockCartItemRepository.remove.mockResolvedValue(items);
      mockCartRepository.findCartByIdWithItems.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue(cart);

      // Act
      await service.clearCart(userId);

      // Assert
      expect(mockCartItemRepository.remove).toHaveBeenCalledWith(items);
    });

    it('should handle empty cart gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      const cart = cartShoppingCartFactory.build({ userId });

      mockCartRepository.findActiveCartByUserId.mockResolvedValue(cart);
      mockCartItemRepository.findByCartId.mockResolvedValue([]);
      mockCartRepository.findCartByIdWithItems.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue(cart);

      // Act & Assert
      await expect(service.clearCart(userId)).resolves.not.toThrow();
      expect(mockCartItemRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('completeCart', () => {
    it('should mark cart as completed', async () => {
      // Arrange
      const cartId = 'cart-123';
      const cart = cartShoppingCartFactory.build({ 
        id: cartId, 
        status: CartStatus.ACTIVE 
      });
      const completedCart = cartShoppingCartFactory.build({ 
        ...cart, 
        status: CartStatus.COMPLETED 
      });

      mockCartRepository.findCartByIdWithItems.mockResolvedValue(cart);
      mockCartRepository.save.mockResolvedValue(completedCart);

      // Act
      const result = await service.completeCart(cartId);

      // Assert
      expect(cart.status).toBe(CartStatus.COMPLETED);
      expect(mockCartRepository.save).toHaveBeenCalledWith(cart);
      expect(result).toEqual(completedCart);
    });
  });
});