import '../styles/globals.css';

export const metadata = {
  title: "Couples' Financial Uplifting & Budget Planner",
  description: "Combine salary inputs, track expenses, and plan financial growth together.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
