import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto, PaginatedResponseDto, buildPaginationArgs,
} from '../common/dto';
import { generateSequentialNumber } from '../common/utils';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findAll(query: PaginationQueryDto, customerId?: string, status?: string) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
          shipment: { select: { trackingId: true, status: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        shipment: {
          include: {
            detail: true,
            service: { select: { name: true } },
          },
        },
        items: true,
        payments: true,
        creditNotes: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  /**
   * Generate invoice from shipment — fully transactional.
   * Creates invoice, invoice items, and initial ledger entry.
   */
  async generateFromShipment(shipmentId: string, employeeId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, deletedAt: null },
      include: { service: true, detail: true, invoice: true },
    });

    if (!shipment) throw new NotFoundException('Shipment not found');
    if (shipment.invoice) {
      throw new BadRequestException('Invoice already exists for this shipment');
    }

    const paymentTermDays = this.config.get<number>(
      'DEFAULT_PAYMENT_TERM_DAYS', 30,
    );
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTermDays);

    // Get next invoice number
    const count = await this.prisma.invoice.count();
    const invoiceNumber = generateSequentialNumber('INV', count + 1);

    const subtotal = Number(shipment.cost);
    const taxAmount = 0; // Tax calculation can be extended
    const totalAmount = subtotal + taxAmount;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          shipmentId: shipment.id,
          customerId: shipment.customerId,
          subtotal,
          taxAmount,
          totalAmount,
          dueDate,
          status: 'ISSUED',
          createdById: employeeId,
          items: {
            create: [
              {
                description: `Shipment ${shipment.trackingId} — ${shipment.service.name}`,
                amount: Number(shipment.cost),
              },
            ],
          },
        },
        include: { items: true },
      });

      // 2. Create ledger entry (debit = customer owes)
      const ledgerCount = await tx.ledgerEntry.count();
      const entryNumber = generateSequentialNumber('LED', ledgerCount + 1);

      // Get current running balance
      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { customerId: shipment.customerId, isVoid: false },
        orderBy: { createdAt: 'desc' },
      });
      const prevBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;
      const newBalance = prevBalance + totalAmount;

      await tx.ledgerEntry.create({
        data: {
          entryNumber,
          referenceType: 'INVOICE',
          referenceId: invoice.id,
          customerId: shipment.customerId,
          branchId: shipment.branchId,
          description: `Invoice ${invoiceNumber} for shipment ${shipment.trackingId}`,
          debit: totalAmount,
          credit: 0,
          runningBalance: newBalance,
          createdById: employeeId,
        },
      });

      return invoice;
    });
  }

  async getPdfData(id: string) {
    const invoice = await this.findOne(id);
    return {
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        createdAt: invoice.createdAt,
        dueDate: invoice.dueDate,
        status: invoice.status,
      },
      customer: invoice.customer,
      shipment: {
        trackingId: invoice.shipment.trackingId,
        service: invoice.shipment.service.name,
        sender: invoice.shipment.detail
          ? {
              name: invoice.shipment.detail.senderName,
              address: invoice.shipment.detail.senderAddress,
              country: invoice.shipment.detail.senderCountry,
            }
          : null,
        receiver: invoice.shipment.detail
          ? {
              name: invoice.shipment.detail.receiverName,
              address: invoice.shipment.detail.receiverAddress,
              country: invoice.shipment.detail.receiverCountry,
            }
          : null,
      },
      items: invoice.items,
      totals: {
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        amountPaid: invoice.amountPaid,
        balanceDue: Number(invoice.totalAmount) - Number(invoice.amountPaid),
      },
    };
  }

  async findByCustomer(customerId: string, query: PaginationQueryDto) {
    return this.findAll(query, customerId);
  }
}
