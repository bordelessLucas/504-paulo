import RevealText from './RevealText';

export default function AtmosphereBreak() {
  return (
    <section className="atmosphere-break" aria-label="Campo e escritório, mesmo padrão Vertek">
      <div className="atmosphere-break__image" data-parallax="0.045" aria-hidden="true"></div>
      <div className="atmosphere-break__shade" aria-hidden="true"></div>
      <div className="atmosphere-break__grid" aria-hidden="true"></div>
      <div className="container atmosphere-break__content">
        <p className="eyebrow motion-rise" data-reveal>
          Uma disciplina operacional
        </p>
        <RevealText as="h2">Campo e escritório, mesmo padrão Vertek.</RevealText>
        <div className="atmosphere-break__line motion-line" data-reveal>
          <span>EXECUÇÃO</span>
          <i></i>
          <span>GOVERNANÇA</span>
          <i></i>
          <span>DECISÃO</span>
        </div>
      </div>
    </section>
  );
}
