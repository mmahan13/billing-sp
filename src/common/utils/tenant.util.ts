import { FindOptionsWhere } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { UserRole } from 'src/auth/enums/user-role.enum';

/**
 * Helper universal para aislar los datos por usuario (Multi-tenancy / RBAC).
 * * @description
 * Evalúa los roles del usuario que realiza la petición y construye dinámicamente
 * el bloque `where` para las consultas de TypeORM.
 * * - Si es `ADMIN`: Puede ver todos los registros de la tabla (no inyecta filtro de dueño).
 * - Si es `USER`: Inyecta obligatoriamente `user: { id: user.id }` para que solo
 * pueda ver/editar/borrar sus propios datos (blindaje de seguridad).
 * * @template T - La entidad de TypeORM sobre la que se hace la consulta (Client, Product...)
 * @param {User} user - El usuario actual que ejecuta la petición (extraído del token)
 * @param {FindOptionsWhere<T>} [extraConditions] - Filtros adicionales opcionales (ej: { id: 'uuid' })
 * @returns {FindOptionsWhere<T>} Las condiciones finales listas para TypeORM
 * * @example
 * // En el servicio:
 * const client = await this.repository.findOne({
 * where: getTenantWhere(user, { id: clientId }),
 * });
 */

export function getTenantWhere<T>(
  user: User,
  extraConditions?: FindOptionsWhere<T>,
): FindOptionsWhere<T> {
  const isAdmin = user.roles.includes(UserRole.ADMIN);

  // Si es admin, devolvemos las condiciones extra o un objeto vacío (sin casting manual)
  if (isAdmin) {
    return extraConditions || {};
  }

  // Si es usuario normal, forzamos el filtro por su ID
  // (Aquí sí mantenemos el 'as' porque estamos inyectando una propiedad 'user' dinámicamente)
  return {
    ...extraConditions,
    user: { id: user.id },
  } as unknown as FindOptionsWhere<T>;
}
