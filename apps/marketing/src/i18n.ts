import { ApplicationCard, ServiceItem, StatItem } from './types';

export const navigation = [
  { id: 'hero', label: { ar: 'الرئيسية', en: 'Home' } },
  { id: 'about', label: { ar: 'من نحن', en: 'About Us' } },
  { id: 'apps', label: { ar: 'تطبيقاتنا', en: 'Our Apps' } },
  { id: 'services', label: { ar: 'خدماتنا', en: 'Services' } },
  { id: 'why-us', label: { ar: 'لماذا نحن', en: 'Why Choose Us' } },
  { id: 'contact', label: { ar: 'تواصل معنا', en: 'Contact' } },
];

export const translations = {
  ar: {
    heroTitle: 'نبني علامات رقمية تصنع المستقبل',
    heroSubtitle: 'تتخصص دار النخبة للدعاية والتسويق في تطوير وتسويق وتنمية التطبيقات والمنصات الرقمية المبتكرة التي تقدم قيمة حقيقية للمستخدمين والشركاء.',
    heroCtaPrimary: 'اكتشف تطبيقاتنا',
    heroCtaSecondary: 'تواصل معنا',
    aboutTitle: 'عن شركة دار النخبة',
    aboutSubtitle: 'شركة دار النخبة للدعاية والتسويق',
    aboutText1: 'تأسست شركة دار النخبة للدعاية والتسويق لتكون الشريك الاستراتيجي الرقمي والمطور والمروج الرائد في منطقة الخليج للمنصات والتطبيقات الحديثة. نحن لا ننشر الإعلانات فحسب، بل نصنع أنظمة رقمية متكاملة تلامس حياة الناس اليومية وتلبي احتياجاتهم الحقيقية وفق أعلى معايير الجودة والسهولة.',
    aboutText2: 'نمتلك رؤية بعيدة المدى تهدف لنمو قطاع التكنولوجيا محلياً وإقليمياً عبر رعاية وتطوير علامتنا الخاصة، لنكون حلقة الوصل المباشرة بين المستثمرين والمستخدمين الباحثين عن التميز والابتكار.',
    appsTitle: 'منظومتنا من التطبيقات الرقمية',
    appsSubtitle: 'تطبيقات رائدة ومبتكرة نطوّرها ونسوّقها لنلبي متطلبات الحياة المعاصرة.',
    learnMore: 'استكشف المزيد',
    visitPlatform: 'زيارة المنصة',
    servicesTitle: 'ماذا نقدم',
    servicesSubtitle: 'حلول تسويقية وتطويرية شاملة لدعم وتنمية العلامات التجارية الرقمية.',
    whyUsTitle: 'لماذا تختار دار النخبة؟',
    whyUsSubtitle: 'معايير النخبة التي تدفع أعمالك ومنصاتك نحو الريادة الإقليمية.',
    visionTitle: 'صناعة تجارب رقمية ذات معنى',
    visionSubtitle: 'رؤيتنا الاستراتيجية',
    visionText: 'نسعى دائمًا لأن تكون دار النخبة الرائدة إقليمياً وعالمياً في تصميم وإطلاق وإشهار المنتجات الرقمية والتطبيقات الذكية التي تصبح جزءاً حيوياً من روتين الأفراد وتؤثر بشكل إيجابي ومستدام على أسلوب معيشتهم.',
    contactTitle: 'دعنا نتحدث حول شراكتنا القادمة',
    contactSubtitle: 'يسعدنا تواصلكم لطرح استفساراتكم ومناقشة فرص التعاون والاستثمار الدائرية.',
    contactName: 'الاسم الكامل',
    contactEmail: 'البريد الإلكتروني',
    contactPhone: 'رقم الهاتف',
    contactMessage: 'نص الرسالة أو الاستفسار',
    contactSubmit: 'إرسال الاستفسار',
    contactSending: 'جاري الإرسال...',
    contactSuccess: 'شكراً لتواصلك معنا! لقد تم استلام استفسارك بنجاح وسيتواصل معك فريق النخبة في أقرب وقت.',
    contactError: 'عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
    formRequired: 'هذا الحقل مطلوب',
    clientSuccess: 'ثقة شركائنا وعملائنا هي دافعنا الأكبر',
    navLang: 'English',
    rights: 'جميع الحقوق محفوظة. شركة دار النخبة للدعاية والتسويق',
    statsHold: 'الأرقام تتحدث عن النخبة',
    customAppLabel: 'تطوير وتسويق خاص بـ دار النخبة',
  },
  en: {
    heroTitle: 'Building Digital Brands That Shape the Future',
    heroSubtitle: 'Dar Al Nokhba develops, markets, and grows innovative digital platforms that create meaningful value for users, business owners, and global partners.',
    heroCtaPrimary: 'Explore Our Apps',
    heroCtaSecondary: 'Contact Us',
    aboutTitle: 'About Dar Al Nokhba',
    aboutSubtitle: 'DAR ALNOKHBA COMPANY FOR ADVERTISING AND MARKETING',
    aboutText1: 'DAR ALNOKHBA COMPANY FOR ADVERTISING AND MARKETING was founded to be the premiere digital developer, marketer, and strategic partner in the Gulf region. We do more than run traditional advertisements; we engineer and scale fully integrated digital ecosystems that improve users’ daily lives with seamless reliability.',
    aboutText2: 'Our long-term business strategy focuses on owning and scaling high-end digital brands and mobile products, creating powerful connection points between users, investors, and state-of-the-art services.',
    appsTitle: 'Our Digital Brand Ecosystem',
    appsSubtitle: 'Leading mobile applications designed, developed, and positioned by Dar Al Nokhba.',
    learnMore: 'Learn More',
    visitPlatform: 'Visit Platform',
    servicesTitle: 'What We Do',
    servicesSubtitle: 'Comprehensive marketing, positioning, and engineering capabilities tailored for regional growth.',
    whyUsTitle: 'Why Choose Us',
    whyUsSubtitle: 'Elite standards driving digital platforms toward regional and global leadership.',
    visionTitle: 'Creating Digital Experiences That Matter',
    visionSubtitle: 'Our Vision',
    visionText: 'We strive to build and market impactful digital products that seamlessly weave into people\'s daily routines, setting standards for beauty, convenience, and modern engineering across the Middle East.',
    contactTitle: 'Let’s Shape the Future Together',
    contactSubtitle: 'Reach out to discuss partnership opportunities, custom advertising models, or investor inquiries.',
    contactName: 'Full Name',
    contactEmail: 'Email Address',
    contactPhone: 'Phone Number',
    contactMessage: 'Message or Inquiry',
    contactSubmit: 'Send Inquiry',
    contactSending: 'Sending Inquiry...',
    contactSuccess: 'Thank you! Your inquiry has been successfully received. The Al Nokhba team will reach out to you shortly.',
    contactError: 'An error occurred while sending. Please try again later.',
    formRequired: 'This field is required',
    clientSuccess: 'Our Partners & Track Record',
    navLang: 'العربية',
    rights: 'All rights reserved. DAR ALNOKHBA COMPANY FOR ADVERTISING AND MARKETING',
    statsHold: 'Numbers that Define Our Success',
    customAppLabel: 'Developed & Marketed by Dar Al Nokhba',
  }
};

