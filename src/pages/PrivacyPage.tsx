export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-16">
      <div className="container mx-auto px-4 max-w-3xl prose-sm">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 16, 2026</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-display font-semibold mb-2">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account (email, password) and usage data such as IP addresses, browser type, device information, and click analytics on shortened links.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve the Service, process payments, send transactional communications, and generate anonymized analytics reports.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with trusted third-party service providers (payment processors, hosting) who assist in operating the Service, subject to confidentiality agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">4. Cookies</h2>
            <p>We use essential cookies for authentication and session management. Analytics cookies may be used to understand usage patterns. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">5. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active. Upon account deletion, we will remove your personal data within 30 days, except where required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. EU residents have additional rights under GDPR including data portability and the right to object to processing.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">8. Contact</h2>
            <p>For privacy-related inquiries, contact us at privacy@sniplink.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
