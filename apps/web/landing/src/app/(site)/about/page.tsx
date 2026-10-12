import type { Metadata } from 'next'
import Image from 'next/image'

import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'عن بيوتنا — بيوتنا',
  description: 'بيوتنا منصتك العقارية الموثوقة في الكويت، من تطوير دار النخبة.',
}

const BODY = 'text-base leading-normal font-medium tracking-[-0.408px] text-ink'

export default function AboutPage() {
  return (
    <>
      <PageHeader title="عن بيوتنا" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 pt-4 pb-24 md:px-9">
        <section className="flex flex-col gap-6">
          <Image
            src="/landing/logo-full.png"
            alt="Buyootna"
            width={121}
            height={82}
          />
          <div className={BODY}>
            <p>
              تطبيق بيوتنا هو منصتك العقارية الموثوقة والذكية، المصممة خصيصاً
              لتغيير تجربة البحث عن العقارات وتسهيلها. نحن لسنا مجرد دليل عقاري،
              بل نحن حلقة الوصل الأكثر أماناً وسرعة بين الباحثين عن العقار،
              والملاك، والمكاتب المعتمدة.
            </p>
            <p>
              رؤيتنا أن نصبح الخيار الأول والمنصة الأكثر كفاءة وموثوقية في السوق
              العقاري، من خلال تقديم تجربة رقمية سلسة تعتمد على الابتكار
              والشفافية.
            </p>
            <p>
              تمكين الأفراد والشركات من اتخاذ قرارات عقارية ذكية وناجحة، وتسهيل
              رحلة الشراء، البيع، والإيجار بأقل خطوات وبأعلى معايير الأمان
              البصري والتقني.
            </p>
          </div>
        </section>

        <p className="text-lg leading-[1.3] font-medium text-[#A0A0A0]">
          تم انشاء وتطوير التطبيق بواسطة دار النخبة
        </p>

        <section className="flex flex-col gap-6">
          {/* The logo file is square with empty bands above and below */}
          <div className="relative h-20.5 w-32 overflow-hidden">
            <Image
              src="/landing/dar-alnokhba.png"
              alt="دار النخبة"
              width={128}
              height={128}
              className="absolute top-1/2 left-0 -translate-y-1/2"
            />
          </div>
          <div className={BODY}>
            <p>
              تأسست دار النخبة للدعاية والتسويق كشركة تقنية كويتية رائدة متخصصة
              في هندسة وبناء المنظومات الرقمية المتكاملة.
            </p>
            <p>
              وهي تمثل الكيان والمحرك الأساسي خلف مجموعة من أبرز المنتجات
              والحلول الذكية في السوق المحلي مثل منصة &quot;بيوتنا&quot;
              العقارية، ومنصة &quot;لبسي&quot; للأزياء، وتطبيق &quot;قطية&quot;
              للخدمات المالية.
            </p>
            <p>
              تستهدف الشركة قيادة الابتكار الرقمي في دولة الكويت عبر تقديم حلول
              مخصصة لكل قطاع بشكل مستقل (Vertical Solutions)، مبنية على جودة
              التصميم والفهم العميق لثقافة وبيئة المستخدم المحتسب، لبناء شراكات
              استراتيجية طويلة الأمد تضمن نمواً مستمراً وتواكب متطلبات السوق
              بمرونة واحترافية.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
