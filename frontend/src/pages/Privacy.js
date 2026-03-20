import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/14 blur-3xl animate-floaty" />
        <div className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/12 blur-3xl animate-floaty" style={{ animationDelay: '1.4s' }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl text-white/80">
          <h1 className="text-2xl font-bold mb-6">Política de Privacidad</h1>
          <p className="mb-4 text-sm">Última actualización: 20 de marzo de 2026</p>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">1. Información que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Datos de la cuenta: nombre de usuario, email (cifrado).</li>
              <li>URLs analizadas y resultados de SEO (títulos, metas, scores, issues).</li>
              <li>Historial de análisis y preferencias de usuario.</li>
              <li>Informes generados y exportaciones (PDF/CSV).</li>
              <li>Datos de uso: páginas visitadas, tiempo de sesión, errores.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">2. ¿Cómo usamos tu información</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Para proporcionar el servicio:</strong> analizar URLs, generar informes SEO, guardar historial.</li>
              <li><strong>Para mejorar la plataforma:</strong> estadísticas de uso anónimas, detección de errores.</li>
              <li><strong>Para comunicarnos:</strong> responder a solicitudes de soporte, enviar actualizaciones.</li>
              <li><strong>Para seguridad:</strong> prevenir fraudes, detectar uso anómalo.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">3. Compartición de datos</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>No vendemos tu información:</strong> nunca venderemos tus datos a terceros.</li>
              <li><strong>No compartimos análisis:</strong> tus informes SEO son privados y solo tú puedes verlos.</li>
              <li><strong>Acceso restringido:</strong> solo tú y los administradores que autorices pueden acceder a tu cuenta.</li>
              <li><strong>Anonimización en estadísticas:</strong> los datos de uso globales no incluyen información personal.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">4. Almacenamiento y seguridad</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Cifrado:</strong> contraseñas hasheadas con bcrypt (12 rondas).</li>
              <li><strong>Tokens JWT:</strong> sesiones seguras con expiración.</li>
              <li><strong>Base de datos:</strong> MongoDB con acceso controlado y copias de seguridad.</li>
              <li><strong>HTTPS:</strong> todo el tráfico entre cliente y servidor está cifrado.</li>
              <li><strong>Retención:</strong> eliminamos datos de usuarios eliminados tras 30 días.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">5. Tus derechos</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Acceso:</strong> puedes solicitar una copia de todos tus datos en cualquier momento.</li>
              <li><strong>Rectificación:</strong> puedes corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> puedes solicitar eliminar tu cuenta y todos tus datos.</li>
              <li><strong>Portabilidad:</strong> puedes exportar tus datos en formato JSON/CSV.</li>
              <li><strong>Limitación:</strong> puedes oponerte al tratamiento de tus datos.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">6. Cookies y tracking</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Cookies esenciales:</strong> para mantener tu sesión y preferencias.</li>
              <li><strong>Cookies de análisis:</strong> para mejorar el servicio de forma anónima.</li>
              <li><strong>Control:</strong> puedes configurar tu navegador para rechazar cookies.</li>
              <li><strong>Third parties:</strong> usamos Google Fonts (tipografías) y Recharts (gráficos).</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">7. Contacto y cambios</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Email de privacidad:</strong> privacy@seoanalyzer.com</li>
              <li><strong>DPO (Data Protection Officer):</strong> disponible para consultas RGPD.</li>
              <li><strong>Notificaciones:</strong> te avisaremos por email si hay cambios importantes.</li>
              <li><strong>Versión:</strong> cualquier cambio significativo será comunicado con 30 días de antelación.</li>
            </ul>
          </section>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-white/50">
              Esta política se aplica a todos los usuarios de SEO Analyzer Agency Suite.
              Al usar nuestro servicio, aceptas las prácticas descritas aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
