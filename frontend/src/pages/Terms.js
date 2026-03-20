import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/14 blur-3xl animate-floaty" />
        <div className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/12 blur-3xl animate-floaty" style={{ animationDelay: '1.4s' }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl text-white/80">
          <h1 className="text-2xl font-bold mb-6">Términos de Servicio</h1>
          <p className="mb-4 text-sm">Última actualización: 20 de marzo de 2026</p>
          <p className="mb-6 text-sm">
            Bienvenido a SEO Analyzer Agency Suite. Estos términos rigen tu uso de nuestra plataforma de análisis SEO.
          </p>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">1. Aceptación de los términos</h2>
            <p className="text-sm mb-2">
              Al crear una cuenta y usar SEO Analyzer, aceptas estos términos y nuestra política de privacidad.
              Si no estás de acuerdo, no uses nuestro servicio.
            </p>
            <p className="text-sm">
              El uso continuado del servicio tras cambios en los términos constituye aceptación de los mismos.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">2. Descripción del servicio</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Análisis SEO:</strong> análisis técnico y de contenido de páginas web.</li>
              <li><strong>Informes IA:</strong> generación de informes optimizados con inteligencia artificial.</li>
              <li><strong>Historial:</strong> almacenamiento seguro de análisis anteriores.</li>
              <li><strong>Comparación:</strong> herramientas para comparar múltiples URLs.</li>
              <li><strong>Exportación:</strong> descarga de informes en PDF y CSV.</li>
              <li><strong>Gestión de sitios:</strong> organización por proyectos o clientes.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">3. Cuentas y registro</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Requisitos:</strong> debes ser mayor de edad y proporcionar información veraz.</li>
              <li><strong>Responsabilidad:</strong> eres responsable de mantener segura tu contraseña.</li>
              <li><strong>Cuentas por persona:</strong> solo se permite una cuenta por persona.</li>
              <li><strong>Suspensión:</strong> nos reservamos el derecho a suspender cuentas que violen estos términos.</li>
              <li><strong>Eliminación:</strong> puedes eliminar tu cuenta en cualquier momento desde ajustes.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">4. Planes y límites</h2>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Trial (Gratis):</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Hasta 10 análisis al día</li>
                  <li>Historial limitado a últimos 20</li>
                  <li>Informes básicos (sin IA avanzada)</li>
                  <li>Soporte por email (48-72h)</li>
                </ul>
              </div>
              <div>
                <strong>Paid:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Análisis ilimitados</li>
                  <li>Historial completo</li>
                  <li>Informes IA avanzados</li>
                  <li>Comparación de hasta 3 URLs</li>
                  <li>Exportación sin límites</li>
                  <li>Soporte prioritario (24h)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">5. Uso aceptable</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Permitido:</strong> analizar tus propias páginas o páginas con permiso.</li>
              <li><strong>Permitido:</strong> usar informes para mejorar tu SEO o el de clientes.</li>
              <li><strong>Permitido:</strong> exportar y compartir informes (con tu consentimiento).</li>
            </ul>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-sm">
              <li><strong>Prohibido:</strong> analizar sitios sin permiso.</li>
              <li><strong>Prohibido:</strong> usar la plataforma para spam o contenido ilegal.</li>
              <li><strong>Prohibido:</strong> revender o redistribuir acceso a nuestra API.</li>
              <li><strong>Prohibido:</strong> intentar eludir límites técnicos o de uso.</li>
              <li><strong>Prohibido:</strong> extraer datos masivamente de la plataforma.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">6. Propiedad intelectual</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Tu contenido:</strong> tú conservas todos los derechos sobre tus URLs y contenido analizado.</li>
              <li><strong>Tus informes:</strong> los informes generados son tuyos; no los reclamamos.</li>
              <li><strong>Nuestra plataforma:</strong> protegida por derechos de autor y propiedad industrial.</li>
              <li><strong>Marca:</strong> SEO Analyzer® y nuestros logos son marcas registradas.</li>
              <li><strong>Uso no autorizado:</strong> está prohibido copiar, modificar o distribuir nuestra tecnología.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">7. Privacidad y datos</h2>
            <p className="text-sm">
              Tu privacidad es importante. Revisa nuestra{' '}
              <a href="/privacy" className="text-cyan-400 underline hover:text-cyan-300 transition">
                Política de Privacidad
              </a>{' '}
              para entender cómo recopilamos, usamos y protegemos tus datos.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">8. Limitación de responsabilidad</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Disponibilidad:</strong> no garantizamos que el servicio esté disponible ininterrumpidamente.</li>
              <li><strong>Exactitud:</strong> los análisis SEO son orientativos; no nos hacemos responsables de decisiones de negocio.</li>
              <li><strong>Pérdidas:</strong> no somos responsables de pérdidas indirectas, consecuentes o punitivas.</li>
              <li><strong>Daños:</strong> nuestra responsabilidad máxima está limitada al importe pagado por ti.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">9. Terminación</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Por ti:</strong> puedes eliminar tu cuenta en cualquier momento.</li>
              <li><strong>Por nosotros:</strong> podemos suspender o terminar tu cuenta si violas estos términos.</li>
              <li><strong>Efectos:</strong> tras la terminación, se eliminarán tus datos según nuestra política de retención.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">10. Contacto y jurisdicción</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Soporte:</strong> para dudas sobre estos términos, contacta a legal@seoanalyzer.com</li>
              <li><strong>Jurisdicción:</strong> estos términos se rigen por las leyes de España.</li>
              <li><strong>Idioma:</strong> estos términos están en español. En caso de discrepancia, prevalece la versión en español.</li>
            </ul>
          </section>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-white/50">
              Al usar SEO Analyzer Agency Suite, aceptas estos términos y nuestra política de privacidad.
              Última actualización: 20 de marzo de 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
