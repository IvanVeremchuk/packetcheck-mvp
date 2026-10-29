// Download and run instructions for the scanner, shared by the home and docs pages.

export type OS = "windows" | "mac" | "linux";

export const SCANNERS: Record<OS, { label: string; file: string; run: string; oneLiner: string; where: string }> = {
  windows: {
    label: "Windows",
    file: "packetcheck-scan.ps1",
    run: "powershell -ExecutionPolicy Bypass -File $HOME\\Downloads\\packetcheck-scan.ps1",
    oneLiner: "irm https://packetcheck.net/scan/packetcheck-scan.ps1 | iex",
    where: "Open PowerShell (Start → type PowerShell) and paste:",
  },
  mac: {
    label: "macOS",
    file: "packetcheck-scan.sh",
    run: "sh ~/Downloads/packetcheck-scan.sh",
    oneLiner: "curl -fsSL https://packetcheck.net/scan/packetcheck-scan.sh | sh",
    where: "Open Terminal (Spotlight → Terminal) and paste:",
  },
  linux: {
    label: "Linux",
    file: "packetcheck-scan.sh",
    run: "sh ~/Downloads/packetcheck-scan.sh",
    oneLiner: "curl -fsSL https://packetcheck.net/scan/packetcheck-scan.sh | sh",
    where: "Open a terminal and paste:",
  },
};
