export default function Footer() {
  return (
    <footer className="bg-card border-t border-border px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <div className="container mx-auto text-center text-muted-foreground text-xs sm:text-sm">
        <p className="border-t border-border pt-4">
          © {new Date().getFullYear()} Catholic Education Commission, Okigwe
          Diocese. <br />
          Powered by <span className="font-semibold text-primary">i3Hub</span> ·
          Secured by{" "}
          <span className="font-semibold text-secondary">I3SecureID</span>.{" "}
          <br />
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
