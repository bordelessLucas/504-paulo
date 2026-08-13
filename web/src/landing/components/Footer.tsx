import Brand from './Brand';
import ProductCta from './ProductCta';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <Brand />
          <p>Tecnologia institucional para operação e desempenho.</p>
        </div>
        <div className="footer__links">
          <div>
            <span>Navegação</span>
            <a href="#institucional">Institucional</a>
            <a href="#como-atuamos">Como atuamos</a>
            <a href="#capacidades">Capacidades</a>
            <a href="#contato">Contato</a>
          </div>
          <div>
            <span>Soluções</span>
            <a href="#ops">Vertek Ops</a>
            <a href="#avalia">Vertek Avalia</a>
            <ProductCta productId="ops">Site do Ops</ProductCta>
            <ProductCta productId="avalia" href="/">
              Site do Avalia
            </ProductCta>
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} VERTEK</span>
        <span>Ops · Avalia</span>
      </div>
    </footer>
  );
}
