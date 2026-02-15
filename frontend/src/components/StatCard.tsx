import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'default' | 'green' | 'red' | 'blue' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, color = 'default' }) => {
  const colorStyles = {
    default: 'bg-white border-gray-200',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  return (
    <div className={cn("p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center", colorStyles[color])}>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
      {subtext && <span className="text-xs opacity-60 mt-1">{subtext}</span>}
    </div>
  );
};

export default StatCard;