export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-16">
      <div className="container mx-auto px-4 max-w-3xl prose-sm">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 16, 2026</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-display font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using SnipLink ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">2. Description of Service</h2>
            <p>SnipLink provides URL shortening, link management, analytics, and related services. We reserve the right to modify or discontinue any feature at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">4. Acceptable Use</h2>
            <p>You agree not to use the Service for any illegal, harmful, or abusive purpose. This includes but is not limited to distributing malware, phishing, spam, or infringing content.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">5. Payment and Billing</h2>
            <p>Paid plans are billed monthly. Prices are listed in EUR and may be subject to applicable taxes. You authorize us to charge your payment method on a recurring basis.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">6. Termination</h2>
            <p>We may suspend or terminate your access at any time for violation of these terms. You may cancel your subscription at any time through your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">7. Limitation of Liability</h2>
            <p>SnipLink is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">8. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">9. Contact</h2>
            <p>For questions about these terms, contact us at support@sniplink.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
