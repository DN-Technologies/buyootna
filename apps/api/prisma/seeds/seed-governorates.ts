import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GOVERNORATES = [
  {
    id: 'capital',
    name: 'العاصمة',
    areas: [
      { id: 'capital_1', name: 'مدينة جابر الأحمد' },
      { id: 'capital_2', name: 'شالهيات الدوحة' },
      { id: 'capital_3', name: 'النهضة' },
      { id: 'capital_4', name: 'الصوابر' },
      { id: 'capital_5', name: 'كيفان' },
      { id: 'capital_6', name: 'السرة' },
      { id: 'capital_7', name: 'الروضة' },
      { id: 'capital_8', name: 'الدسمة' },
      { id: 'capital_9', name: 'الري' },
      { id: 'capital_10', name: 'قرطبة' },
      { id: 'capital_11', name: 'شرق' },
      { id: 'capital_12', name: 'الدعية' },
      { id: 'capital_13', name: 'اليرموك' },
      { id: 'capital_14', name: 'الصليبيخات' },
      { id: 'capital_15', name: 'المرقاب' },
      { id: 'capital_16', name: 'الشويخ' },
      { id: 'capital_17', name: 'العديلية' },
      { id: 'capital_18', name: 'ضاحية عبد الله السالم' },
      { id: 'capital_19', name: 'الخالدية' },
      { id: 'capital_20', name: 'القيروان' },
      { id: 'capital_21', name: 'دسمان' },
      { id: 'capital_22', name: 'الفيحاء' },
      { id: 'capital_23', name: 'غرناطة' },
      { id: 'capital_24', name: 'بنيد القار' },
      { id: 'capital_25', name: 'الشامية' },
      { id: 'capital_26', name: 'الدوحة السكنية' },
      { id: 'capital_27', name: 'القبلة' },
      { id: 'capital_28', name: 'المنصورية' },
      { id: 'capital_29', name: 'النزهة' },
      { id: 'capital_30', name: 'شمال غرب الصليبيخات' },
    ],
  },
  {
    id: 'hawally',
    name: 'حولي',
    areas: [
      { id: 'hawally_1', name: 'السلام' },
      { id: 'hawally_2', name: 'السالمية' },
      { id: 'hawally_3', name: 'الجابرية' },
      { id: 'hawally_4', name: 'الشهداء' },
      { id: 'hawally_5', name: 'الزهراء' },
      { id: 'hawally_6', name: 'بيان' },
      { id: 'hawally_7', name: 'الشعب' },
      { id: 'hawally_8', name: 'البدع' },
      { id: 'hawally_9', name: 'الرميثية' },
      { id: 'hawally_10', name: 'الصديق' },
      { id: 'hawally_11', name: 'النقرة' },
      { id: 'hawally_12', name: 'حطين' },
      { id: 'hawally_13', name: 'حولي' },
      { id: 'hawally_14', name: 'سلوى' },
      { id: 'hawally_15', name: 'مبارك العبدالله' },
      { id: 'hawally_16', name: 'مشرف' },
      { id: 'hawally_17', name: 'ميدان حولي' },
    ],
  },
  {
    id: 'farwaniya',
    name: 'الفروانية',
    areas: [
      { id: 'farwaniya_1', name: 'الفروانية' },
      { id: 'farwaniya_2', name: 'خيطان الجديدة' },
      { id: 'farwaniya_3', name: 'خيطان' },
      { id: 'farwaniya_4', name: 'العمرية' },
      { id: 'farwaniya_5', name: 'جليب الشيوخ' },
      { id: 'farwaniya_6', name: 'العباسية' },
      { id: 'farwaniya_7', name: 'العارضية الصناعية' },
      { id: 'farwaniya_8', name: 'الحساوي' },
      { id: 'farwaniya_9', name: 'الفردوس' },
      { id: 'farwaniya_10', name: 'أبرق خيطان' },
      { id: 'farwaniya_11', name: 'الرابية' },
      { id: 'farwaniya_12', name: 'الضجيج' },
      { id: 'farwaniya_13', name: 'الرقعي' },
      { id: 'farwaniya_14', name: 'أشبيلية' },
      { id: 'farwaniya_15', name: 'الرحاب' },
      { id: 'farwaniya_16', name: 'الصليبية الصناعية 3' },
      { id: 'farwaniya_17', name: 'غرب عبدالله المبارك' },
      { id: 'farwaniya_18', name: 'جنوب عبدالله المبارك' },
      { id: 'farwaniya_19', name: 'الاندلس' },
      { id: 'farwaniya_20', name: 'ضاحية عبد الله المبارك' },
      { id: 'farwaniya_21', name: 'ضاحية صباح الناصر' },
      { id: 'farwaniya_22', name: 'العارضية' },
    ],
  },
  {
    id: 'ahmadi',
    name: 'الأحمدي',
    areas: [
      { id: 'ahmadi_1', name: 'الفنطاس' },
      { id: 'ahmadi_2', name: 'هدية' },
      { id: 'ahmadi_3', name: 'الظهر' },
      { id: 'ahmadi_4', name: 'العقيلة' },
      { id: 'ahmadi_5', name: 'الرقة' },
      { id: 'ahmadi_6', name: 'المهبولة' },
      { id: 'ahmadi_7', name: 'الصباحية' },
      { id: 'ahmadi_8', name: 'أبو حليفة' },
      { id: 'ahmadi_9', name: 'المنقف' },
      { id: 'ahmadi_10', name: 'الفحيحيل' },
      { id: 'ahmadi_11', name: 'المقوع' },
      { id: 'ahmadi_12', name: 'الأحمدي' },
      { id: 'ahmadi_13', name: 'الخيران' },
      { id: 'ahmadi_14', name: 'الخيران السكنية' },
      { id: 'ahmadi_15', name: 'الزور' },
      { id: 'ahmadi_16', name: 'النويصيب' },
      { id: 'ahmadi_17', name: 'الوفرة' },
      { id: 'ahmadi_18', name: 'الوفرة السكنية' },
      { id: 'ahmadi_19', name: 'جابر العلي' },
      { id: 'ahmadi_20', name: 'جنوب صباح الأحمد' },
      { id: 'ahmadi_21', name: 'شاليهات الجليعة' },
      { id: 'ahmadi_22', name: 'شاليهات الزور' },
      { id: 'ahmadi_23', name: 'شاليهات الضباعية' },
      { id: 'ahmadi_24', name: 'شاليهات النويصيب' },
      { id: 'ahmadi_25', name: 'شاليهات بنيدر' },
      { id: 'ahmadi_26', name: 'صباح الأحمد البحرية' },
      { id: 'ahmadi_27', name: 'ضاحية علي صباح السالم' },
      { id: 'ahmadi_28', name: 'ضاحية فهد الأحمد' },
      { id: 'ahmadi_29', name: 'مدينة صباح الأحمد' },
      { id: 'ahmadi_30', name: 'ميناء عبدالله' },
    ],
  },
  {
    id: 'jahra',
    name: 'الجهراء',
    areas: [
      { id: 'jahra_1', name: 'الجهراء القديمة' },
      { id: 'jahra_2', name: 'النسيم' },
      { id: 'jahra_3', name: 'النعيم' },
      { id: 'jahra_4', name: 'الجهراء الجديدة' },
      { id: 'jahra_5', name: 'تيماء' },
      { id: 'jahra_6', name: 'الواحة' },
      { id: 'jahra_7', name: 'القيصرية' },
      { id: 'jahra_8', name: 'العيون' },
      { id: 'jahra_9', name: 'كبد' },
      { id: 'jahra_10', name: 'العبدلي' },
      { id: 'jahra_11', name: 'القصر' },
      { id: 'jahra_12', name: 'الصبية' },
      { id: 'jahra_13', name: 'المطلاع' },
      { id: 'jahra_14', name: 'الصليبية الصناعية' },
      { id: 'jahra_15', name: 'السالمي' },
      { id: 'jahra_16', name: 'أمغرة الصناعية' },
      { id: 'jahra_17', name: 'الروضتين' },
      { id: 'jahra_18', name: 'شاليهات الصبية' },
      { id: 'jahra_19', name: 'شاليهات كاظمة' },
      { id: 'jahra_20', name: 'الصليبية السكنية' },
      { id: 'jahra_21', name: 'النعايم الصناعية' },
      { id: 'jahra_22', name: 'النهضة' },
      { id: 'jahra_23', name: 'المطلاع السكنية' },
      { id: 'jahra_24', name: 'جواخير الجهراء' },
      { id: 'jahra_25', name: 'جنوب أمغرة' },
      { id: 'jahra_26', name: 'القيروان' },
      { id: 'jahra_27', name: 'مدينة سعد العبد الله' },
    ],
  },
  {
    id: 'mubarak_alkabeer',
    name: 'مبارك الكبير',
    areas: [
      { id: 'mubarak_1', name: 'صباح السالم' },
      { id: 'mubarak_2', name: 'المسيلة' },
      { id: 'mubarak_3', name: 'الفنيطيس' },
      { id: 'mubarak_4', name: 'أبو الحصانية' },
      { id: 'mubarak_5', name: 'العدان' },
      { id: 'mubarak_6', name: 'القصور' },
      { id: 'mubarak_7', name: 'القرين' },
    ],
  },
];

async function main() {
  console.log('🏗️  Seeding Governorates & Areas (non-destructive)...');

  for (const gov of GOVERNORATES) {
    await prisma.governorate.upsert({
      where: { id: gov.id },
      update: { name: gov.name },
      create: { id: gov.id, name: gov.name },
    });

    for (const area of gov.areas) {
      await prisma.area.upsert({
        where: { id: area.id },
        update: { name: area.name, governorateId: gov.id },
        create: { id: area.id, name: area.name, governorateId: gov.id },
      });
    }
  }

  const govCount = await prisma.governorate.count();
  const areaCount = await prisma.area.count();
  console.log(`✅ Done. ${govCount} governorates, ${areaCount} areas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
