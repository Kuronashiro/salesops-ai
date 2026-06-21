import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    const endpoint = request.url;
    const method = request.method;

    return next.handle().pipe(
      tap(() => {
        this.auditService.log(
  user?.id || user?.userId || 0,
  `${method}_${endpoint}`,
  endpoint,
  method,
  `${method} request to ${endpoint}`,
);
      }),
    );
  }
}