export enum OrderStatus {
  PENDING = 'PENDING', // Borrador, editable
  PAID = 'PAID', // Pagado/Confirmado, bloqueado (genera factura)
  INVOICED = 'INVOICED', // Entregado sin cobrara
  CANCELLED = 'CANCELLED', // Anulado
  VOIDED = 'VOIDED', // Factura anulada
}
