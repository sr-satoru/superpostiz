export const dynamic = 'force-dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Labs - Termos de Serviço',
  description: 'Termos de Serviço do Labs',
};

export default function Terms() {
  return (
    <>
      <div className="termos-page-header">
        <h1 className="termos-page-header__title">Termos de Serviço</h1>
        <p className="termos-page-header__subtitle">Última atualização: Maio de 2026</p>
      </div>

      <section className="termos-section">
        <h2 className="termos-section__title">1. Aceitação dos Termos</h2>
        <div className="termos-section__body">
          <p>
            Bem-vindo ao Labs. Ao acessar ou usar a nossa plataforma e serviços, você concorda em ficar vinculado e cumprir os presentes Termos de Serviço. Se você não concordar com qualquer parte destes termos, por favor, não utilize nossos serviços.
          </p>
        </div>
      </section>

      <section className="termos-section">
        <h2 className="termos-section__title">2. Uso dos Serviços</h2>
        <div className="termos-section__body">
          <p>
            Você concorda em utilizar nossos serviços apenas para fins lícitos e de acordo com as normas estipuladas. É estritamente proibido o uso da plataforma para atividades ilegais, difamação, fraude ou qualquer ação que possa prejudicar outros usuários ou a integridade técnica do sistema.
          </p>
        </div>
      </section>

      <section className="termos-section">
        <h2 className="termos-section__title">3. Propriedade Intelectual</h2>
        <div className="termos-section__body">
          <p>
            Todo o conteúdo, design, marca, gráficos e recursos do Labs são propriedades exclusivas da plataforma ou devidamente licenciados. O acesso aos serviços não lhe concede direitos de cópia, modificação, revenda ou distribuição não autorizada de qualquer parte do nosso código ou material criativo.
          </p>
        </div>
      </section>

      <section className="termos-section">
        <h2 className="termos-section__title">4. Alterações nos Termos</h2>
        <div className="termos-section__body">
          <p>
            Reservamo-nos o direito de modificar, adicionar ou remover partes destes Termos de Serviço a qualquer momento. Procuraremos notificar os usuários sobre mudanças substanciais, mas recomendamos verificar esta página regularmente. O uso continuado da plataforma após as alterações caracteriza aceitação dos novos termos.
          </p>
        </div>
      </section>
    </>
  );
}
