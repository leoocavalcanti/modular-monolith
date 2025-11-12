import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CatalogProductService } from '../../catalog-product.service';
import { CatalogProductRepository } from '../../../../persistence/repository/catalog-product.repository';
import { catalogProductFactory, catalogProductOutOfStockFactory } from '../../../../../__test__/factory/catalog-product.test-factory';

// Mock the Transactional decorator
jest.mock('typeorm-transactional', () => ({
  Transactional: () => (_target: any, _propertyName: string, descriptor: PropertyDescriptor) => descriptor,
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

type MockedRepository = jest.Mocked<CatalogProductRepository>;

describe('CatalogProductService', () => {
  let service: CatalogProductService;
  let mockRepository: MockedRepository;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogProductService,
        {
          provide: CatalogProductRepository,
          useValue: {
            findOneById: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            findByCategory: jest.fn(),
            findByStatus: jest.fn(),
            findBySku: jest.fn(),
            searchByName: jest.fn(),
            findActiveProducts: jest.fn(),
            updateStock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CatalogProductService>(CatalogProductService);
    mockRepository = module.get<CatalogProductRepository>(
      CatalogProductRepository
    ) as MockedRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
      // Arrange
      const product = catalogProductFactory.build();
      mockRepository.findOne.mockResolvedValue(product);

      // Act
      const result = await service.getProductById(product.id!);

      // Assert
      expect(result).toEqual(product);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: product.id } });
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProductById(productId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
    });
  });

  describe('checkProductAvailability', () => {
    it('should return true when product is available and has sufficient stock', async () => {
      // Arrange
      const product = catalogProductFactory.build({ stock: 10 });
      const quantity = 5;
      mockRepository.findOne.mockResolvedValue(product);

      // Act
      const result = await service.checkProductAvailability(product.id!, quantity);

      // Assert
      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: product.id } });
    });

    it('should return false when product is out of stock', async () => {
      // Arrange
      const product = catalogProductOutOfStockFactory();
      const quantity = 1;
      mockRepository.findOne.mockResolvedValue(product);

      // Act
      const result = await service.checkProductAvailability(product.id!, quantity);

      // Assert
      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: product.id } });
    });

    it('should return false when requested quantity exceeds stock', async () => {
      // Arrange
      const product = catalogProductFactory.build({ stock: 5 });
      const quantity = 10;
      mockRepository.findOne.mockResolvedValue(product);

      // Act
      const result = await service.checkProductAvailability(product.id!, quantity);

      // Assert
      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: product.id } });
    });

    it('should return false when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const quantity = 1;
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.checkProductAvailability(productId, quantity)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
    });
  });

  describe('updateStock', () => {
    it('should update product stock successfully', async () => {
      // Arrange
      const product = catalogProductFactory.build({ stock: 10 });
      const newStock = 15;
      const updatedProduct = catalogProductFactory.build({ ...product, stock: newStock });
      
      mockRepository.findOne.mockResolvedValue(product);
      mockRepository.save.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.updateStock(product.id!, newStock);

      // Assert
      expect(result.stock).toBe(newStock);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: product.id } });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: newStock })
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const newStock = 15;
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateStock(productId, newStock)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});