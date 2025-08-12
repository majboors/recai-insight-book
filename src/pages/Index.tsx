import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ApiTokenDialog from "@/components/ApiTokenDialog";

const links = [
  { to: "/test/health", title: "Health", desc: "GET /v1/health" },
  { to: "/test/instances", title: "Instances", desc: "Workspace management CRUD" },
  { to: "/test/categories", title: "Categories", desc: "Initialize, add, rename, delete" },
  { to: "/test/receipts", title: "Receipts", desc: "Upload, get, patch" },
  { to: "/test/transactions-budgets", title: "Transactions & Budgets", desc: "List transactions, budgets" },
  { to: "/test/reports-graphs-export", title: "Reports / Graphs / Export", desc: "Numeric reports, charts, CSV" },
  { to: "/test/insights-advice", title: "Insights / Advice / Chat", desc: "AI endpoints" },
];

export default function Index() {
  useEffect(() => { document.title = "API Test Console | Receipt Zen"; }, []);
  return (
    <main className="min-h-screen bg-gradient-landing-hero">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container-zen flex items-center justify-between h-16">
          <h1 className="text-2xl font-medium heading-zen">Receipt Zen – API Console</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container-zen py-8 space-zen">
        <div className="card-zen">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-medium heading-zen">Quick Start</h2>
              <p className="text-zen max-w-2xl mx-auto">
                Configure your API settings and explore the powerful features of Receipt Zen
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((l) => (
                <div key={l.to} className="card-minimal group hover:shadow-medium">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium heading-zen group-hover:text-primary transition-colors">
                        {l.title}
                      </h3>
                      <p className="text-zen text-sm">{l.desc}</p>
                    </div>
                    <Button asChild className="btn-zen w-full">
                      <Link to={l.to}>Explore</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
