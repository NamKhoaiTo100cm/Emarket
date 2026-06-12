// src/common/interceptors/response.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map((data) => ({
                statusCode: response.statusCode,
                message: data?.message ?? 'Thành công',
                data: data?.data ?? data,
                // pagination: data?.pagination ?? {},
                ...(data?.pagination && { pagination: data?.pagination })

            })),

        );
    }
}