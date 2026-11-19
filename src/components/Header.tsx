import Link from "next/link";
import { BellIcon, MailIcon, PlusIcon, UserIcon } from "./icons";

// Mail, bell and user are placeholders for now: no handlers, no navigation.
const ICON_BUTTONS = [
  { label: "Messages", Icon: MailIcon },
  { label: "Notifications", Icon: BellIcon },
  { label: "Account", Icon: UserIcon },
];

export default function Header() {
  return (
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
          {/* Brand */}
          <Link
              href="/"
              className="flex min-w-0 shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb"
              aria-label="Marketplace home"
          >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fb text-xl font-bold text-white">
            F
          </span>
            <span className="hidden truncate text-lg font-bold tracking-tight sm:inline sm:text-xl">
            Marketplace
          </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
                href="/create"
                aria-label="Create listing"
                className="mr-0.5 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-fb px-3 text-sm font-semibold text-white transition-colors hover:bg-fb-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb focus-visible:ring-offset-2 sm:mr-2 sm:h-10 sm:rounded-md sm:px-4"
            >
              {/* Compact "+ Create" on mobile, full "Create listing" on sm+ */}
              <PlusIcon className="h-4 w-4 sm:hidden" aria-hidden="true" />
              <span className="sm:hidden">Create</span>
              <span className="hidden sm:inline">Create listing</span>
            </Link>

            <nav aria-label="Account and notifications" className="flex items-center gap-0.5 sm:gap-1.5">
              {ICON_BUTTONS.map(({ label, Icon }) => (
                  <button
                      key={label}
                      type="button"
                      aria-label={label}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100/80 text-gray-700 transition-colors hover:bg-gray-200/80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb sm:bg-transparent sm:text-gray-600 sm:hover:bg-gray-100"
                  >
                    <Icon />
                  </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
  );
}