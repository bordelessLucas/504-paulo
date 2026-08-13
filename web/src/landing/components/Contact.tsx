import { useState, type FormEvent } from 'react';

import { EMAIL_REGEX } from '@/features/auth/validation';

import { getContactThrottleMessage, registerContactSend } from '../contact-throttle';
import SectionHeading from './SectionHeading';

const INTERESTS = ['Vertek Ops', 'Vertek Avalia', 'Ambos'] as const;

function trimField(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim()
    .slice(0, max);
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    if (trimField(data.get('bot-field'), 80)) {
      setSent(true);
      return;
    }

    const throttle = getContactThrottleMessage();
    if (throttle) {
      setError(throttle);
      return;
    }

    const name = trimField(data.get('name'), 80);
    const email = trimField(data.get('email'), 120).toLowerCase();
    const company = trimField(data.get('company'), 120);
    const interest = trimField(data.get('interest'), 40);
    const message = trimField(data.get('message'), 2000);

    if (name.length < 2) {
      setError('Informe seu nome.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Informe um e-mail corporativo válido.');
      return;
    }
    if (company.length < 2) {
      setError('Informe o nome da empresa.');
      return;
    }
    if (!INTERESTS.includes(interest as (typeof INTERESTS)[number])) {
      setError('Selecione o interesse.');
      return;
    }
    if (message.length < 10) {
      setError('Descreva a necessidade em pelo menos 10 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new URLSearchParams({
        'form-name': 'contato',
        name,
        email,
        company,
        interest,
        message,
      });

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!response.ok && !window.location.hostname.includes('localhost')) {
        throw new Error('send-failed');
      }

      registerContactSend();
      setSent(true);
      form.reset();
    } catch {
      setError('Não foi possível enviar agora. Escreva para contato@vertek.app.');
    } finally {
      setIsSubmitting(false);
    }
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
        <form
          className="contact-form motion-rise"
          data-reveal
          name="contato"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={(event) => void submit(event)}
        >
          <input type="hidden" name="form-name" value="contato" />
          <label className="contact-form__honeypot" aria-hidden="true">
            <span>Não preencha</span>
            <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
          <label>
            <span>Nome</span>
            <input
              required
              name="name"
              autoComplete="name"
              maxLength={80}
              placeholder="Seu nome"
            />
          </label>
          <label>
            <span>E-mail corporativo</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              maxLength={120}
              placeholder="nome@empresa.com.br"
            />
          </label>
          <label>
            <span>Empresa</span>
            <input
              required
              name="company"
              autoComplete="organization"
              maxLength={120}
              placeholder="Nome da empresa"
            />
          </label>
          <label>
            <span>Interesse</span>
            <select name="interest" defaultValue="" required>
              <option value="" disabled>
                Selecione uma opção
              </option>
              {INTERESTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="contact-form__wide">
            <span>Mensagem</span>
            <textarea
              required
              name="message"
              rows={5}
              maxLength={2000}
              placeholder="Conte brevemente sobre a sua operação e o que precisa organizar."
            ></textarea>
          </label>
          <div className="contact-form__footer contact-form__wide">
            <p>
              {sent
                ? 'Mensagem enviada. A equipe Vertek retorna pelo e-mail informado.'
                : 'Ao enviar, você inicia um contato institucional com a Vertek.'}
            </p>
            {error ? <p className="contact-form__error">{error}</p> : null}
            <button className="button button--accent" type="submit" disabled={sent || isSubmitting}>
              {isSubmitting ? 'Enviando...' : sent ? 'Enviado' : 'Enviar contato'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
