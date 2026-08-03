export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
        Go back home
      </a>
    </div>
  )
}