export const applications: ApplicationCard[] = [
  {
    id: 'buyotona',
    name: {
      ar: 'بيوتنا',
      en: 'Buyotona',
    },
    category: {
      ar: 'المنصة العقارية المتطورة',
      en: 'Real Estate Platform',
    },
    description: {
      ar: 'منصة عقارية حديثة تربط بين البائعين والمشترين والملاك والمستأجرين من خلال تجربة رقمية سهلة وفعالة وموثوقة كلياً.',
      en: 'A modern real estate marketplace designed to securely connect buyers, sellers, landlords, and tenants through an intuitive digital journey.',
    },
    features: {
      ar: [
        'تصفح ذكي عبر خرائط تفاعلية متطورة',
        'نظام تواصل مباشر وفوري بين الملاك والعملاء',
        'جولات افتراضية ثلاثية الأبعاد وعروض فيديو فائقة الدقة',
        'حلول توثيق عقارية آمنة وتوافق تام مع القوانين المحلية',
      ],
      en: [
        'Interactive custom-mapped search layout',
        'Instant secure messenger between leads and owners',
        'High-fidelity 3D virtual tours and video showcases',
        'Verified listings with secure and legal compliance frameworks',
      ],
    },
    image: '/src/assets/images/buyotona_icon_1780174441893.png',
    badge: {
      ar: 'عقارات ذكية',
      en: 'Smart Real Estate',
    },
    stats: [
      { label: { ar: 'مستخدم نشط', en: 'Active Users' }, value: '80K+' },
      { label: { ar: 'عقار مدرج', en: 'Verified Properties' }, value: '15K+' },
    ],
    link: '#',
  },
  {
    id: 'lbsii',
    name: {
      ar: 'لبسي',
      en: 'LBSII',
    },
    category: {
      ar: 'منصة الأزياء والضيافة والمصممات',
      en: 'Luxury Fashion & Catering Platform',
    },
    description: {
      ar: 'منصة متكاملة متخصصة في خطوط الأزياء الفاخرة، الفساتين الراقية، استوديوهات التصميم الحصرية، وخدمات الكاترينغ الممتازة.',
      en: 'A curated luxury destination connecting fashion designers, premium tailor-made dresses, exclusive clothing lines, and top-tier fine catering services.',
    },
    features: {
      ar: [
        'قسم مخصص للمصممات ودور الأزياء الخليجية والعالمية',
        'خدمة حجز فورية للمناسبات والحفلات مع منسقي الأغذية الفاخرة',
        'تخصيص قياسات ذكي مدعوم بالذكاء الاصطناعي',
        'خدمات توصيل وتجربة سريعة وآمنة للملابس والمأكولات',
      ],
      en: [
        'Dedicated spaces for boutique houses and elite designers',
        'Comprehensive fine event catering & booking modules',
        'Smart AI size recommender and fitting suite',
        'Ultra-fast luxury logistics and priority handling',
      ],
    },
    image: '/src/assets/images/lbsii_icon_1780174460062.png',
    badge: {
      ar: 'أناقة وضيافة',
      en: 'Luxury & Style',
    },
    stats: [
      { label: { ar: 'علامة مسجلة', en: 'Elite Brands' }, value: '350+' },
      { label: { ar: 'طلب ناجح', en: 'Delivered Styles' }, value: '45K+' },
    ],
    link: '#',
  },
];

