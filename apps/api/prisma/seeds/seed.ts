// import { PrismaClient, ListingType, PropertyCategory } from '@prisma/client';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';
// import 'dotenv/config';
// import * as fs from 'fs';
// import * as path from 'path';
// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//   },
// });

// async function uploadFileToS3(
//   filePath: string,
//   folder: string,
// ): Promise<string> {
//   const fileContent = fs.readFileSync(filePath);
//   const fileName = path.basename(filePath);
//   const ext = path.extname(filePath);
//   const uniqueKey = `${folder}/${path.basename(filePath, ext)}-${Date.now()}${ext}`;

//   await s3Client.send(
//     new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: uniqueKey,
//       Body: fileContent,
//       ContentType:
//         ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png',
//     }),
//   );

//   return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;
// }

// async function main() {
//   console.log('🌱 Starting database seeding...');

//   // 1. Clean existing data
//   await prisma.property.deleteMany();
//   await prisma.user.deleteMany();

//   const mockDir =
//     '/Users/macbook/Coding/remotely/buyootna/apps/mobile/src/assets/mock';

//   // 2. Upload Company Logos (1 to 50)
//   console.log('📤 Uploading 50 company logos to S3...');
//   const companyUrls: string[] = [];
//   for (let i = 1; i <= 50; i++) {
//     const localPath = path.join(mockDir, `company_${i}.jpg`);
//     if (fs.existsSync(localPath)) {
//       console.log(`Uploading company logo ${i}/50...`);
//       const url = await uploadFileToS3(localPath, 'companies');
//       companyUrls.push(url);
//     } else {
//       console.log(`Warning: Logo company_${i}.jpg not found!`);
//       companyUrls.push('');
//     }
//   }

//   // 3. Upload Property Images (1 to 50)
//   console.log('📤 Uploading 50 property images to S3...');
//   const propertyUrls: string[] = [];
//   for (let i = 1; i <= 50; i++) {
//     const localPath = path.join(mockDir, `property_${i}.jpg`);
//     if (fs.existsSync(localPath)) {
//       console.log(`Uploading property image ${i}/50...`);
//       const url = await uploadFileToS3(localPath, 'properties');
//       propertyUrls.push(url);
//     } else {
//       console.log(`Warning: Image property_${i}.jpg not found!`);
//       propertyUrls.push('');
//     }
//   }

//   // 4. Create 8 Real Estate Agency Companies
//   console.log('🏗️ Creating Real Estate Agency Companies...');
//   const realEstateCompanyNames = [
//     'الدار العقارية',
//     'شركة بابل العقارية',
//     'شركة ريماس العقارية',
//     'أوتاد العقارية',
//     'مجموعة الأوراق العقارية',
//     'شركة يعقوب عبد العقارية',
//     'الشركة الكويتية للعقارات',
//     'شركة الاحمدي العقارية',
//   ];
//   const realEstateCompaniesMap = new Map<string, string>(); // name -> userId

//   for (let i = 0; i < realEstateCompanyNames.length; i++) {
//     const name = realEstateCompanyNames[i];
//     const email = `re_agency_${i + 1}@buyootna.com`;
//     // Assign one of the uploaded logos for these real estate companies
//     const logoUrl =
//       companyUrls[i] ||
//       'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80';

//     const user = await prisma.user.create({
//       data: {
//         email,
//         password: 'hashed_password_placeholder',
//         role: 'COMPANY',
//         companyProfile: {
//           create: {
//             name,
//             services: 'بيع • إيجار • بدل • إدارة أملاك • تسويق عقاري',
//             hqLocation: 'مدينة الكويت، العاصمة',
//             serviceAreas: 'جميع مناطق الكويت',
//             about: `شركة ${name} الرائدة في تقديم الخدمات العقارية المتكاملة وخدمات الوساطة في الكويت.`,
//             licenseActivity: 'وساطة عقارية',
//             licenseExpiry: new Date('2030-01-01').toISOString(),
//             logoUrl,
//             licenseFileUrl: 'https://example.com/license.pdf',
//           },
//         },
//       },
//     });
//     realEstateCompaniesMap.set(name, user.id);
//   }

//   // 5. Create 50 Service Companies
//   console.log('🏗️ Creating 50 Service Companies...');
//   const companiesData = JSON.parse(
//     fs.readFileSync(path.join(__dirname, 'companies.json'), 'utf-8'),
//   );

//   for (let i = 0; i < companiesData.length; i++) {
//     const c = companiesData[i];
//     const email = `service_company_${i + 1}@buyootna.com`;
//     const logoUrl = companyUrls[c.logoUrl] || '';

//     await prisma.user.create({
//       data: {
//         email,
//         password: 'hashed_password_placeholder',
//         role: 'COMPANY',
//         companyProfile: {
//           create: {
//             name: c.name,
//             services: c.category,
//             hqLocation: c.serviceArea,
//             serviceAreas: c.serviceArea,
//             about: `شركة ${c.name} المتخصصة والمحترفة في ${c.category} لخدمتكم بأفضل المعايير.`,
//             licenseActivity: c.filterTags.join(', '),
//             licenseExpiry: new Date('2029-05-20').toISOString(),
//             logoUrl,
//             licenseFileUrl: 'https://example.com/license.pdf',
//           },
//         },
//       },
//     });
//   }

//   // 6. Create 50 Properties
//   console.log('🏠 Creating 50 Properties...');
//   const propertiesData = JSON.parse(
//     fs.readFileSync(path.join(__dirname, 'properties.json'), 'utf-8'),
//   );

//   for (let i = 0; i < propertiesData.length; i++) {
//     const p = propertiesData[i];

//     // Map Listing Type
//     let type: ListingType = 'SALE';
//     if (p.category === 'rent') {
//       type = 'RENT';
//     } else if (p.category === 'exchange') {
//       type = 'EXCHANGE';
//     }

//     // Distribute Property Category (RESIDENTIAL, COMMERCIAL, INVESTMENT)
//     let category: PropertyCategory = 'RESIDENTIAL';
//     if (i % 3 === 1) {
//       category = 'COMMERCIAL';
//     } else if (i % 3 === 2) {
//       category = 'INVESTMENT';
//     }

//     // Map Images array of indices to the S3 URLs
//     const images: string[] = p.images.map(
//       (idx: number) => propertyUrls[idx] || '',
//     );

//     // Resolve owner user id
//     const userId =
//       realEstateCompaniesMap.get(p.companyName) ||
//       Array.from(realEstateCompaniesMap.values())[0];

//     await prisma.property.create({
//       data: {
//         userId,
//         type,
//         category,
//         isFeatured: p.isFeatured,
//         price: p.price,
//         area: p.area,
//         beds: p.beds,
//         baths: p.baths,
//         location: p.location,
//         description: `شقة مميزة معروضة من قبل ${p.companyName} بمساحة ${p.area} متر مربع، تحتوي على ${p.beds} غرف نوم و ${p.baths} حمامات. تشطيب سوبر ديلوكس في موقع مميز جداً بالقرب من كافة الخدمات والأنشطة التجارية.`,
//         images,
//       },
//     });
//   }

//   console.log('✅ Seeding completed successfully!');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Error during seeding:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
