import RevealText from './RevealText';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: 'left' | 'center';
};

export default function SectionHeading({
  eyebrow,
  title,
  text,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      {eyebrow ? (
        <p className="eyebrow motion-rise" data-reveal>
          {eyebrow}
        </p>
      ) : null}
      <RevealText as="h2">{title}</RevealText>
      {text ? (
        <p className="motion-rise" data-reveal>
          {text}
        </p>
      ) : null}
    </div>
  );
}
