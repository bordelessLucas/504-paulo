import { useEffect } from 'react';

export default function ScrollExperience() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('motion-ready');

    const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    revealItems.forEach((item) => observer.observe(item));

    const navLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.header__nav a[href^="#"]'),
    );
    const navSections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href') ?? ''))
      .filter((section): section is Element => Boolean(section));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${visible.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5] },
    );
    navSections.forEach((section) => sectionObserver.observe(section));

    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    let frame = 0;

    const updateScroll = () => {
      frame = 0;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      root.style.setProperty('--page-progress', progress.toFixed(4));
      root.classList.toggle('is-scrolled', window.scrollY > 32);

      parallaxItems.forEach((item) => {
        const speed = Number(item.dataset.parallax || 0.05);
        const rect = item.getBoundingClientRect();
        const centerDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
        const offset = centerDelta * speed * -1;
        item.style.setProperty('--parallax-offset', `${offset.toFixed(1)}px`);
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const onPointerMove = (event: PointerEvent) => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`);
      root.style.setProperty('--pointer-y', `${event.clientY}px`);
    };

    if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (finePointer) window.removeEventListener('pointermove', onPointerMove);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove('motion-ready', 'is-scrolled');
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <i />
      </div>
      <div className="pointer-aura" aria-hidden="true" />
    </>
  );
}
