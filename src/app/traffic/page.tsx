import Link from 'next/link';
import { AlertList } from '../components/AlertList';
import { trafficEvents } from '../../data/trafficAlerts';

export default function TrafficPage() {
  return <main className="min-h-screen bg-[#eef7ed]"><div className="mx-auto max-w-4xl px-4 py-6 sm:px-6"><Link className="text-sm font-semibold text-[#176b2c]" href="/">← 返回路線搜尋</Link><div className="mt-5 rounded-[28px] bg-white p-5 shadow-soft"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#176b2c]">Traffic events</p><h1 className="mt-1 text-3xl font-bold">交通事件</h1><p className="mt-2 text-sm text-slate-500">查看事故、道路工程、擠塞及受影響路線。</p><div className="mt-5"><AlertList events={trafficEvents} mode="events" updates={[]} /></div></div></div></main>;
}
