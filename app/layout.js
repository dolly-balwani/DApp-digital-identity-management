import "./globals.css";

export const metadata = {
  title: "UcIDM — Blockchain Digital Identity Management DApp",
  description:
    "Blockchain-Based User-Centric Identity Management DApp implementing Privacy-Preserving Identity Verification using Zero-Knowledge Proofs. Based on the research paper: Blockchain and the Future of Digital Identity Management (ScienceDirect, 2025).",
  keywords: [
    "blockchain",
    "digital identity management",
    "self-sovereign identity",
    "ZKP",
    "zero-knowledge proof",
    "verifiable credentials",
    "DApp",
    "decentralized",
    "privacy",
    "smart contract",
    "6G",
    "autonomous transport",
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
