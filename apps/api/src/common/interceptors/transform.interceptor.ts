import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseShape<T> {
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseShape<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseShape<T>> {
    return next.handle().pipe(
      map((value) => {
        // If the response already has a `data` key, pass through as-is
        if (value && typeof value === 'object' && 'data' in value) {
          return value;
        }
        return { data: value };
      }),
    );
  }
}
