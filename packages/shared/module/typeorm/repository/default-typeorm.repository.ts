import { DefaultEntity } from '../entity/default.entity';
import {
  EntityManager,
  EntityTarget,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

export abstract class DefaultTypeOrmRepository<T extends DefaultEntity<T>> {
  private repository: Repository<T>;
  protected transactionalEntityManager: EntityManager;
  constructor(readonly entity: EntityTarget<T>, readonly manager: EntityManager) {
    /**
     * Note that we don't extend the Repository class from TypeORM, but we use it as a property.
     * This way we can control the access to the repository methods and avoid exposing them to the outside world.
     */
    this.repository = manager.getRepository(entity);
    this.transactionalEntityManager = manager;
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  async findOneById(id: string, relations?: string[]): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async find(options: FindOneOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  async existsBy(properties: FindOptionsWhere<T>): Promise<boolean> {
    return this.repository.exists({
      where: properties,
    });
  }

  async update(id: string, partialEntity: Record<string, unknown>): Promise<void> {
    await this.repository.update(id, partialEntity as any);
  }

  async remove(entity: T | T[]): Promise<T | T[]> {
    return await this.repository.remove(entity as any);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.update(id, { status } as any);
  }
}
