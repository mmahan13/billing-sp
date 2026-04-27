import { UserRole } from 'src/auth/enums/user-role.enum'; // Ajusta la ruta a tu enum

export const SEED_USERS = [
  {
    fullName: 'Mike Mahan',
    email: 'mmahan13@gmail.com',
    password: '@Abc123', // El servicio se encargará de encriptarla
    roles: [UserRole.ADMIN],
  },
  {
    fullName: 'Manuel Fernandez Caballero',
    email: 'manuelfernandez@gmail.com',
    password: '@Abc123',
    roles: [UserRole.USER],
  },
];

export const SEED_COMPANY = {
  businessName: 'Mieles Manuel S.L.',
  taxId: 'B12345678',
  address: 'Calle de las Abejas 12, Mijas, Málaga',
  bankAccount: 'ES91 1234 5678 9012 3456 7890',
  phone: '600123456',
};

export const SEED_TAXES = [
  { label: 'IVA Superreducido (4%)', iva: 4, surcharge: 0 },
  { label: 'IVA Reducido (10%)', iva: 10, surcharge: 0 },
  { label: 'IVA General (21%)', iva: 21, surcharge: 0 },
  { label: 'IVA Reducido + RE (10% + 1.4%)', iva: 10, surcharge: 1.4 },
  { label: 'IVA General + RE (21% + 5.2%)', iva: 21, surcharge: 5.2 },
];

export const SEED_PRODUCTS = [
  { productName: 'TARRO MIEL EUCALIPTO 1KG', basePrice: 8.5 },
  { productName: 'TARRO MIEL ROMERO 500G', basePrice: 5.0 },
  { productName: 'POLEN FRESCO 250G', basePrice: 6.5 },
];

export const SEED_CLIENTS = [
  {
    businessName: 'Supermercados Paco',
    taxId: 'B87654321',
    phone: '654321987',
    address: 'Plaza Mayor 1, Málaga',
    hasEquivalenceSurcharge: false,
  },
  {
    businessName: 'Herbolario Salud Integral',
    taxId: '12345678Z',
    phone: '611223344',
    address: 'Calle Verde 5, Málaga',
    hasEquivalenceSurcharge: true,
  },
];
