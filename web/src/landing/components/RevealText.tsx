import type { CSSProperties, ElementType, ReactNode } from 'react';

type RevealTextProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
  baseDelay?: number;
};

export default function RevealText({
  as: Tag = 'span',
  children,
  className = '',
  id,
  baseDelay = 0,
}: RevealTextProps) {
  const text = String(children);
  const words = text.trim().split(/\s+/);

  return (
    <Tag className={`word-reveal ${className}`.trim()} id={id} data-reveal>
      {words.map((word, index) => (
        <span className="word-reveal__mask" key={`${word}-${index}`}>
          <span
            className="word-reveal__word"
            style={
              {
                '--word-index': index,
                '--word-base-delay': `${baseDelay}ms`,
              } as CSSProperties
            }
          >
            {word}
          </span>
          {index < words.length - 1 ? <>&nbsp;</> : null}
        </span>
      ))}
    </Tag>
  );
}
