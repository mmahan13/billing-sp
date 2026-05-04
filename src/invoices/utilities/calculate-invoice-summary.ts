import { Invoice } from '../entities/invoice.entity';

export interface IInvoiceItem {
  quantity: number;
  priceAtTime: number;
  ivaAtTime: number;
  surchargeAtTime: number;
}

export interface TaxBreakdown {
  base: number;
  iva: number;
  re: number;
  taxRate: number;
  reRate: number;
}

export interface InvoiceSummary {
  baseImponibleTotal: number;
  ivaTotal: number;
  reTotal: number;
  totalFinal: number;
  taxGroups: TaxBreakdown[];
}

export type InvoiceWithSummary = Invoice & { summary: InvoiceSummary };

export function calculateInvoiceSummary(items: IInvoiceItem[]): InvoiceSummary {
  let baseImponibleTotal = 0;
  let ivaTotal = 0;
  let reTotal = 0;

  // Agruparemos los impuestos por tipo (ej: agrupar todo lo que sea 10%+1.4%)
  const groups: Record<string, TaxBreakdown> = {};

  items.forEach((item) => {
    const qty = Number(item.quantity);
    const price = Number(item.priceAtTime);
    const ivaRate = Number(item.ivaAtTime);
    const reRate = Number(item.surchargeAtTime || 0);

    // Cálculos de la línea
    const baseLinea = price * qty;
    const cuotaIva = baseLinea * (ivaRate / 100);
    const cuotaRe = baseLinea * (reRate / 100);

    // Sumatorios generales
    baseImponibleTotal += baseLinea;
    ivaTotal += cuotaIva;
    reTotal += cuotaRe;

    // Agrupación para el pie de factura
    const key = `${ivaRate}-${reRate}`;
    if (!groups[key]) {
      groups[key] = {
        base: 0,
        iva: 0,
        re: 0,
        taxRate: ivaRate,
        reRate: reRate,
      };
    }

    groups[key].base += baseLinea;
    groups[key].iva += cuotaIva;
    groups[key].re += cuotaRe;
  });

  // Devolvemos todo redondeado a 2 decimales para evitar problemas de céntimos
  return {
    baseImponibleTotal: Number(baseImponibleTotal.toFixed(2)),
    ivaTotal: Number(ivaTotal.toFixed(2)),
    reTotal: Number(reTotal.toFixed(2)),
    totalFinal: Number((baseImponibleTotal + ivaTotal + reTotal).toFixed(2)),
    taxGroups: Object.values(groups).map((g) => ({
      ...g,
      base: Number(g.base.toFixed(2)),
      iva: Number(g.iva.toFixed(2)),
      re: Number(g.re.toFixed(2)),
    })),
  };
}
