import { Module } from '@nestjs/common';
import {
  INVENTORY_LOCATION_REPOSITORY,
  INVENTORY_MOVE_REPOSITORY,
} from './domain/inventory.tokens';
import { DrizzleLocationRepository } from './infrastructure/persistence/drizzle-location.repository';
import { DrizzleMoveRepository } from './infrastructure/persistence/drizzle-move.repository';
import { CreateLocationUseCase } from './application/use-cases/create-location.use-case';
import { ListLocationsUseCase } from './application/use-cases/list-locations.use-case';
import { UpdateLocationUseCase } from './application/use-cases/update-location.use-case';
import { CreateMoveUseCase } from './application/use-cases/create-move.use-case';
import { ConfirmMoveUseCase } from './application/use-cases/confirm-move.use-case';
import { CompleteMoveUseCase } from './application/use-cases/complete-move.use-case';
import { ListMovesUseCase } from './application/use-cases/list-moves.use-case';
import { GetStockUseCase } from './application/use-cases/get-stock.use-case';
import { AdjustInventoryUseCase } from './application/use-cases/adjust-inventory.use-case';
import { LocationController } from './interfaces/http/location.controller';
import { MoveController } from './interfaces/http/move.controller';
import { StockController } from './interfaces/http/stock.controller';

@Module({
  controllers: [LocationController, MoveController, StockController],
  providers: [
    {
      provide: INVENTORY_LOCATION_REPOSITORY,
      useClass: DrizzleLocationRepository,
    },
    {
      provide: INVENTORY_MOVE_REPOSITORY,
      useClass: DrizzleMoveRepository,
    },
    CreateLocationUseCase,
    ListLocationsUseCase,
    UpdateLocationUseCase,
    CreateMoveUseCase,
    ConfirmMoveUseCase,
    CompleteMoveUseCase,
    ListMovesUseCase,
    GetStockUseCase,
    AdjustInventoryUseCase,
  ],
  exports: [
    INVENTORY_LOCATION_REPOSITORY,
    INVENTORY_MOVE_REPOSITORY,
    CreateLocationUseCase,
    ListLocationsUseCase,
    UpdateLocationUseCase,
    CreateMoveUseCase,
    ConfirmMoveUseCase,
    CompleteMoveUseCase,
    ListMovesUseCase,
    GetStockUseCase,
    AdjustInventoryUseCase,
  ],
})
export class InventoryModule {}
