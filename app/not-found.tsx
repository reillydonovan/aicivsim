import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold" style={{ color: "var(--accent, #d4622a)" }}>
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold">Trajectory Not Found</h1>
      <p className="mt-3 max-w-md text-sm opacity-70">
        This page doesn&rsquo;t exist in any of the four scenarios. The URL may have
        changed, or the link that brought you here has drifted off the timeline.
      </p>
      <Link
        href="/"
        className="mt-8 rounded border px-6 py-3 text-sm font-medium hover:opacity-80"
      >
        Back to Home
      </Link>
    </div>
  );
}