export const services: ServiceItem[] = [
  {
    id: 's1',
    iconName: 'TrendingUp',
    title: { ar: 'التسويق الرقمي الفعال', en: 'Digital Marketing & Growth' },
    description: {
      ar: 'بناء استراتيجيات تسويقية رقمية متكاملة مدعومة بالبيانات للوصول إلى الجمهور المستهدف بأعلى كفاءة وأقل ميزانية هدر.',
      en: 'Data-driven, full-funnel digital campaign strategies built to scale user acquisition and conversion metrics efficiently.',
    },
  },
  {
    id: 's2',
    iconName: 'Award',
    title: { ar: 'تطوير الهوية التجارية', en: 'Brand Development' },
    description: {
      ar: 'نصمم الهوية البصرية والقيم الجوهرية والرسالة التي تجعل منتجك الرقمي يبرز في السوق ويلهم قلوب المستخدمين.',
      en: 'Designing visual identity frameworks, core brand philosophies, and narratives that make products stand out.',
    },
  },
  {
    id: 's3',
    iconName: 'Smartphone',
    title: { ar: 'ترويج وإدارة التطبيقات', en: 'Mobile App Promotion' },
    description: {
      ar: 'خطط تسويقية متخصصة لرفع حجم التحميلات (App Store & Google Play) وزيادة تفاعل ومعدل التمسك بالمستخدمين.',
      en: 'High-yield ASO and paid performance structures to maximize downloads and daily active user retention in app marketplaces.',
    },
  },
  {
    id: 's4',
    iconName: 'Target',
    title: { ar: 'الإعلانات المبنية على الأداء', en: 'Performance Advertising' },
    description: {
      ar: 'إدارة وتوجيه الحملات الإعلانية المدفوعة وتتبع نسبة التكلفة السنوية مقابل العائد الاستثماري بدقة متناهية.',
      en: 'Direct response and conversion-focused paid campaigns, tracking CAC and ROAS metrics with surgical precision.',
    },
  },
  {
    id: 's5',
    iconName: 'Megaphone',
    title: { ar: 'التسويق عبر قنوات التواصل', en: 'Social Media Management' },
    description: {
      ar: 'صياغة ونشر منشورات إبداعية تفاعلية لإدارة وحماية السمعة وبناء مجتمع مترابط متفاعل حول تطبيقاتنا.',
      en: 'Custom content and daily community management to build engaging spaces, foster user trust, and scale reach.',
    },
  },
  {
    id: 's6',
    iconName: 'PenTool',
    title: { ar: 'صناعة المحتوى الإبداعي', en: 'Creative Content Creation' },
    description: {
      ar: 'إنتاج محتوى فيديو، صور ونصوص تسويقية بروح خليجية وعالمية عصرية تجذب انتباه الفئات والشركاء المستهدفين.',
      en: 'Producing high-end visuals, cinematic videos, and compelling copy optimized for modern Gulf and global audiences.',
    },
  },
];

