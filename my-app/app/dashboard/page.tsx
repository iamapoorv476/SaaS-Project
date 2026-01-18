import React from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Overview</h2>
                <p className="text-slate-400 text-sm mt-1">Here is what is happening with your projects today.</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition shadow-lg shadow-blue-600/20 border border-blue-500">
                New Project
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Total Revenue" 
                value="$45,231" 
                trend="+20.1%" 
                trendUp={true} 
            />
            <StatCard 
                title="Active Projects" 
                value="12" 
                trend="+4" 
                trendUp={true} 
                subtext="from last month"
            />
             <StatCard 
                title="Avg. Completion Time" 
                value="14 Days" 
                trend="-1.2%" 
                trendUp={false} 
                isGood={true} 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-200 font-medium">Activity Overview</h3>
                    <select className="bg-slate-900 border border-white/10 text-slate-400 text-xs rounded-lg px-2 py-1 outline-none focus:border-blue-500/50">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                    </select>
                </div>
                <div className="w-full h-72 rounded-xl bg-gradient-to-b from-blue-500/5 to-transparent border border-blue-500/10 flex items-end justify-between px-4 pb-0 overflow-hidden relative">
                    
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-medium animate-pulse">
                        [ Chart Component Renders Here ]
                    </div>
                    {[40, 70, 45, 90, 60, 80, 50, 65, 30, 70].map((h, i) => (
                         <div key={i} style={{ height: `${h}%` }} className="w-full mx-1 bg-blue-500/20 rounded-t-sm hover:bg-blue-500/40 transition-all cursor-pointer relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-white/10">
                                Value: {h}
                            </div>
                         </div>
                    ))}
                </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm flex flex-col hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-200 font-medium">Recent Tasks</h3>
                    <button className="text-slate-500 hover:text-white transition"><MoreHorizontal size={16} /></button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    <TaskItem title="Redesign Landing Page" status="completed" date="2h ago" />
                    <TaskItem title="Fix API Authentication" status="in-progress" date="4h ago" />
                    <TaskItem title="Update Client Database" status="pending" date="1d ago" />
                    <TaskItem title="Deployment Pipeline" status="in-progress" date="2d ago" />
                    <TaskItem title="Q4 Marketing Plan" status="completed" date="3d ago" />
                </div>
                
                <button className="mt-auto pt-4 w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium border-t border-white/5">
                    View All Tasks
                </button>
            </div>
        </div>
    </div>
  );
}


interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    subtext?: string;
    isGood?: boolean; 
}

function StatCard({ title, value, trend, trendUp, subtext = "vs last month", isGood = true }: StatCardProps) {
    const isPositive = isGood ? trendUp : !trendUp;
    
    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:border-white/10 transition-all group">
             <div className="flex justify-between items-start">
                <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
                    isPositive 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </div>
             </div>
             <div className="mt-4">
                 <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                 <p className="text-xs text-slate-500 mt-1">{subtext}</p>
             </div>
        </div>
    );
}

interface TaskItemProps {
    title: string;
    status: 'completed' | 'in-progress' | 'pending';
    date: string;
}

function TaskItem({ title, status, date }: TaskItemProps) {
    const getStatusIcon = () => {
        switch(status) {
            case 'completed': return <CheckCircle2 size={16} className="text-emerald-400" />;
            case 'in-progress': return <Clock size={16} className="text-blue-400" />;
            case 'pending': return <AlertCircle size={16} className="text-amber-400" />;
        }
    };

    const getStatusColor = () => {
         switch(status) {
            case 'completed': return 'border-emerald-500/20 bg-emerald-500/5';
            case 'in-progress': return 'border-blue-500/20 bg-blue-500/5';
            case 'pending': return 'border-amber-500/20 bg-amber-500/5';
        }
    }

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-white/5 transition group cursor-pointer">
            <div className={`p-2 rounded-full border ${getStatusColor()}`}>
                {getStatusIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition truncate">{title}</p>
                <p className="text-xs text-slate-500">{date}</p>
            </div>
        </div>
    );
}