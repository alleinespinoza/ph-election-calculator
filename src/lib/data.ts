/**
 * Utility functions for data management
 */

import { POSITIONS } from './calculator';
import { ElectionPosition } from './types';

/**
 * Get all available positions
 */
export function getAllPositions() {
  return Object.values(POSITIONS);
}

/**
 * Get positions by category
 */
export function getPositionsByCategory(category: 'barangay' | 'sk') {
  return Object.values(POSITIONS).filter((pos) => pos.category === category);
}

/**
 * Get position info by ID
 */
export function getPositionInfo(positionId: ElectionPosition) {
  return POSITIONS[positionId];
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage
 */
export function formatPercentage(num: number, decimals: number = 2): string {
  return `${num.toFixed(decimals)}%`;
}
