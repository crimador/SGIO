'use client';

import { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Landmark, Coins, Smartphone, Check, X, Plus } from 'lucide-react';

type Account = {
  id:            string;
  name:          string;
  type:          string;
  currency:      string;
  accountNumber: string | null;
  isActive:      boolean;
  entriesCount:  number;
};

type Props = { initialAccounts: Account[] };

const TYPE_LABELS: Record<string, string> = {
  BANQUE:       'Banque',
  CAISSE:       'Caisse',
  MOBILE_MONEY: 'Mobile Money',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  BANQUE:       <Landmark className="h-4 w-4" style={{ color: '#FF7E00' }} />,
  CAISSE:       <Coins className="h-4 w-4" style={{ color: '#FF7E00' }} />,
  MOBILE_MONEY: <Smartphone className="h-4 w-4" style={{ color: '#FF7E00' }} />,
};

const emptyForm = { name: '', type: 'BANQUE', currency: 'XOF', accountNumber: '', initialBalance: '' };

export function AccountsManager({ initialAccounts }: Props) {
  const { toast }  = useToast();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [loading, setLoading]   = useState(false);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId]     = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le nom est requis.' });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/finance/treasury', form);
      setAccounts((prev) => [...prev, { ...res.data, entriesCount: 0 }]);
      setForm(emptyForm);
      setOpen(false);
      toast({ title: 'Succès', description: 'Compte créé avec succès.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer le compte.' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (a: Account) => {
    setEditId(a.id);
    setEditForm({ name: a.name, type: a.type, currency: a.currency, accountNumber: a.accountNumber ?? '', initialBalance: '' });
  };

  const handleEdit = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.patch(`/api/finance/treasury/${id}`, editForm);
      setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, ...res.data } : a));
      setEditId(null);
      toast({ title: 'Succès', description: 'Compte mis à jour.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier le compte.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (account: Account) => {
    if (!confirm(`Supprimer / désactiver "${account.name}" ?`)) return;
    setLoading(true);
    try {
      await axios.delete(`/api/finance/treasury/${account.id}`);
      if (account.entriesCount > 0) {
        setAccounts((prev) => prev.map((a) => a.id === account.id ? { ...a, isActive: false } : a));
        toast({ title: 'Désactivé', description: 'Le compte a été désactivé (mouvements existants).' });
      } else {
        setAccounts((prev) => prev.filter((a) => a.id !== account.id));
        toast({ title: 'Supprimé', description: 'Compte supprimé.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le compte.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>Comptes de trésorerie</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {accounts.filter((a) => a.isActive).length} compte(s) actif(s)
            </p>
          </div>

          <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(emptyForm); }}>
            <button
              onClick={() => setOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              <Plus className="h-4 w-4" /> Nouveau compte
            </button>
            <SheetContent className="min-w-[480px]">
              <SheetHeader>
                <SheetTitle>Nouveau compte de trésorerie</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5 overflow-y-auto pb-10">
                <div className="space-y-1">
                  <Label htmlFor="c-name">Nom du compte *</Label>
                  <Input
                    id="c-name"
                    placeholder="Ex : ECOBANK, ORABANK, Caisse siège..."
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c-type">Type *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((p) => ({ ...p, type: v, accountNumber: '' }))}
                  >
                    <SelectTrigger id="c-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANQUE">Banque</SelectItem>
                      <SelectItem value="CAISSE">Caisse</SelectItem>
                      <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.type !== 'CAISSE' && (
                  <div className="space-y-1">
                    <Label htmlFor="c-num">
                      {form.type === 'BANQUE' ? 'Numéro de compte' : 'Numéro de téléphone'}
                    </Label>
                    <Input
                      id="c-num"
                      placeholder={form.type === 'BANQUE' ? 'Ex : 01234567890-12' : 'Ex : +228 90 00 00 00'}
                      value={form.accountNumber}
                      onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="c-currency">Devise</Label>
                  <Input
                    id="c-currency"
                    value={form.currency}
                    onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c-balance">Solde d&apos;ouverture (XOF)</Label>
                  <Input
                    id="c-balance"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0 — laisser vide si compte neuf"
                    value={form.initialBalance}
                    onChange={(e) => setForm((p) => ({ ...p, initialBalance: e.target.value }))}
                  />
                  <p className="text-xs text-gray-400">
                    Entrez le solde actuel si vous connectez un compte existant.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
                    style={{ color: '#1E1D3D' }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                  >
                    {loading ? 'Enregistrement...' : 'Créer le compte'}
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Compte</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>N° / Tél</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Devise</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Statut</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Mouvements</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-400">
                  Aucun compte — cliquez sur + pour en créer un
                </TableCell>
              </TableRow>
            )}
            {accounts.map((account) => (
              <TableRow
                key={account.id}
                className={`transition-colors hover:bg-[#FF7E00]/[0.04] ${!account.isActive ? 'opacity-50' : ''}`}
              >
                {editId === account.id ? (
                  <TableCell colSpan={6} className="py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Nom</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Type</Label>
                        <Select
                          value={editForm.type}
                          onValueChange={(v) => setEditForm((p) => ({ ...p, type: v, accountNumber: '' }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BANQUE">Banque</SelectItem>
                            <SelectItem value="CAISSE">Caisse</SelectItem>
                            <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {editForm.type !== 'CAISSE' && (
                        <div className="space-y-1">
                          <Label>{editForm.type === 'BANQUE' ? 'N° de compte' : 'N° de téléphone'}</Label>
                          <Input
                            placeholder={editForm.type === 'BANQUE' ? 'Ex : 01234567890-12' : 'Ex : +228 90 00 00 00'}
                            value={editForm.accountNumber}
                            onChange={(e) => setEditForm((p) => ({ ...p, accountNumber: e.target.value }))}
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <Label>Devise</Label>
                        <Input
                          value={editForm.currency}
                          onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => setEditId(null)}
                        disabled={loading}
                        className="flex h-8 items-center gap-1 rounded-md border px-3 text-sm font-medium hover:bg-gray-50"
                        style={{ color: '#1E1D3D' }}
                      >
                        <X className="h-3.5 w-3.5" /> Annuler
                      </button>
                      <button
                        onClick={() => handleEdit(account.id)}
                        disabled={loading}
                        className="flex h-8 items-center gap-1 rounded-md px-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                      >
                        <Check className="h-3.5 w-3.5" /> Enregistrer
                      </button>
                    </div>
                  </TableCell>
                ) : (
                  <>
                    <TableCell className="font-medium" style={{ color: '#1E1D3D' }}>{account.name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 text-gray-500">
                        {TYPE_ICONS[account.type]}
                        {TYPE_LABELS[account.type] ?? account.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">
                      {account.accountNumber ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-400">{account.currency}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        account.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'border border-gray-200 text-gray-500'
                      }`}>
                        {account.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {account.entriesCount} mvt{account.entriesCount > 1 ? 's' : ''}
                    </TableCell>
                  </>
                )}
                {editId !== account.id && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#FF7E00]/[0.08]"
                        onClick={() => startEdit(account)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-red-50"
                        onClick={() => handleDelete(account)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
