/**
 * Interface for JMAP entities. To add an entity, augment
 * this interface. For example:
 *
 * ```ts
 * declare module 'jmap-rfc-types' {
 *   interface Entities {
 *     MyEntity: true;
 *   }
 * }
 */
export interface Entities {}

export type Entity = keyof Entities;
