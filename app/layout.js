import "./globals.css";

export const metadata = {
  title: "UcIDM — Blockchain Identity Management for 6G",
  description:
    "Privacy-Preserving Identity Verification for 6G Autonomous Transport using Blockchain and Zero-Knowledge Proofs. A User-Centric Identity Management DApp.",
  keywords: [
    "blockchain",
    "identity management",
    "ZKP",
    "zero-knowledge proof",
    "6G",
    "autonomous transport",
    "DApp",
    "decentralized",
    "privacy",
    "smart contract",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
