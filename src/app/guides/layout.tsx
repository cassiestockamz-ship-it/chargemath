import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — ChargeMath",
    default: "EV Charging Cost by State — ChargeMath",
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
