import Image from 'next/image'

import Section from '@/components/ui/Section'
import AccountAction from '@/components/ui/AccountAction'

const STEPS = [
  {
    icon: '/landing/feature-building.svg',
    iconSize: 28,
    title: 'أضف إعلانك',
    href: '/ads/new',
    body: 'اعرض عقارك أمام الباحثين عن فرص مناسبة للبيع أو الإيجار أو البدل، وأدر إعلانك بسهولة.',
    action: 'أضف إعلانك',
    primary: true,
  },
  {
    icon: '/landing/feature-alert.svg',
    iconSize: 24,
    title: 'أنشئ تنبيهًا',
    href: '/alerts/new',
    body: 'حدد ما تبحث عنه وسنساعدك على متابعة العقارات التي تطابق احتياجاتك لتصل إلى الفرص المناسبة.',
    action: 'أنشئ تنبيهًا',
    primary: false,
  },
  {
    icon: '/landing/feature-quote.svg',
    iconSize: 21,
    title: 'اطلب عرض سعر',
    href: '/quotes/new',
    body: 'أرسل طلبك إلى الشركات المتخصصة، واستقبل العروض المناسبة للخدمة التي تبحث عنها.',
    action: 'طلب عرض سعر',
    primary: false,
  },
]

/** "ابدأ بخطوتك التالية": the three things an account lets you do. */
export default function NextSteps() {
  return (
    <Section className="flex flex-col gap-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-bold tracking-[-0.48px] text-ink">
          ابدأ بخطوتك التالية
        </h2>
        <p className="max-w-138.25 text-base leading-normal font-medium text-muted md:text-lg">
          أنشئ إعلانك، احصل على تنبيهات مخصصة، أو اطلب عرضًا يناسب احتياجاتك كل
          ذلك بسهولة من خلال بيوتنا.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step) => (
          <article
            key={step.title}
            className="flex flex-col gap-8 rounded-lg bg-tag p-5"
          >
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex h-12 w-12 items-center justify-center">
                <Image
                  src={step.icon}
                  alt=""
                  width={step.iconSize}
                  height={step.iconSize}
                />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                <p className="text-[15px] leading-normal font-semibold tracking-[0.3px] text-muted">
                  {step.body}
                </p>
              </div>
            </div>
            {/* Each of these needs an account */}
            <AccountAction
              href={step.href}
              className={`flex h-12 items-center justify-center rounded-full text-sm font-bold transition ${
                step.primary
                  ? 'bg-brand text-white hover:bg-brand-dark'
                  : 'border border-[#E2E8F0] bg-white text-ink hover:bg-surface'
              }`}
            >
              {step.action}
            </AccountAction>
          </article>
        ))}
      </div>
    </Section>
  )
}
