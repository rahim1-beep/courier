import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Decimal } from '@prisma/client/runtime/library';

export interface TransformedResponse<T> {
  statusCode: number;
  data: T;
  timestamp: string;
}

/**
 * Recursively convert Prisma Decimal instances to string representations.
 * Without this, Decimal objects serialize as `{ d: [...], s: 0, e: 0 }` in JSON.
 */
function serializeDecimals(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Decimal) return obj.toFixed(2);
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeDecimals);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeDecimals(value);
    }
    return result;
  }
  return obj;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data: serializeDecimals(data) as T,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
