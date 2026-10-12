export interface LocationItem {
  id: string
  label: string
}

export const GOVERNORATES: LocationItem[] = [
  {
    id: 'capital',
    label: 'العاصمة',
  },
  {
    id: 'hawally',
    label: 'حولي',
  },
  {
    id: 'ahmadi',
    label: 'الأحمدي',
  },
  {
    id: 'jahra',
    label: 'الجهراء',
  },
  {
    id: 'farwaniya',
    label: 'الفروانية',
  },
  {
    id: 'mubarak_alkabeer',
    label: 'مبارك الكبير',
  },
]

export const AREAS: Record<string, LocationItem[]> = {
  capital: [
    {
      id: 'capital_1',
      label: 'مدينة جابر الأحمد',
    },
    {
      id: 'capital_2',
      label: 'شالهيات الدوحة',
    },
    {
      id: 'capital_3',
      label: 'النهضة',
    },
    {
      id: 'capital_4',
      label: 'الصوابر',
    },
    {
      id: 'capital_5',
      label: 'كيفان',
    },
    {
      id: 'capital_6',
      label: 'السرة',
    },
    {
      id: 'capital_7',
      label: 'الروضة',
    },
    {
      id: 'capital_8',
      label: 'الدسمة',
    },
    {
      id: 'capital_9',
      label: 'الري',
    },
    {
      id: 'capital_10',
      label: 'قرطبة',
    },
    {
      id: 'capital_11',
      label: 'شرق',
    },
    {
      id: 'capital_12',
      label: 'الدعية',
    },
    {
      id: 'capital_13',
      label: 'اليرموك',
    },
    {
      id: 'capital_14',
      label: 'الصليبيخات',
    },
    {
      id: 'capital_15',
      label: 'المرقاب',
    },
    {
      id: 'capital_16',
      label: 'الشويخ',
    },
    {
      id: 'capital_17',
      label: 'العديلية',
    },
    {
      id: 'capital_18',
      label: 'ضاحية عبد الله السالم',
    },
    {
      id: 'capital_19',
      label: 'الخالدية',
    },
    {
      id: 'capital_20',
      label: 'القيروان',
    },
    {
      id: 'capital_21',
      label: 'دسمان',
    },
    {
      id: 'capital_22',
      label: 'الفيحاء',
    },
    {
      id: 'capital_23',
      label: 'غرناطة',
    },
    {
      id: 'capital_24',
      label: 'بنيد القار',
    },
    {
      id: 'capital_25',
      label: 'الشامية',
    },
    {
      id: 'capital_26',
      label: 'الدوحة السكنية',
    },
    {
      id: 'capital_27',
      label: 'القبلة',
    },
    {
      id: 'capital_28',
      label: 'المنصورية',
    },
    {
      id: 'capital_29',
      label: 'النزهة',
    },
    {
      id: 'capital_30',
      label: 'شمال غرب الصليبيخات',
    },
  ],
  hawally: [
    {
      id: 'hawally_1',
      label: 'السلام',
    },
    {
      id: 'hawally_2',
      label: 'السالمية',
    },
    {
      id: 'hawally_3',
      label: 'الجابرية',
    },
    {
      id: 'hawally_4',
      label: 'الشهداء',
    },
    {
      id: 'hawally_5',
      label: 'الزهراء',
    },
    {
      id: 'hawally_6',
      label: 'بيان',
    },
    {
      id: 'hawally_7',
      label: 'الشعب',
    },
    {
      id: 'hawally_8',
      label: 'البدع',
    },
    {
      id: 'hawally_9',
      label: 'الرميثية',
    },
    {
      id: 'hawally_10',
      label: 'الصديق',
    },
    {
      id: 'hawally_11',
      label: 'النقرة',
    },
    {
      id: 'hawally_12',
      label: 'حطين',
    },
    {
      id: 'hawally_13',
      label: 'حولي',
    },
    {
      id: 'hawally_14',
      label: 'سلوى',
    },
    {
      id: 'hawally_15',
      label: 'مبارك العبدالله',
    },
    {
      id: 'hawally_16',
      label: 'مشرف',
    },
    {
      id: 'hawally_17',
      label: 'ميدان حولي',
    },
  ],
  ahmadi: [
    {
      id: 'ahmadi_1',
      label: 'الفنطاس',
    },
    {
      id: 'ahmadi_2',
      label: 'هدية',
    },
    {
      id: 'ahmadi_3',
      label: 'الظهر',
    },
    {
      id: 'ahmadi_4',
      label: 'العقيلة',
    },
    {
      id: 'ahmadi_5',
      label: 'الرقة',
    },
    {
      id: 'ahmadi_6',
      label: 'المهبولة',
    },
    {
      id: 'ahmadi_7',
      label: 'الصباحية',
    },
    {
      id: 'ahmadi_8',
      label: 'أبو حليفة',
    },
    {
      id: 'ahmadi_9',
      label: 'المنقف',
    },
    {
      id: 'ahmadi_10',
      label: 'الفحيحيل',
    },
    {
      id: 'ahmadi_11',
      label: 'المقوع',
    },
    {
      id: 'ahmadi_12',
      label: 'الأحمدي',
    },
    {
      id: 'ahmadi_13',
      label: 'الخيران',
    },
    {
      id: 'ahmadi_14',
      label: 'الخيران السكنية',
    },
    {
      id: 'ahmadi_15',
      label: 'الزور',
    },
    {
      id: 'ahmadi_16',
      label: 'النويصيب',
    },
    {
      id: 'ahmadi_17',
      label: 'الوفرة',
    },
    {
      id: 'ahmadi_18',
      label: 'الوفرة السكنية',
    },
    {
      id: 'ahmadi_19',
      label: 'جابر العلي',
    },
    {
      id: 'ahmadi_20',
      label: 'جنوب صباح الأحمد',
    },
    {
      id: 'ahmadi_21',
      label: 'شاليهات الجليعة',
    },
    {
      id: 'ahmadi_22',
      label: 'شاليهات الزور',
    },
    {
      id: 'ahmadi_23',
      label: 'شاليهات الضباعية',
    },
    {
      id: 'ahmadi_24',
      label: 'شاليهات النويصيب',
    },
    {
      id: 'ahmadi_25',
      label: 'شاليهات بنيدر',
    },
    {
      id: 'ahmadi_26',
      label: 'صباح الأحمد البحرية',
    },
    {
      id: 'ahmadi_27',
      label: 'ضاحية علي صباح السالم',
    },
    {
      id: 'ahmadi_28',
      label: 'ضاحية فهد الأحمد',
    },
    {
      id: 'ahmadi_29',
      label: 'مدينة صباح الأحمد',
    },
    {
      id: 'ahmadi_30',
      label: 'ميناء عبدالله',
    },
  ],
  jahra: [
    {
      id: 'jahra_1',
      label: 'الجهراء القديمة',
    },
    {
      id: 'jahra_2',
      label: 'النسيم',
    },
    {
      id: 'jahra_3',
      label: 'النعيم',
    },
    {
      id: 'jahra_4',
      label: 'الجهراء الجديدة',
    },
    {
      id: 'jahra_5',
      label: 'تيماء',
    },
    {
      id: 'jahra_6',
      label: 'الواحة',
    },
    {
      id: 'jahra_7',
      label: 'القيصرية',
    },
    {
      id: 'jahra_8',
      label: 'العيون',
    },
    {
      id: 'jahra_9',
      label: 'كبد',
    },
    {
      id: 'jahra_10',
      label: 'العبدلي',
    },
    {
      id: 'jahra_11',
      label: 'القصر',
    },
    {
      id: 'jahra_12',
      label: 'الصبية',
    },
    {
      id: 'jahra_13',
      label: 'المطلاع',
    },
    {
      id: 'jahra_14',
      label: 'الصليبية الصناعية',
    },
    {
      id: 'jahra_15',
      label: 'السالمي',
    },
    {
      id: 'jahra_16',
      label: 'أمغرة الصناعية',
    },
    {
      id: 'jahra_17',
      label: 'الروضتين',
    },
    {
      id: 'jahra_18',
      label: 'شاليهات الصبية',
    },
    {
      id: 'jahra_19',
      label: 'شاليهات كاظمة',
    },
    {
      id: 'jahra_20',
      label: 'الصليبية السكنية',
    },
    {
      id: 'jahra_21',
      label: 'النعايم الصناعية',
    },
    {
      id: 'jahra_22',
      label: 'النهضة',
    },
    {
      id: 'jahra_23',
      label: 'المطلاع السكنية',
    },
    {
      id: 'jahra_24',
      label: 'جواخير الجهراء',
    },
    {
      id: 'jahra_25',
      label: 'جنوب أمغرة',
    },
    {
      id: 'jahra_26',
      label: 'القيروان',
    },
    {
      id: 'jahra_27',
      label: 'مدينة سعد العبد الله',
    },
  ],
  farwaniya: [
    {
      id: 'farwaniya_1',
      label: 'الفروانية',
    },
    {
      id: 'farwaniya_2',
      label: 'خيطان الجديدة',
    },
    {
      id: 'farwaniya_3',
      label: 'خيطان',
    },
    {
      id: 'farwaniya_4',
      label: 'العمرية',
    },
    {
      id: 'farwaniya_5',
      label: 'جليب الشيوخ',
    },
    {
      id: 'farwaniya_6',
      label: 'العباسية',
    },
    {
      id: 'farwaniya_7',
      label: 'العارضية الصناعية',
    },
    {
      id: 'farwaniya_8',
      label: 'الحساوي',
    },
    {
      id: 'farwaniya_9',
      label: 'الفردوس',
    },
    {
      id: 'farwaniya_10',
      label: 'أبرق خيطان',
    },
    {
      id: 'farwaniya_11',
      label: 'الرابية',
    },
    {
      id: 'farwaniya_12',
      label: 'الضجيج',
    },
    {
      id: 'farwaniya_13',
      label: 'الرقعي',
    },
    {
      id: 'farwaniya_14',
      label: 'أشبيلية',
    },
    {
      id: 'farwaniya_15',
      label: 'الرحاب',
    },
    {
      id: 'farwaniya_16',
      label: 'الصليبية الصناعية 3',
    },
    {
      id: 'farwaniya_17',
      label: 'غرب عبدالله المبارك',
    },
    {
      id: 'farwaniya_18',
      label: 'جنوب عبدالله المبارك',
    },
    {
      id: 'farwaniya_19',
      label: 'الاندلس',
    },
    {
      id: 'farwaniya_20',
      label: 'ضاحية عبد الله المبارك',
    },
    {
      id: 'farwaniya_21',
      label: 'ضاحية صباح الناصر',
    },
    {
      id: 'farwaniya_22',
      label: 'العارضية',
    },
  ],
  mubarak_alkabeer: [
    {
      id: 'mubarak_1',
      label: 'صباح السالم',
    },
    {
      id: 'mubarak_2',
      label: 'المسيلة',
    },
    {
      id: 'mubarak_3',
      label: 'الفنيطيس',
    },
    {
      id: 'mubarak_4',
      label: 'أبو الحصانية',
    },
    {
      id: 'mubarak_5',
      label: 'العدان',
    },
    {
      id: 'mubarak_6',
      label: 'القصور',
    },
    {
      id: 'mubarak_7',
      label: 'القرين',
    },
  ],
}
