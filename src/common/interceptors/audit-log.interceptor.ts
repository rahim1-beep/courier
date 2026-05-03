import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { extractClientIp } from '../utils/ip.util';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit state-changing operations
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const userId = request.user?.userId || null;
    const ip = extractClientIp(request);
    const handler = context.getHandler().name;
    const controller = context.getClass().name;
    const entity = controller.replace('Controller', '');

    return next.handle().pipe(
      tap({
        next: (data) => {
          const entityId =
            data?.id || request.params?.id || null;

          this.prisma.auditLog
            .create({
              data: {
                userId,
                action: `${method} ${handler}`,
                entity,
                entityId: entityId ? String(entityId) : null,
                newValue: method === 'DELETE' ? null : (request.body || null),
                ipAddress: ip,
              },
            })
            .catch((err: Error) => {
              this.logger.error(`Failed to write audit log: ${err.message}`);
            });
        },
      }),
    );
  }
}
