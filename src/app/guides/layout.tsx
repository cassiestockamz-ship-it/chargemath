import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Charging Cost by State",
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
