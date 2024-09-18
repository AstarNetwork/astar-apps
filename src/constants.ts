// export { TOKEN_API_URL } from '@astar-network/astar-sdk-core';

// For local test purposes
export const TOKEN_API_URL = 'http://127.0.0.1:5001/astar-token-api/us-central1/app/api';

export enum HttpCodes {
  NotFound = 404,
}

export const PERIOD1_START_BLOCKS = new Map<string, number>([
  ['astar', 5514935],
  ['shiden', 5876079],
  ['shibuya', 5335616],
]);
