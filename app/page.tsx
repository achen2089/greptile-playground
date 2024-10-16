import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[#e6f7e6]">
      <main className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold text-[#2e8b57] mb-4">Greptile Playground</h1>
        <p className="text-lg text-[#006400] mb-6">Explore, Learn, and Master Greptile</p>
        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <Link href="/playground">
            <Button variant="default">
              Get Started
            </Button>
          </Link>
          <Link href="https://docs.greptile.com">
            <Button variant="outline">
              Documentation
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
