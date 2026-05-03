import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';

// Infrastructure
import { PrismaModule } from './prisma/prisma.module';

// Common
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Feature Modules
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CustomersModule } from './customers/customers.module';
import { InventoryModule } from './inventory/inventory.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { ManifestsModule } from './manifests/manifests.module';
import { TariffsModule } from './tariffs/tariffs.module';
import { BillingModule } from './billing/billing.module';
import { AccountingModule } from './accounting/accounting.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    }]),

    // Database
    PrismaModule,

    // Feature Modules
    HealthModule,
    AuthModule,
    BranchesModule,
    EmployeesModule,
    AttendanceModule,
    CustomersModule,
    InventoryModule,
    ShipmentsModule,
    ManifestsModule,
    TariffsModule,
    BillingModule,
    AccountingModule,
    AuditModule,
    NotificationsModule,
  ],
  providers: [
    // Global JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Roles Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global Rate Limit Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global Response Transform
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global Audit Logger
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
