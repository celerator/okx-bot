export const metadata = {
  title: 'OKX Trading Bots Dashboard',
  description: 'Real-time OKX Grid Bots monitoring',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body className="bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
