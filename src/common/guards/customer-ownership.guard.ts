import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Ensures CUSTOMER users can only access their own resources.
 * Admins and employees bypass this check.
 *
 * Looks for a resource ID in params (`:id` or `:customerId`)
 * and verifies the logged-in customer owns that resource.
 */
@Injectable()
export class CustomerOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admins and employees bypass ownership checks
    if (!user || user.role !== Role.CUSTOMER) {
      return true;
    }

    // Find the customer record for this user
    const customer = await this.prisma.customer.findFirst({
      where: { userId: user.userId, deletedAt: null },
    });

    if (!customer) {
      throw new ForbiddenException('Customer profile not found');
    }

    // Check various param patterns
    const paramId = request.params?.id;
    const paramCustomerId = request.params?.customerId;

    // If :customerId param exists, verify it matches
    if (paramCustomerId && paramCustomerId !== customer.id) {
      throw new ForbiddenException('Access denied: not your resource');
    }

    // If :id param exists, check based on the controller context
    if (paramId) {
      const path = request.route?.path || request.url || '';

      // /customers/:id — the ID IS the customer ID
      if (path.includes('/customers/')) {
        if (paramId !== customer.id) {
          throw new ForbiddenException('Access denied: not your customer profile');
        }
      }

      // /invoices/:id — verify the invoice belongs to this customer
      if (path.includes('/invoices/')) {
        const invoice = await this.prisma.invoice.findFirst({
          where: { id: paramId, deletedAt: null },
        });
        if (invoice && invoice.customerId !== customer.id) {
          throw new ForbiddenException('Access denied: not your invoice');
        }
      }

      // /shipments/:id — verify the shipment belongs to this customer
      if (path.includes('/shipments/')) {
        const shipment = await this.prisma.shipment.findFirst({
          where: { id: paramId, deletedAt: null },
        });
        if (shipment && shipment.customerId !== customer.id) {
          throw new ForbiddenException('Access denied: not your shipment');
        }
      }

      // /accounting/customer-balance/:customerId
      if (path.includes('/accounting/customer-balance')) {
        if (paramId !== customer.id) {
          throw new ForbiddenException('Access denied: not your balance');
        }
      }
    }

    // Attach customer to request for downstream use
    request.customerProfile = customer;
    return true;
  }
}
