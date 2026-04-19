import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as linkService from '@/services/linkService';
import { Link as LinkType } from '@/lib/types';
import { Link2, Copy, Check, ArrowRight, Zap, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [shortenedLink, setShortenedLink] = useState<LinkType | null>(null);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleShorten = async () => {
    if (!url.trim()) return;
    try {new URL(url);} catch {toast.error('Please enter a valid URL');return;}
    try {
      const link = await linkService.createLink(url);
      setShortenedLink(link);
      setUrl('');
      toast.success('Link shortened!');
    } catch {
      toast.error('Failed to shorten link');
    }
  };

  const shortUrl = shortenedLink ? `${window.location.origin}/${shortenedLink.short_code}` : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(250_80%_58%_/_0.15),transparent)]" />
        <div className="container mx-auto px-4 pt-20 pb-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
              <Zap className="w-4 h-4" />
              Fast, secure, and powerful link management
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight">
              Shorten your links,{' '}
              <span className="gradient-text">amplify your reach</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Create short, memorable links with powerful analytics. Track clicks, understand your audience, and optimize your campaigns.
            </p>

            {/* URL Shortener Input */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-3 p-2 rounded-2xl bg-card border border-border shadow-lg">
                <div className="flex-1 flex items-center gap-2 pl-4">
                  <Link2 className="w-5 h-5 text-muted-foreground shrink-0" />
                  <Input
                    type="url"
                    placeholder="Paste your long URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                    className="border-0 bg-transparent focus-visible:ring-0 text-base" />
                  
                </div>
                <Button variant="hero" size="lg" onClick={handleShorten}>
                  Shorten
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {shortenedLink &&
              <div className="mt-6 p-4 rounded-xl bg-card border border-border animate-slide-up">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground truncate">{shortenedLink.original_url}</p>
                      <p className="text-lg font-semibold text-primary truncate">{shortUrl}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  {!user &&
                <p className="mt-3 text-sm text-muted-foreground">
                      <button onClick={() => navigate('/signup')} className="text-primary hover:underline font-medium">
                        Sign up
                      </button>
                      {' '}to track clicks and manage your links.
                    </p>
                }
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Everything you need to manage links</h2>
            <p className="mt-4 text-muted-foreground text-lg">Powerful features for individuals and teams</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
            { icon: Link2, title: 'Custom Short Links', desc: 'Create branded, memorable short URLs that reflect your identity.' },
            { icon: BarChart3, title: 'Detailed Analytics', desc: 'Track clicks, locations, devices, and browsers in real-time.' },
            { icon: Shield, title: 'Password Protection', desc: 'Secure sensitive links with password protection and expiration dates.' }].
            map((feature, i) =>
            <div key={i} className="stat-card text-center space-y-4" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 mx-auto rounded-xl gradient-bg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-display font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-muted-foreground">© 2026 SnipLink.</p>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/terms-and-conditions" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/refund-policy" className="text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}