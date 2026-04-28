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
  businessName: 'Sabor a Miel S.L.',
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
  { productName: 'AZ450 MIEL DE AZAHAR 450 GR.', basePrice: 2.4 },
  { productName: 'AZ950 MIEL DE AZAHAR 950 GR.', basePrice: 4.75 },
  { productName: 'BI450 MIEL DE BIERCOL 450 GR.', basePrice: 2.4 },
  { productName: 'BR500 MIEL DE BREZO 500 GR.', basePrice: 2.7 },
  { productName: 'BR950 MIEL DE BREZO 950 GRA.', basePrice: 10 },
  { productName: 'BO950 MIEL DE BOSQUE 950 GR.', basePrice: 8.5 },
  { productName: 'V CERVEZA BELGA TOSTADA', basePrice: 2.5 },
  { productName: 'V GOTAS PROPOLEO', basePrice: 3 },
];

export const SEED_CLIENTS = [
  {
    businessName: 'PANADERIA JOSEFA BLANDON DAVILA',
    taxId: '14560411Y',
    phone: '',
    address: 'C/ ALDABE, 22 BAJO, 01012 Vitoria-Gasteiz (Álava)',
    hasEquivalenceSurcharge: true,
  },
  {
    businessName: 'ALIMENTACION FAQUI',
    taxId: '16241064E',
    phone: '',
    address: 'C/ ANDALUCIA, 15, Vitoria-Gasteiz (Álava)',
    hasEquivalenceSurcharge: false,
  },
  {
    businessName: 'ALEJANDRO OVIEDO',
    taxId: '77138677Q',
    phone: '',
    address: 'C/ BEATO TOMAS ZUMARRAGA, 32, Vitoria-Gasteiz (Álava)',
    hasEquivalenceSurcharge: true,
  },
  {
    businessName: 'CARNICERIA LUCIO MERINO',
    taxId: '13045710L',
    phone: '654117765',
    address: 'C/ DOCTOR FLEMING 5, 09003 Burgos',
    hasEquivalenceSurcharge: false,
  },
  {
    businessName: 'LA CASA DE LOS QUESOS S.L.',
    taxId: 'B09341499',
    phone: '947231447',
    address: 'C/ SANZ PASTOR, 1, 09003 Burgos',
    hasEquivalenceSurcharge: false,
  },
  {
    businessName: 'RESTAURANTE EL CHIPIRON',
    taxId: 'B09456722',
    phone: '629555642',
    address: 'C/ LA PUEBLA 44, 09004 Burgos',
    hasEquivalenceSurcharge: false,
  },
  {
    businessName: 'FRUTAS ANGEL S.L.',
    taxId: 'B09361732',
    phone: '676056588',
    address: 'MERCADO NORTE PUESTOS 30 Y 32, 09005 Burgos',
    hasEquivalenceSurcharge: true,
  },
  {
    businessName: 'LA DESPENSA CASTELLANA S. L.',
    taxId: 'B09371032',
    phone: '686159012',
    address: 'C/ SAN FRANCISCO 4, Miranda de Ebro (Burgos)',
    hasEquivalenceSurcharge: true,
  },
  {
    businessName: 'FRUTERIA BURGOS S.L.',
    taxId: 'B09511917',
    phone: '',
    address: 'AV. VALLADOLID 1 POL. BRENES DP 09006, Villalbilla (Burgos)',
    hasEquivalenceSurcharge: false,
  },
  {
    businessName: 'CARNICERIA LA GABARRA',
    taxId: '13928525X',
    phone: '',
    address: 'BARRIO GAJANO, Marina de Cudeyo (Cantabria)',
    hasEquivalenceSurcharge: true,
  },
  {
    businessName: 'PANADERIA GAJANO',
    taxId: '13745281P',
    phone: '647545612',
    address: 'AVENIDA DE LA LIBERTAD, 18 INT., Laredo (Cantabria)',
    hasEquivalenceSurcharge: true,
  },
  {
    businessName: 'CARNICERIA PERNEN',
    taxId: '13928571X',
    phone: '942710341',
    address: 'PLAZA ABASTOS, San Vicente de la Barquera (Cantabria)',
    hasEquivalenceSurcharge: false,
  },
  {
    businessName: 'LA GALLOFA PANADERIAS ESPECIALIZADAS S.L.',
    taxId: 'B39315661',
    phone: '',
    address: 'POL. NUEVA MONTAÑA NAVE 11, Santander (Cantabria)',
    hasEquivalenceSurcharge: false,
  },
  {
    businessName: 'FRUTERIA ROCHE',
    taxId: '13932233X',
    phone: '682131903',
    address: 'C/ JUAN JOSE, 14 BAJO, Torrelavega (Cantabria)',
    hasEquivalenceSurcharge: true,
  },
  {
    businessName: 'CARNICERIAS CHARCUTERIA HNOS. CALVO',
    taxId: '16281050X',
    phone: '',
    address: 'PLAZA CASTAÑARES BAJO TIENDA, Haro (La Rioja)',
    hasEquivalenceSurcharge: false,
  },
];
