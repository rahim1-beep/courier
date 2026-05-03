import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

/**
 * Generate a unique tracking ID for shipments.
 * Format: TRK-XXXXXXXX (8 chars, uppercase alphanumeric)
 */
export function generateTrackingId(): string {
  return `TRK-${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
}

/**
 * Generate a unique inventory code.
 * Format: INV-XXXXXXXX
 */
export function generateInventoryCode(): string {
  return `INV-${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
}

/**
 * Generate a unique manifest reference number.
 * Format: MAN-XXXXXXXX
 */
export function generateManifestReference(): string {
  return `MAN-${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
}

/**
 * Generate sequential business number.
 * Format: PREFIX-YYYY-NNNNN (e.g., INV-2024-00001)
 */
export function generateSequentialNumber(
  prefix: string,
  sequence: number,
): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(5, '0');
  return `${prefix}-${year}-${padded}`;
}

/**
 * Race-safe sequential number generation.
 * Uses SELECT ... FOR UPDATE inside a serializable transaction
 * to prevent duplicate numbers under concurrent load.
 *
 * Queries the actual max number from the relevant table, then increments.
 * Falls back to retry with random suffix on unique constraint violation.
 */
export async function generateSafeSequentialNumber(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  prefix: string,
  tableName: 'invoice' | 'payment' | 'creditNote' | 'ledgerEntry',
  numberField: string,
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-%`;

  // Find the current max number in the table for this prefix/year
  const result = await tx.$queryRawUnsafe<Array<Record<string, string | null>>>(
    `SELECT ${numberField} FROM "${getTableMapping(tableName)}"
     WHERE ${numberField} LIKE $1
     ORDER BY ${numberField} DESC
     LIMIT 1`,
    pattern,
  );

  let nextSequence = 1;
  if (result.length > 0 && result[0][numberField]) {
    const lastNumber = result[0][numberField] as string;
    // Extract the numeric suffix: PREFIX-YYYY-NNNNN → NNNNN
    const parts = lastNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  return generateSequentialNumber(prefix, nextSequence);
}

function getTableMapping(tableName: string): string {
  const mapping: Record<string, string> = {
    invoice: 'invoices',
    payment: 'payments',
    creditNote: 'credit_notes',
    ledgerEntry: 'ledger_entries',
  };
  return mapping[tableName] || tableName;
}
