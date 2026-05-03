import {
  Controller, Get, Post, Param, Body, Query, UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { AccountingService } from './accounting.service';
import {
  LedgerQueryDto, CreatePaymentDto, CreateCreditNoteDto,
  VoidLedgerEntryDto, ProfitLossQueryDto, SalesSummaryQueryDto,
  CustomerBalanceQueryDto, OutstandingInvoicesQueryDto,
} from './dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard, CustomerOwnershipGuard } from '../common/guards';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Accounting')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/v1/accounting')
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('ledger')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Full paginated ledger' })
  getLedger(@Query() query: LedgerQueryDto) {
    return this.accountingService.getLedger(query);
  }

  @Get('customer-balance/:customerId')
  @Roles(Role.SUPER_ADMIN, Role.CUSTOMER)
  @UseGuards(CustomerOwnershipGuard)
  @ApiOperation({ summary: 'Customer financial position with aging' })
  getCustomerBalance(
    @Param('customerId') customerId: string,
    @Query() query: CustomerBalanceQueryDto,
  ) {
    return this.accountingService.getCustomerBalance(customerId, query);
  }

  @Get('profit-loss')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Profit & Loss report' })
  getProfitLoss(@Query() query: ProfitLossQueryDto) {
    return this.accountingService.getProfitLoss(query);
  }

  @Get('sales-summary')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sales performance dashboard' })
  getSalesSummary(@Query() query: SalesSummaryQueryDto) {
    return this.accountingService.getSalesSummary(query);
  }

  @Post('payments')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Record payment (transactional)' })
  async recordPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser('userId') userId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new BadRequestException('Employee profile required');
    return this.accountingService.recordPayment(dto, employee.id, employee.branchId);
  }

  @Post('credit-notes')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Issue credit note (transactional)' })
  async issueCreditNote(
    @Body() dto: CreateCreditNoteDto,
    @CurrentUser('userId') userId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new BadRequestException('Employee profile required');
    return this.accountingService.issueCreditNote(dto, employee.id);
  }

  @Post('ledger/:id/void')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Void ledger entry with reversal' })
  async voidEntry(
    @Param('id') id: string,
    @Body() dto: VoidLedgerEntryDto,
    @CurrentUser('userId') userId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({ where: { userId } });
    if (!employee) throw new BadRequestException('Employee profile required');
    return this.accountingService.voidLedgerEntry(id, dto, employee.id);
  }

  @Get('outstanding-invoices')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Outstanding/overdue invoices' })
  getOutstandingInvoices(@Query() query: OutstandingInvoicesQueryDto) {
    return this.accountingService.getOutstandingInvoices(query);
  }
}
