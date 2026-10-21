import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container" style={{ paddingBlock: "var(--space-9)" }} aria-labelledby="nf-title">
      <p className="eyebrow">404</p>
      <h1 id="nf-title" style={{ marginTop: "var(--space-3)" }}>
        That page doesn&apos;t exist.
      </h1>
      <p className="muted" style={{ marginTop: "var(--space-4)", maxWidth: "var(--prose-max)" }}>
        You can go back to the homepage, or press <kbd>Ctrl</kbd> + <kbd>K</kbd> to jump anywhere.
      </p>
      <div style={{ marginTop: "var(--space-6)" }}>
        <Button href="/">Back to home</Button>
      </div>
    </section>
  );
}
