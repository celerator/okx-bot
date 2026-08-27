export const metadata = {
  title: 'OKX Bot Dashboard',
  description: 'Real-time OKX trading bots tracker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body className="bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
