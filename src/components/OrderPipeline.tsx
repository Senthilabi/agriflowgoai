import { OrderStatus, STATUS_LABELS } from '@/types/domain';

const PIPELINE_STEPS: OrderStatus[] = [
  'ORDER_CREATED',
  'PRODUCER_ASSIGNED',
  'RAW_CONFIRMED',
  'PROCESSOR_ASSIGNED',
  'PROCESSING_STARTED',
  'PROCESSING_COMPLETED',
  'LOGISTICS_ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'SETTLED',
];

interface OrderPipelineProps {
  currentStatus: OrderStatus;
}

const OrderPipeline = ({ currentStatus }: OrderPipelineProps) => {
  const currentIndex = PIPELINE_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="flex items-center gap-2 text-destructive">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-sm font-medium">Order Cancelled</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {PIPELINE_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step} className="flex items-center flex-1 group" title={STATUS_LABELS[step]}>
                <div
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-success'
                      : isCurrent
                      ? 'bg-accent animate-pulse-glow'
                      : 'bg-muted'
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}
      {!isCancelled && (
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-muted-foreground">Created</span>
          <span className="text-xs font-medium text-foreground">{STATUS_LABELS[currentStatus]}</span>
          <span className="text-xs text-muted-foreground">Settled</span>
        </div>
      )}
    </div>
  );
};

export default OrderPipeline;
