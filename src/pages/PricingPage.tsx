import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaddle } from '@/hooks/use-paddle';
import { useCallback } from 'react';

const plans = [
  {
    name: '3 Months Plan',
    price: '€15',
    period: '3 months',
    pricePerMonth: '€5.00/mo',
    description: 'Get started with full access to the SnipLink platform.',
    features: [
      'Full access to the SnipLink platform',
      'URL shortening',
      'Analytics dashboard',
      'QR code generation',
      'Link management',
    ],
    popular: false,
    saving: null,
    priceId: 'pri_01kkt8vh213w3fj1dh2at0rjg3',
  },
  {
    name: '6 Months + 1 Free',
    price: '€25',
    period: '7 months',
    pricePerMonth: '€3.57/mo',
    description: 'More value with an extra free month included.',
    features: [
      'Everything in the 3 Months plan',
      'Priority support',
      'Custom short links',
    ],
    popular: false,
    saving: 'Save 29%',
    priceId: 'pri_01kktcr843ncyveg2rkn6zqyzk',
  },
  {
    name: '12 Months + 3 Free',
    price: '€35',
    period: '15 months',
    pricePerMonth: '€2.33/mo',
    description: 'Best value — our most popular plan.',
    features: [
      'Everything in the 6 Months plan',
      'Advanced analytics',
      'CSV export',
      'Password protected links',
    ],
    popular: true,
    saving: 'Save 53%',
    priceId: 'pri_01kktcsp7ryyjd8csay49jeshj',
  },
  {
    name: '24 Months + 3 Free',
    price: '€60',
    period: '27 months',
    pricePerMonth: '€2.22/mo',
    description: 'Maximum duration with top-tier features.',
    features: [
      'Everything in the 12 Months plan',
      'Smart redirect rules',
      'API access',
      'Highest priority support',
    ],
    popular: false,
    saving: 'Save 56%',
    priceId: 'pri_01kktcv7a542997m1ah58s9agv',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  const handleSuccess = useCallback(() => {
    navigate('/dashboard?payment=success');
  }, [navigate]);

  const { ready, openCheckout } = usePaddle(handleSuccess);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(250_80%_58%_/_0.15),transparent)]" />
        <div className="container mx-auto px-4 pt-20 pb-16 relative text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Choose your plan duration. Longer plans unlock more features and bigger savings.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col transition-all duration-200 hover:-translate-y-1 ${
                plan.popular
                  ? 'border-primary shadow-lg ring-2 ring-primary/20'
                  : 'hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg text-primary-foreground border-0 px-4">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
                <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.pricePerMonth} · {plan.period} access
                </p>
                {plan.saving && (
                  <Badge variant="secondary" className="mt-2 text-primary font-semibold">
                    {plan.saving}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 pt-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'hero' : 'outline'}
                  size="lg"
                  disabled={!ready}
                  onClick={() => openCheckout(plan.priceId)}
                >
                  {ready ? 'Subscribe' : 'Loading…'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground space-x-4">
          <Link to="/terms-and-conditions" className="hover:text-foreground underline-offset-4 hover:underline">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy-policy" className="hover:text-foreground underline-offset-4 hover:underline">Privacy Policy</Link>
          <span>·</span>
          <Link to="/refund-policy" className="hover:text-foreground underline-offset-4 hover:underline">Refund Policy</Link>
        </div>
      </section>
    </div>
  );
}
