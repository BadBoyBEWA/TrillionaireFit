export function Footer() {
  return (
    <footer className="border-t border-zinc-200">
      <div className="container-responsive py-10 text-sm text-zinc-600 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} Trillionaire Fit. All rights reserved.
        </p>
        <nav className="flex items-center gap-6">
          <a className="hover:underline" href="#">Privacy</a>
          <a className="hover:underline" href="#">Terms</a>
          <a className="hover:underline" href="#">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
