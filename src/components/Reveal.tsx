interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

export function Reveal({ children, delay = 0 }: RevealProps) {
  const delayClass = delay === 0.15 ? 'delay-150' : delay === 0.3 ? 'delay-300' : '';
  
  return (
    <div className={`animate-fade-in ${delayClass}`}>
      {children}
    </div>
  );
}
