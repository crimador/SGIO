import FulltextSearch from './FulltextSearch';
import AvatarDropdown from './ui/AvatarDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CommandComponent } from '@/components/CommandComponent';
import { NotificationBell } from '@/components/ui/notification-bell';

type Props = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

const Header = ({ id, name, email, avatar }: Props) => (
  <header className="relative flex h-16 shrink-0 items-center justify-between gap-4 px-5">
    {/* Search */}
    <div className="flex min-w-0 flex-1 max-w-sm">
      <FulltextSearch />
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2">
      <CommandComponent />
      <NotificationBell />
      <ThemeToggle />
      <div className="ml-1 h-6 w-px bg-border" />
      <AvatarDropdown avatar={avatar} userId={id} name={name} email={email} />
    </div>

    {/* Bottom accent line */}
    <div
      className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full"
      style={{ background: 'linear-gradient(to right, #FF7E00 0%, #FAC731 40%, transparent 100%)' }}
    />
  </header>
);

export default Header;
