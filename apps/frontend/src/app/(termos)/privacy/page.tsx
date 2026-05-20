export const dynamic = 'force-dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Labs - Política de Privacidade',
  description: 'Política de Privacidade do Labs',
};

export default function Privacy() {
  return (
    <>
      <div className="termos-page-header">
        <h1 className="termos-page-header__title">Política de Privacidade</h1>
        <p className="termos-page-header__subtitle">
          Entenda como protegemos seus dados e sua privacidade.
        </p>
      </div>

      <section className="termos-section">
        <h2 className="termos-section__title termos-section__title--accent">
          Nosso Compromisso
        </h2>
        <div className="termos-section__body">
          <p>
            No Labs, levamos sua privacidade a sério. Esta Política de Privacidade explica de forma transparente como coletamos, utilizamos, armazenamos e protegemos as suas informações pessoais enquanto você interage e usufrui da nossa plataforma.
          </p>
        </div>
      </section>

      <section className="termos-section">
        <h2 className="termos-section__title">1. Informações que Coletamos</h2>
        <div className="termos-section__body">
          <p>
            Coletamos as informações estritamente necessárias que você nos fornece diretamente, seja ao criar uma conta, atualizar seu perfil ou solicitar suporte:
          </p>
          <ul className="termos-section__list">
            <li>Nome completo e endereço de e-mail;</li>
            <li>Dados de autenticação (armazenados e criptografados de forma segura);</li>
            <li>Informações técnicas de uso, navegação e interações dentro da plataforma.</li>
          </ul>
        </div>
      </section>

      <section className="termos-section">
        <h2 className="termos-section__title">2. Como Utilizamos os Dados</h2>
        <div className="termos-section__body">
          <p>
            O uso das informações tem como principal objetivo entregar, manter e evoluir os nossos serviços. Utilizamos seus dados para personalizar a sua experiência, autenticar seu acesso, enviar comunicados importantes sobre a conta e melhorar o desempenho e as funcionalidades da plataforma.
          </p>
        </div>
      </section>

      <section className="termos-section">
        <h2 className="termos-section__title">3. Segurança e Proteção</h2>
        <div className="termos-section__body">
          <p>
            Adotamos medidas rigorosas de segurança, tanto técnicas quanto organizacionais, para proteger todas as suas informações pessoais contra acesso não autorizado, alterações, divulgação ou destruição. Nosso banco de dados opera em ambiente blindado com criptografia em trânsito e em repouso.
          </p>
        </div>
      </section>

      <section className="termos-section">
        <h2 className="termos-section__title">4. Seus Direitos</h2>
        <div className="termos-section__body">
          <p>
            Você é o dono dos seus dados. Sendo assim, você tem o direito garantido de solicitar o acesso, a edição, a portabilidade ou até a exclusão total de suas informações pessoais do nosso banco de dados a qualquer momento. Para exercer esses direitos, entre em contato conosco.
          </p>
        </div>
      </section>
    </>
  );
}
