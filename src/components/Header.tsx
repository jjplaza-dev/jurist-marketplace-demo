import Link from "next/link";
import { BellIcon, MailIcon, UserIcon } from "./icons";

// Mail, bell and user are placeholders for now: no handlers, no navigation.
const ICON_BUTTONS = [
  { label: "Messages", Icon: MailIcon },
  { label: "Notifications", Icon: BellIcon },
  { label: "Account", Icon: UserIcon },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Marketplace home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fb text-xl font-bold text-white">
            F
          </span>
          <span className="text-lg font-bold">Marketplace</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/create"
            className="mr-1 rounded-md bg-fb px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-fb-dark sm:mr-2 sm:px-4"
          >
            Create listing
          </Link>
          {ICON_BUTTONS.map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
