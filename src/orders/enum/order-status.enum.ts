export enum OrderStatus {
  PENDING = 'PENDING', // Borrador, editable
  PAID = 'PAID', // Pagado/Confirmado, bloqueado (genera factura)
  CANCELLED = 'CANCELLED', // Anulado
}
