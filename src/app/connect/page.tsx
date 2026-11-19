import ConnectForm from "@/components/ConnectForm";
import { PLATFORM_FEE_PERCENT } from "@/lib/stripe";

export const metadata = { title: "Get paid · Marketplace" };

export default function ConnectPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Get paid for your listings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Connect a Stripe account so buyers can pay you directly. You&apos;ll finish a short, secure
          setup on Stripe&apos;s own site, then come back here. The marketplace keeps a {PLATFORM_FEE_PERCENT}%
          fee on each sale.
        </p>
        <div className="mt-6">
          <ConnectForm />
        </div>
      </div>
    </main>
  );
}
