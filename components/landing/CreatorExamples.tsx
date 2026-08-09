import Link from 'next/link';
import { ArrowRight, Check, Heart, Mic2, Paintbrush, Video } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Claim your name',
    copy: 'Pick a link people can remember—even after scrolling past 200 videos.',
  },
  {
    number: '02',
    title: 'Make it yours',
    copy: 'Add your links, products, services and personality. Especially the personality.',
  },
  {
    number: '03',
    title: 'Share it everywhere',
    copy: 'Drop it in your bios, QR codes and group chats. Watch the clicks and support roll in.',
  },
];

const creatorTypes = [
  { icon: Video, label: 'Content creators', tone: 'bg-secondary' },
  { icon: Paintbrush, label: 'Artists & designers', tone: 'bg-surface-pink' },
  { icon: Mic2, label: 'Coaches & experts', tone: 'bg-surface-blue' },
  { icon: Heart, label: 'Anyone with a thing', tone: 'bg-white' },
];

export function CreatorExamples() {
  return (
    <>
      <section id="how-it-works" className="scroll-mt-24 border-b border-border bg-card py-20 sm:py-28">
        <div className="page-shell">
          <div className="max-w-4xl">
            <p className="eyebrow">Easy does it</p>
            <h2 className="display-section mt-5">From “I need a website” to “link in bio” in three steps.</h2>
          </div>

          <div className="mt-14 grid border-y border-border md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.number} className={`py-8 md:px-8 md:py-10 ${index > 0 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-foreground font-black text-background">
                  {step.number}
                </span>
                <h3 className="mt-12 font-display text-3xl font-black tracking-[-0.04em] text-foreground">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-text-secondary">{step.copy}</p>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary">
                  <Check className="h-4 w-4" /> Done before your tea gets cold
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="made-for" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
        <div className="page-shell">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow">Made for your kind of busy</p>
              <h2 className="display-section mt-5">You make the thing. Your link should help sell it.</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
                Whether you post every day or disappear for a month to make something brilliant, LinkVerse keeps your best work open for business.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {creatorTypes.map(({ icon: Icon, label, tone }, index) => (
                <div key={label} className={`flex min-h-44 flex-col justify-between rounded-[28px] border border-ink p-5 text-ink ${tone} ${index % 2 ? 'sm:translate-y-6' : ''}`}>
                  <Icon className="h-6 w-6" />
                  <p className="font-display text-2xl font-black tracking-[-0.04em]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24 overflow-hidden rounded-[36px] border border-ink bg-primary px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">Your link is doing too little</p>
                <h2 className="mt-5 max-w-4xl font-display text-5xl font-black leading-[0.93] tracking-[-0.06em] sm:text-6xl lg:text-8xl">
                  Let’s give it a proper job.
                </h2>
              </div>
              <Link href="/signup" className="brand-button brand-button-lg shrink-0 bg-secondary text-ink hover:bg-white">
                Build yours free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
