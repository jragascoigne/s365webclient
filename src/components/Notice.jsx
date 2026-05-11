import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from './ui/alert.jsx';

export function Notice({ children, error = false, className = '' }) {
  return (
    <Alert className={cn('notice', error && 'error', className)} variant={error ? 'destructive' : 'default'}>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
