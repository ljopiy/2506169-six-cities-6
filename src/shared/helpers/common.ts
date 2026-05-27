import { ClassConstructor, plainToInstance } from 'class-transformer';

export function generateRandomValue(min: number, max: number, numAfterDigit = 0): number {
  return +((Math.random() * (max - min)) + min).toFixed(numAfterDigit);
}

export function getRandomItems<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const count = Math.floor(Math.random() * shuffled.length) + 1;
  return shuffled.slice(0, count);
}

export function getRandomItem<T>(items: T[]): T {
  return items[generateRandomValue(0, items.length - 1)];
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

export function fillDTO<T, V>(someDto: ClassConstructor<T>, plainObject: V) {
  return plainToInstance(someDto, plainObject, { excludeExtraneousValues: true });
}

export function createErrorObject(message: string) {
  return {
    error: message,
  };
}

export function getFullServerPath(host: string, port: number) {
  return `http://${host}:${port}`;
}

export function extractRefId(entity: unknown): string {
  if (typeof entity === 'string') {
    return entity;
  }

  if (typeof entity === 'object' && entity !== null && hasObjectId(entity)) {
    return String(entity._id);
  }

  return String(entity);
}

function hasObjectId(entity: object): entity is { _id: unknown } {
  return '_id' in entity;
}
