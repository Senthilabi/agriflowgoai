import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard = ({ label, value, sub, icon, trend }: MetricCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-display mt-1">{value}</p>
          {sub && (
            <p className={`text-xs mt-1 ${
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