export const reasons: StatItem[] = [
  {
    id: 'r1',
    value: '01',
    label: { ar: 'حلول رقمية مبتكرة', en: 'Innovative Digital Solutions' },
    description: {
      ar: 'نطبق أحدث تقنيات التطوير ونماذج التحليل لضمان مرونة وجودة تضاهي الشركات التقنية العالمية.',
      en: 'We craft and leverage advanced software structures and data metrics to ensure top-tier reliability and output.',
    },
  },
  {
    id: 'r2',
    value: '02',
    label: { ar: 'خبرة تسويقية ريادية', en: 'Regional Marketing Expertise' },
    description: {
      ar: 'فريق متخصص بامتياز يفهم سلوك المستهلك في منطقة الخليج العربي ويصنع حملات ذات صدى قوي.',
      en: 'A stellar multidisciplinary team deeply rooted in Gulf consumer psychology and culture.',
    },
  },
  {
    id: 'r3',
    value: '03',
    label: { ar: 'تركيز كامل على تجربة المستخدم', en: 'User-Centric Approach' },
    description: {
      ar: 'نهتم بأدق تفاصيل الواجهات وتجربة الاستخدام لنجعل تطبيقات برامجنا يسيرة ومحبوبة للغاية بالنسبة لكافة الفئات.',
      en: 'We obsessionally polish accessibility, flows, and interactive UI micro-movements to foster lasting satisfaction.',
    },
  },
  {
    id: 'r4',
    value: '04',
    label: { ar: 'نمو مستدام طويل الأمد', en: 'Long-Term Growth Strategy' },
    description: {
      ar: 'نعمل وفق استراتيجيات بعيدة المدى تحمي استثماراتنا وتطور منصاتنا باستمرار لمواكبة التغيرات المستقبلية.',
      en: 'Focusing on robust architecture and scalable revenue frameworks to futureproof and scale digital products.',
    },
  },
];

export const trustStats = [
  { value: '4M+', label: { ar: 'إجمالي المشاهدات والوصول', en: 'Total Campaign Reach' } },
  { value: '120K+', label: { ar: 'مستخدماً نشطاً لمنصاتنا', en: 'Platform Users' } },
  { value: '98%', label: { ar: 'درجة رضا الشركاء والمصممين', en: 'Partner Satisfaction' } },
  { value: '100%', label: { ar: 'بيئة تقنية ومستدامة آمنة', en: 'Gulf Ownership & Data Safety' } },
];
