import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as linkService from '@/services/linkService';
import { Link as LinkType } from '@/lib/types';
import { Plus, Copy, Trash2, QrCode, ExternalLink, Check, Lock, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import LinkAnalyticsPanel from '@/components/LinkAnalyticsPanel';
import DashboardStats from '@/components/DashboardStats';

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrLinkId, setQrLinkId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  useEffect(() => {
    linkService.getLinks().then(setLinks).catch(() => toast.error('Failed to load links'));
  }, []);

  const totalClicks = links.reduce((sum, l) => sum + l.total_clicks, 0);

  const handleCreate = async () => {
    if (!newUrl.trim()) return;
    try { new URL(newUrl); } catch { toast.error('Invalid URL'); return; }
    try {
      await linkService.createLink(newUrl, customCode || undefined, password || undefined, expiresAt || undefined);
      const updated = await linkService.getLinks();
      setLinks(updated);
      setNewUrl('');
      setCustomCode('');
      setPassword('');
      setExpiresAt('');
      setDialogOpen(false);
      toast.success('Link created!');
    } catch {
      toast.error('Failed to create link');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await linkService.deleteLink(id);
      const updated = await linkService.getLinks();
      setLinks(updated);
      if (selectedLinkId === id) setSelectedLinkId(null);
      toast.success('Link deleted');
    } catch {
      toast.error('Failed to delete link');
    }
  };

  const handleCopy = async (link: LinkType) => {
    const shortUrl = `${window.location.origin}/${link.short_code}`;
    await navigator.clipboard.writeText(shortUrl);
    setCopiedId(link.id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    const headers = ['Original URL', 'Short Code', 'Clicks', 'Created At'];
    const rows = links.map(l => [l.original_url, l.short_code, l.total_clicks, l.created_at]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sniplink-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your links and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4" /> New Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Create Short Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Destination URL *</Label>
                  <Input placeholder="https://example.com/long-url" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Custom short code (optional)</Label>
                  <Input placeholder="my-brand" value={customCode} onChange={e => setCustomCode(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Lock className="w-3 h-3" /> Password</Label>
                    <Input type="password" placeholder="Optional" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Clock className="w-3 h-3" /> Expires</Label>
                    <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                  </div>
                </div>
                <Button variant="hero" className="w-full" onClick={handleCreate}>Create Link</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats totalLinks={links.length} totalClicks={totalClicks} />

      {/* Links table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Link</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Short URL</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Clicks</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Created</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr
                  key={link.id}
                  className={`border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors ${selectedLinkId === link.id ? 'bg-accent/50' : ''}`}
                  onClick={() => setSelectedLinkId(link.id === selectedLinkId ? null : link.id)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2 min-w-0">
                      {link.password && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                      {link.expires_at && <Clock className="w-3 h-3 text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{link.title || link.original_url}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{link.original_url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-sm font-mono text-primary">{link.short_code}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent text-accent-foreground text-sm font-semibold">
                      {link.total_clicks}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                    {new Date(link.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(link)} title="Copy">
                        {copiedId === link.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setQrLinkId(qrLinkId === link.id ? null : link.id)} title="QR Code">
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Open">
                        <a href={link.original_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} title="Delete" className="hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {qrLinkId === link.id && (
                      <div className="mt-2 p-4 bg-card border border-border rounded-xl inline-block">
                        <QRCodeSVG value={`${window.location.origin}/${link.short_code}`} size={128} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Panel */}
      {selectedLinkId && (
        <LinkAnalyticsPanel linkId={selectedLinkId} />
      )}
    </div>
  );
}
