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
  useEffect(() => { document.title = "API Test Console | Receipt Spending Analyzer"; }, []);
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-semibold">Receipt Spending Analyzer – API Test Console</h1>
          <ApiTokenDialog />
        </div>
      </header>
      <section className="container py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Set your API Base URL and Bearer token, then open a test page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((l) => (
                <Card key={l.to} className="border-muted-foreground/20">
                  <CardHeader>
                    <CardTitle className="text-base">{l.title}</CardTitle>
                    <CardDescription>{l.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="secondary"><Link to={l.to}>Open</Link></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
