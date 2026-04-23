type WordmarkProps = {
  blink?: boolean;
  className?: string;
};

export default function Wordmark({ blink = false, className = "" }: WordmarkProps) {
  return (
    <span
      className={`font-mono font-medium tracking-[-0.5px] lowercase ${className}`}
    >
      iwrightcode
      {blink ? <span className="animate-blink">_</span> : <span>_</span>}
    </span>
  );
}
