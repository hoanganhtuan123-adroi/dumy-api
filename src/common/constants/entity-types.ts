export const ENTITY_TYPE = {
  USER: 'user',
  POST: 'post',
  PRODUCT: 'product',
} as const;

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];
