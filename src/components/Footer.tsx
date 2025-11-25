export default function Footer() {
  return (
    <footer className='mt-12 bg-muted'>
      <div className='max-w-7xl mx-auto px-4 py-6 text-sm text-muted-foreground'>
        © {new Date().getFullYear()} jeesi.ai — Built for small & medium businesses.
      </div>
    </footer>
  );
}
