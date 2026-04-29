import { Link } from "react-router";

export default function PostWorkingPage() {
  return (
    <div className="space-y-4">
      <Link
        to="/hr/employee-analytics"
        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
      >
        ← Back to analytics
      </Link>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
        Post Working Hours
      </h1>
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-white/[0.03]">
        <p className="text-base font-medium text-gray-800 dark:text-white/90">Coming soon</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Awaiting backend endpoint <code>GET /hr/post-working/{`{date}`}</code>. See{" "}
          <code>docs/hr-api.md § 5</code>.
        </p>
      </div>
    </div>
  );
}
