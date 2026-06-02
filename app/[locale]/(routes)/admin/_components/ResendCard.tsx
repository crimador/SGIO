import { Mail, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ResendCard = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const configured = !!(gmailUser && gmailPass);

  return (
    <Card className="min-w-[350px] max-w-[450px] overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1E1D3D' }}>
          <Mail className="h-4 w-4" style={{ color: '#FF7E00' }} />
          Email (Gmail SMTP)
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          Configuration de l&apos;envoi d&apos;emails via Gmail.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {configured ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-gray-500">
            {configured
              ? `Configuré — ${gmailUser}`
              : 'Non configuré — ajoutez GMAIL_USER et GMAIL_APP_PASSWORD dans .env.local'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResendCard;
