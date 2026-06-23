"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function AnalyticsChart({ data }: { data: { date: string; views: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" className="text-zinc-900 dark:text-zinc-150" stopOpacity={0.06} />
              <stop offset="100%" stopColor="currentColor" className="text-zinc-900 dark:text-zinc-150" stopOpacity={0.00} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="currentColor" 
            className="text-zinc-100 dark:text-zinc-800/40"
          />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: "currentColor" }} 
            className="text-zinc-400 dark:text-zinc-500 font-semibold"
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: "currentColor" }} 
            className="text-zinc-400 dark:text-zinc-500 font-semibold"
            axisLine={false}
            tickLine={false}
            dx={0}
          />
          <Tooltip 
            cursor={{ stroke: "currentColor", className: "text-zinc-200 dark:text-zinc-800", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 shadow-sm text-3xs font-semibold select-none">
                    <p className="text-zinc-400 dark:text-zinc-500">{payload[0].payload.date}</p>
                    <p className="text-zinc-900 dark:text-zinc-100 text-xs font-bold mt-0.5">
                      {payload[0].value} <span className="text-3xs font-normal text-zinc-500">reads</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="views" 
            stroke="currentColor" 
            className="text-zinc-900 dark:text-zinc-100"
            strokeWidth={1.8} 
            fill="url(#chartGradient)" 
            activeDot={{ r: 4, strokeWidth: 0, className: "fill-zinc-900 dark:fill-zinc-100" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
