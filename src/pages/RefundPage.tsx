export default function RefundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-16">
      <div className="container mx-auto px-4 max-w-3xl prose-sm">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 16, 2026</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-display font-semibold mb-2">1. Subscription Cancellation</h2>
            <p>You may cancel your subscription at any time from your account settings. Upon cancellation, you will retain access to your plan's features until the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">2. Refund Eligibility</h2>
            <p>We offer a full refund within 14 days of your initial subscription purchase if you are not satisfied with the Service. Refund requests after 14 days will be evaluated on a case-by-case basis.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">3. How to Request a Refund</h2>
            <p>To request a refund, contact our support team at support@sniplink.com with your account email and reason for the refund. We aim to process all refund requests within 5-7 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">4. Non-Refundable Items</h2>
            <p>Partial month usage, account upgrades mid-cycle, and any add-on services are non-refundable unless otherwise stated.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">5. Chargebacks</h2>
            <p>If you initiate a chargeback through your payment provider, your account may be suspended pending investigation. We encourage contacting us directly before filing a dispute.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-2">6. Contact</h2>
            <p>For billing and refund inquiries, contact us at support@sniplink.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
