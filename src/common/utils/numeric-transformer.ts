export class ColumnNumericTransformer {
  to(data: number): number {
    return data; // Lo que va hacia la base de datos se queda igual
  }
  from(data: string): number {
    return parseFloat(data); // Lo que viene de la BD se pasa a número (float)
  }
}
