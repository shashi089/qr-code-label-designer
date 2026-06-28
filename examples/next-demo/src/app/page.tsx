import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  LayoutGrid,
  Mic2,
  Printer,
  Server,
  Store,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Event Badge Studio — Next.js QR Layout Demo',
  description:
    'Design conference badges, session room signs, and exhibitor booth labels. Batch export via client PNG preview or server-side PDF/ZPL API routes.',
};

const modules = [
  {
    href: '/labels',
    title: 'Label Designer',
    description: 'Drag-and-drop templates with {{variable}} data binding',
    icon: LayoutGrid,
    color: 'from-indigo-500 to-violet-600',
  },
  {
    href: '/attendees',
    title: 'Attendee Badges',
    description: 'VIP, speaker, and standard pass badges for check-in',
    icon: Users,
    color: 'from-violet-500 to-purple-600',
  },
  {
    href: '/sessions',
    title: 'Session Signs',
    description: 'Room door labels for keynotes and workshops',
    icon: Mic2,
    color: 'from-purple-500 to-fuchsia-600',
  },
  {
    href: '/exhibitors',
    title: 'Exhibitor Booths',
    description: 'Sponsor hall booth labels with scannable QR codes',
    icon: Store,
    color: 'from-fuchsia-500 to-pink-600',
  },
];

export default function HomePage() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-12 sm:px-8'>
      <section className='mb-16 text-center'>
        <h1 className='mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
          Event &amp; Conference Badge Studio
        </h1>
        <p className='mx-auto max-w-2xl text-lg text-gray-600'>
          A demo for{' '}
          <a
            href='https://github.com/shashi089/qr-code-layout-generate-tool'
            className='font-medium text-indigo-600 hover:text-indigo-700'
          >
            QR Layout Tool
          </a>
          . Design once in the browser, then batch-print attendee badges,
          session signs, and exhibitor labels — with{' '}
          <strong>server-side ZPL and PDF export</strong> via Next.js API
          routes.
        </p>
      </section>

      <section className='mb-16 grid gap-6 sm:grid-cols-2'>
        {modules.map(({ href, title, description, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className='group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md'
          >
            <div
              className={`mb-4 inline-flex rounded-xl bg-linear-to-br ${color} p-3 text-white shadow-md`}
            >
              <Icon size={24} />
            </div>
            <h2 className='mb-2 text-xl font-semibold text-gray-900 group-hover:text-indigo-600'>
              {title}
            </h2>
            <p className='mb-4 text-gray-600'>{description}</p>
            <span className='inline-flex items-center gap-1 text-sm font-medium text-indigo-600'>
              Open module
              <ArrowRight
                size={16}
                className='transition-transform group-hover:translate-x-1'
              />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
