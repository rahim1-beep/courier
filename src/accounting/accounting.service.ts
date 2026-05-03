import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginationArgs } from '../common/dto';
import { generateSequentialNumber } from '../common/utils';
import {
  LedgerQueryDto,
  CreatePaymentDto,
  CreateCreditNoteDto,
  VoidLedgerEntryDto,
  ProfitLossQueryDto,
  SalesSummaryQueryDto,
  CustomerBalanceQueryDto,
  OutstandingInvoicesQueryDto,
} from './dto';

@Injectable()
export class AccountingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ────────────────────────────────────────────────────────
  // 1. GET /accounting/ledger
  // ────────────────────────────────────────────────────────
  async getLedger(query: LedgerQueryDto) {
    const where: Prisma.LedgerEntryWhereInput = {};
    if (query.customerId) where.customerId = query.customerId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.referenceType) where.referenceType = query.referenceType;
    if (!query.isVoid) where.isVoid = false;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) (where.createdAt as Record<string, Date>).gte = new Date(query.startDate);
      if (query.endDate) (where.createdAt as Record<string, Date>).lte = new Date(query.endDate);
    }

    const { skip, take } = buildPaginationArgs(query);
    const [data, total, aggregates] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.ledgerEntry.count({ where }),
      this.prisma.ledgerEntry.aggregate({
        where,
        _sum: { debit: true, credit: true },
      }),
    ]);

    const totalDebit = Number(aggregates._sum.debit || 0);
    const totalCredit = Number(aggregates._sum.credit || 0);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        netBalance: (totalDebit - totalCredit).toFixed(2),
      },
    };
  }

  // ────────────────────────────────────────────────────────
  // 2. GET /accounting/customer-balance/:customerId
  // ────────────────────────────────────────────────────────
  async getCustomerBalance(customerId: string, query: CustomerBalanceQueryDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const asOf = query.asOf ? new Date(query.asOf) : new Date();
    const dateFilter = { createdAt: { lte: asOf } };

    const [invoiceAgg, paymentAgg, creditNoteAgg] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { customerId, deletedAt: null, status: { not: 'VOID' }, ...dateFilter },
        _sum: { totalAmount: true },
      }),
      this.prisma.payment.aggregate({
        where: { customerId, ...dateFilter },
        _sum: { amount: true },
      }),
      this.prisma.creditNote.aggregate({
        where: { customerId, ...dateFilter },
        _sum: { amount: true },
      }),
    ]);

    const totalInvoiced = Number(invoiceAgg._sum.totalAmount || 0);
    const totalPaid = Number(paymentAgg._sum.amount || 0);
    const totalCreditNotes = Number(creditNoteAgg._sum.amount || 0);
    const outstandingBalance = totalInvoiced - totalPaid - totalCreditNotes;

    // Calculate overdue
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        customerId,
        deletedAt: null,
        status: { in: ['ISSUED', 'PARTIALLY_PAID'] },
        dueDate: { lt: new Date() },
      },
    });
    const overdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount) - Number(inv.amountPaid),
      0,
    );

    // Aging breakdown
    const now = new Date();
    const aging = { current: 0, overdue1to30: 0, overdue31to60: 0, overdue61to90: 0, overdue90plus: 0 };
    const openInvoices = await this.prisma.invoice.findMany({
      where: {
        customerId,
        deletedAt: null,
        status: { in: ['ISSUED', 'PARTIALLY_PAID'] },
      },
    });

    for (const inv of openInvoices) {
      const balance = Number(inv.totalAmount) - Number(inv.amountPaid);
      const daysPastDue = Math.floor(
        (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysPastDue <= 0) aging.current += balance;
      else if (daysPastDue <= 30) aging.overdue1to30 += balance;
      else if (daysPastDue <= 60) aging.overdue31to60 += balance;
      else if (daysPastDue <= 90) aging.overdue61to90 += balance;
      else aging.overdue90plus += balance;
    }

    // Recent transactions
    const recentTransactions = await this.prisma.ledgerEntry.findMany({
      where: { customerId, isVoid: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        createdAt: true,
        description: true,
        debit: true,
        credit: true,
        runningBalance: true,
      },
    });

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        customPricing: customer.customPricing,
      },
      summary: {
        totalInvoiced: totalInvoiced.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        totalCreditNotes: totalCreditNotes.toFixed(2),
        outstandingBalance: outstandingBalance.toFixed(2),
        overdueAmount: overdueAmount.toFixed(2),
        asOf: asOf.toISOString().split('T')[0],
      },
      agingBreakdown: {
        current: aging.current.toFixed(2),
        overdue1to30: aging.overdue1to30.toFixed(2),
        overdue31to60: aging.overdue31to60.toFixed(2),
        overdue61to90: aging.overdue61to90.toFixed(2),
        overdue90plus: aging.overdue90plus.toFixed(2),
      },
      recentTransactions: recentTransactions.map((t) => ({
        date: t.createdAt,
        description: t.description,
        debit: Number(t.debit).toFixed(2),
        credit: Number(t.credit).toFixed(2),
        balance: Number(t.runningBalance).toFixed(2),
      })),
    };
  }

  // ────────────────────────────────────────────────────────
  // 3. GET /accounting/profit-loss
  // ────────────────────────────────────────────────────────
  async getProfitLoss(query: ProfitLossQueryDto) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);
    const branchFilter = query.branchId ? { branchId: query.branchId } : {};
    const serviceFilter = query.serviceId ? { serviceId: query.serviceId } : {};

    const [revenueAgg, costAgg, collectedAgg] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          deletedAt: null,
          status: { not: 'VOID' },
          createdAt: { gte: start, lte: end },
          shipment: { ...branchFilter, ...serviceFilter },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.shipment.aggregate({
        where: {
          deletedAt: null,
          createdAt: { gte: start, lte: end },
          ...branchFilter,
          ...serviceFilter,
        },
        _sum: { cost: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          ...(query.branchId ? { branchId: query.branchId } : {}),
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);
    const totalCost = Number(costAgg._sum.cost || 0);
    const totalCollected = Number(collectedAgg._sum.amount || 0);
    const grossProfit = totalRevenue - totalCost;

    // Breakdown by service
    const byService = await this.prisma.shipment.groupBy({
      by: ['serviceId'],
      where: {
        deletedAt: null,
        createdAt: { gte: start, lte: end },
        ...branchFilter,
      },
      _sum: { cost: true },
      _count: { id: true },
    });

    const serviceDetails = await Promise.all(
      byService.map(async (s) => {
        const service = await this.prisma.service.findUnique({
          where: { id: s.serviceId },
        });
        const serviceRevenue = await this.prisma.invoice.aggregate({
          where: {
            deletedAt: null,
            status: { not: 'VOID' },
            createdAt: { gte: start, lte: end },
            shipment: { serviceId: s.serviceId },
          },
          _sum: { totalAmount: true },
        });
        const rev = Number(serviceRevenue._sum.totalAmount || 0);
        return {
          service: service?.name || s.serviceId,
          revenue: rev.toFixed(2),
          shipmentCount: s._count.id,
          avgRevenuePerShipment: s._count.id > 0 ? (rev / s._count.id).toFixed(2) : '0.00',
        };
      }),
    );

    // Breakdown by branch
    const byBranch = await this.prisma.shipment.groupBy({
      by: ['branchId'],
      where: {
        deletedAt: null,
        createdAt: { gte: start, lte: end },
        ...serviceFilter,
      },
      _count: { id: true },
    });

    const branchDetails = await Promise.all(
      byBranch.map(async (b) => {
        const branch = await this.prisma.branch.findUnique({
          where: { id: b.branchId },
        });
        const branchRevenue = await this.prisma.invoice.aggregate({
          where: {
            deletedAt: null,
            status: { not: 'VOID' },
            createdAt: { gte: start, lte: end },
            shipment: { branchId: b.branchId },
          },
          _sum: { totalAmount: true },
        });
        return {
          branch: branch?.name || b.branchId,
          revenue: Number(branchRevenue._sum.totalAmount || 0).toFixed(2),
          shipmentCount: b._count.id,
        };
      }),
    );

    return {
      period: { startDate: query.startDate, endDate: query.endDate },
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalShipmentCost: totalCost.toFixed(2),
        grossProfit: grossProfit.toFixed(2),
        grossMarginPercent: totalRevenue > 0
          ? ((grossProfit / totalRevenue) * 100).toFixed(2)
          : '0.00',
        totalInvoiced: totalRevenue.toFixed(2),
        totalCollected: totalCollected.toFixed(2),
        uncollectedRevenue: (totalRevenue - totalCollected).toFixed(2),
      },
      byService: serviceDetails,
      byBranch: branchDetails,
    };
  }

  // ────────────────────────────────────────────────────────
  // 4. GET /accounting/sales-summary
  // ────────────────────────────────────────────────────────
  async getSalesSummary(query: SalesSummaryQueryDto) {
    const start = new Date(query.startDate);
    const end = new Date(query.endDate);
    const branchFilter = query.branchId ? { branchId: query.branchId } : {};

    const [
      totalShipments,
      revenueAgg,
      invoiceCount,
      paymentAgg,
      creditNoteAgg,
      newCustomers,
    ] = await Promise.all([
      this.prisma.shipment.count({
        where: { deletedAt: null, createdAt: { gte: start, lte: end }, ...branchFilter },
      }),
      this.prisma.invoice.aggregate({
        where: {
          deletedAt: null, status: { not: 'VOID' },
          createdAt: { gte: start, lte: end },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.count({
        where: {
          deletedAt: null, createdAt: { gte: start, lte: end },
        },
      }),
      this.prisma.payment.aggregate({
        where: { createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      this.prisma.creditNote.aggregate({
        where: { createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      this.prisma.customer.count({
        where: { deletedAt: null, createdAt: { gte: start, lte: end } },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);
    const totalPayments = Number(paymentAgg._sum.amount || 0);
    const totalCreditNotes = Number(creditNoteAgg._sum.amount || 0);

    // Top customers
    const topCustomers = await this.prisma.invoice.groupBy({
      by: ['customerId'],
      where: {
        deletedAt: null, status: { not: 'VOID' },
        createdAt: { gte: start, lte: end },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 5,
    });

    const topCustomerDetails = await Promise.all(
      topCustomers.map(async (tc) => {
        const customer = await this.prisma.customer.findUnique({
          where: { id: tc.customerId },
        });
        return {
          customerId: tc.customerId,
          name: customer?.name || 'Unknown',
          totalRevenue: Number(tc._sum.totalAmount || 0).toFixed(2),
          shipmentCount: tc._count.id,
        };
      }),
    );

    // Top destinations
    const topDestinations = await this.prisma.shipmentDetail.groupBy({
      by: ['receiverCountry'],
      where: {
        shipment: {
          deletedAt: null,
          createdAt: { gte: start, lte: end },
        },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Payment method breakdown
    const paymentMethods = await this.prisma.payment.groupBy({
      by: ['method'],
      where: { createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: { id: true },
    });

    return {
      period: { startDate: query.startDate, endDate: query.endDate },
      kpis: {
        totalShipments,
        totalRevenue: totalRevenue.toFixed(2),
        totalInvoicesGenerated: invoiceCount,
        totalPaymentsReceived: totalPayments.toFixed(2),
        totalOutstanding: (totalRevenue - totalPayments - totalCreditNotes).toFixed(2),
        totalCreditNotesIssued: totalCreditNotes.toFixed(2),
        avgRevenuePerShipment: totalShipments > 0
          ? (totalRevenue / totalShipments).toFixed(2)
          : '0.00',
        newCustomers,
      },
      topCustomers: topCustomerDetails,
      topDestinations: topDestinations.map((d) => ({
        country: d.receiverCountry,
        shipmentCount: d._count.id,
      })),
      paymentMethodBreakdown: paymentMethods.map((pm) => ({
        method: pm.method,
        amount: Number(pm._sum.amount || 0).toFixed(2),
        count: pm._count.id,
      })),
    };
  }

  // ────────────────────────────────────────────────────────
  // 5. POST /accounting/payments
  // ────────────────────────────────────────────────────────
  async recordPayment(dto: CreatePaymentDto, employeeId: string, branchId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    let invoice = null;
    if (dto.invoiceId) {
      invoice = await this.prisma.invoice.findFirst({
        where: { id: dto.invoiceId, customerId: dto.customerId, deletedAt: null },
      });
      if (!invoice) throw new NotFoundException('Invoice not found for this customer');

      const outstanding = Number(invoice.totalAmount) - Number(invoice.amountPaid);
      if (dto.amount > outstanding) {
        throw new BadRequestException(
          `Payment amount (${dto.amount}) exceeds outstanding (${outstanding.toFixed(2)})`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Generate payment number
      const paymentCount = await tx.payment.count();
      const paymentNumber = generateSequentialNumber('PAY', paymentCount + 1);

      // 1. Create payment
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          customerId: dto.customerId,
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          method: dto.method,
          referenceNumber: dto.referenceNumber,
          receivedById: employeeId,
          branchId,
          receivedAt: new Date(dto.receivedAt),
          note: dto.note,
        },
      });

      // 2. Create ledger entry (credit = money received)
      const ledgerCount = await tx.ledgerEntry.count();
      const entryNumber = generateSequentialNumber('LED', ledgerCount + 1);

      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { customerId: dto.customerId, isVoid: false },
        orderBy: { createdAt: 'desc' },
      });
      const prevBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;
      const newBalance = prevBalance - dto.amount; // Credit reduces balance

      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          entryNumber,
          referenceType: 'PAYMENT',
          referenceId: payment.id,
          customerId: dto.customerId,
          branchId,
          description: `Payment ${paymentNumber} received`,
          debit: 0,
          credit: dto.amount,
          runningBalance: newBalance,
          createdById: employeeId,
          note: dto.note,
        },
      });

      // 3. Update invoice status if linked
      let updatedInvoice = null;
      if (invoice && dto.invoiceId) {
        const newAmountPaid = Number(invoice.amountPaid) + dto.amount;
        const invoiceTotal = Number(invoice.totalAmount);
        const newStatus = newAmountPaid >= invoiceTotal ? 'PAID' : 'PARTIALLY_PAID';

        updatedInvoice = await tx.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            amountPaid: newAmountPaid,
            status: newStatus,
          },
        });
      }

      return { payment, ledgerEntry, updatedInvoice };
    });
  }

  // ────────────────────────────────────────────────────────
  // 6. POST /accounting/credit-notes
  // ────────────────────────────────────────────────────────
  async issueCreditNote(dto: CreateCreditNoteDto, employeeId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, customerId: dto.customerId, deletedAt: null },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (dto.amount > Number(invoice.totalAmount)) {
      throw new BadRequestException('Credit note amount exceeds invoice total');
    }

    return this.prisma.$transaction(async (tx) => {
      const cnCount = await tx.creditNote.count();
      const creditNoteNumber = generateSequentialNumber('CN', cnCount + 1);

      const creditNote = await tx.creditNote.create({
        data: {
          creditNoteNumber,
          customerId: dto.customerId,
          invoiceId: dto.invoiceId,
          reason: dto.reason,
          amount: dto.amount,
          issuedById: employeeId,
        },
      });

      // Ledger entry (credit)
      const ledgerCount = await tx.ledgerEntry.count();
      const entryNumber = generateSequentialNumber('LED', ledgerCount + 1);

      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { customerId: dto.customerId, isVoid: false },
        orderBy: { createdAt: 'desc' },
      });
      const prevBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;

      await tx.ledgerEntry.create({
        data: {
          entryNumber,
          referenceType: 'CREDIT_NOTE',
          referenceId: creditNote.id,
          customerId: dto.customerId,
          branchId: (await tx.employee.findUnique({ where: { id: employeeId } }))!.branchId,
          description: `Credit note ${creditNoteNumber}: ${dto.reason}`,
          debit: 0,
          credit: dto.amount,
          runningBalance: prevBalance - dto.amount,
          createdById: employeeId,
        },
      });

      return creditNote;
    });
  }

  // ────────────────────────────────────────────────────────
  // 7. POST /accounting/ledger/:id/void
  // ────────────────────────────────────────────────────────
  async voidLedgerEntry(id: string, dto: VoidLedgerEntryDto, employeeId: string) {
    const entry = await this.prisma.ledgerEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Ledger entry not found');
    if (entry.isVoid) throw new BadRequestException('Entry is already voided');

    // Check void window
    const voidWindowDays = this.config.get<number>('VOID_WINDOW_DAYS', 90);
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceCreation > voidWindowDays) {
      throw new ForbiddenException(
        `Cannot void entries older than ${voidWindowDays} days`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Mark original as void
      await tx.ledgerEntry.update({
        where: { id },
        data: {
          isVoid: true,
          voidedById: employeeId,
          voidedAt: new Date(),
          voidReason: dto.reason,
        },
      });

      // Create reversing entry
      const ledgerCount = await tx.ledgerEntry.count();
      const entryNumber = generateSequentialNumber('LED', ledgerCount + 1);

      const lastEntry = await tx.ledgerEntry.findFirst({
        where: { customerId: entry.customerId, isVoid: false },
        orderBy: { createdAt: 'desc' },
      });
      const prevBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;
      const reversal = Number(entry.debit) - Number(entry.credit);
      const newBalance = prevBalance - reversal;

      const reversingEntry = await tx.ledgerEntry.create({
        data: {
          entryNumber,
          referenceType: entry.referenceType,
          referenceId: entry.referenceId,
          customerId: entry.customerId,
          branchId: entry.branchId,
          description: `VOID REVERSAL: ${entry.description}`,
          debit: entry.credit, // Swap
          credit: entry.debit, // Swap
          runningBalance: newBalance,
          createdById: employeeId,
          note: `Void of ${entry.entryNumber}: ${dto.reason}`,
        },
      });

      return { voidedEntry: entry.entryNumber, reversingEntry };
    });
  }

  // ────────────────────────────────────────────────────────
  // 8. GET /accounting/outstanding-invoices
  // ────────────────────────────────────────────────────────
  async getOutstandingInvoices(query: OutstandingInvoicesQueryDto) {
    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      status: { in: ['ISSUED', 'PARTIALLY_PAID'] },
    };
    if (query.customerId) where.customerId = query.customerId;
    if (query.branchId) where.shipment = { branchId: query.branchId };
    if (query.overdueOnly) where.dueDate = { lt: new Date() };

    const { skip, take } = buildPaginationArgs(query);
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { dueDate: 'asc' },
        include: {
          customer: { select: { id: true, name: true, companyName: true } },
          shipment: { select: { trackingId: true, branchId: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const enriched = data
      .map((inv) => {
        const balanceDue = Number(inv.totalAmount) - Number(inv.amountPaid);
        if (query.minAmount && balanceDue < query.minAmount) return null;
        const daysOverdue = Math.max(
          0,
          Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        );
        return {
          invoiceNumber: inv.invoiceNumber,
          customer: inv.customer,
          totalAmount: Number(inv.totalAmount).toFixed(2),
          amountPaid: Number(inv.amountPaid).toFixed(2),
          balanceDue: balanceDue.toFixed(2),
          dueDate: inv.dueDate,
          daysOverdue,
          shipmentTrackingId: inv.shipment?.trackingId,
        };
      })
      .filter(Boolean);

    return {
      data: enriched,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
