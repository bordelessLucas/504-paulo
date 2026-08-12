import { useState, type FormEvent } from 'react';

import SectionHeading from './SectionHeading';

export default function Contact() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="section contact" id="contato">
      <div className="section-index" aria-hidden="true">
        06 / CONTATO
      </div>
      <div className="container contact__layout">
        <div className="contact__intro">
          <SectionHeading
            eyebrow="Contato"
            title="Converse com a Vertek sobre a sua operação."
            text="Compartilhe o contexto da empresa e a solução de interesse. O próximo passo é entender processo, responsabilidade e necessidade real."
          />
          <a href="mailto:contato@vertek.app" className="contact__email motion-rise" data-reveal>
            contato@vertek.app <span aria-hidden="true">→</span>
          </a>
        </div>
        <form className="contact-form motion-rise" data-reveal onSubmit={submit}>
          <label>
            <span>Nome</span>
            <input required name="name" autoComplete="name" placeholder="Seu nome" />
          </label>
          <label>
            <span>E-mail corporativo</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nome@empresa.com.br"
            />
          </label>
          <label>
            <span>Empresa</span>
            <input
              required
              name="company"
              autoComplete="organization"
              placeholder="Nome da empresa"
            />
          </label>
          <label>
            <span>Interesse</span>
            <select name="interest" defaultValue="">
              <option value="" disabled>
                Selecione uma opção
              </option>
              <option>Vertek Ops</option>
              <option>Vertek Avalia</option>
              <option>Ambos</option>
            </select>
          </label>
          <label className="contact-form__wide">
            <span>Mensagem</span>
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Conte brevemente sobre a sua operação e o que precisa organizar."
            ></textarea>
          </label>
          <div className="contact-form__footer contact-form__wide">
            <p>
              {sent
                ? 'Mensagem registrada na interface. Conecte este formulário ao seu backend ou serviço de e-mail para envio em produção.'
                : 'Ao enviar, você inicia um contato institucional com a Vertek.'}
            </p>
            <button className="button button--accent" type="submit">
              Enviar contato
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
