import { GameState } from './game.types';
import { FoodId } from './game.types';

declare global {
  interface Window {
    resetGame?: () => void;
    getGameState?: () => GameState;
    addResource?: (resourceId: string, amount: number) => void;
    addFood?: (foodId: FoodId, amount: number) => void;
  }
}

export {};
