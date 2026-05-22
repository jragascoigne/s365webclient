import { Label } from './ui/label';

export function RequiredLabel({ children, ...props }: any) {
  return (
    <Label {...props}>
      {children} <span className="required-marker" aria-hidden="true">*</span>
    </Label>
  );
}
