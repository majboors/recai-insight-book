import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Apple, Chrome, MonitorSmartphone } from "lucide-react";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export default function AppInstall() {
  useEffect(() => {
    // SEO: Title, description, canonical, structured data
    document.title = "Install WalletWala App";

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMeta("description", "Install WalletWala as a PWA for fast, secure, offline-friendly expense tracking.");
    setMeta("viewport", "width=device-width, initial-scale=1");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.origin + "/install");

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "WalletWala",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Android, iOS, Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: "Install WalletWala PWA for quick receipt scanning and expense tracking.",
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      // Remove JSON-LD on unmount to avoid duplicates
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container-zen flex items-center justify-between h-16">
          <h1 className="heading-zen text-xl">Install WalletWala App</h1>
          <Badge variant="secondary">PWA</Badge>
        </div>
      </header>

      <main className="container-zen py-8 space-zen">
        <section aria-labelledby="install-cta">
          <Card className="card-zen">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle id="install-cta" className="heading-zen text-2xl">
                    Get WalletWala on your device
                  </CardTitle>
                  <CardDescription className="text-zen">
                    Install the app for faster access, offline support, and a native-like experience.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <PWAInstallButton publicMode variant="default" size="lg" className="btn-zen flex-1" />
              <Button variant="outline" size="lg" asChild className="flex-1">
                <a href="/" title="Back to Dashboard">Go to Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="instructions" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-zen">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Apple className="h-4 w-4 text-primary" />
                <CardTitle className="heading-zen text-lg">iOS (Safari)</CardTitle>
              </div>
              <CardDescription className="text-zen">Add to Home Screen</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-sm text-zen space-y-1">
                <li>Tap the Share button in Safari.</li>
                <li>Select "Add to Home Screen".</li>
                <li>Tap "Add" to confirm.</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="card-zen">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Chrome className="h-4 w-4 text-primary" />
                <CardTitle className="heading-zen text-lg">Android (Chrome)</CardTitle>
              </div>
              <CardDescription className="text-zen">Install from Chrome menu</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-sm text-zen space-y-1">
                <li>Tap the menu (three dots).</li>
                <li>Choose "Add to Home screen" or "Install app".</li>
                <li>Confirm to install.</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="card-zen">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-primary" />
                <CardTitle className="heading-zen text-lg">Desktop (Chrome/Edge)</CardTitle>
              </div>
              <CardDescription className="text-zen">Install from address bar</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-sm text-zen space-y-1">
                <li>Look for the install icon in the address bar.</li>
                <li>Or open the browser menu and select Install.</li>
                <li>Follow on-screen prompts.</li>
              </ol>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="benefits">
          <Card className="card-zen">
            <CardHeader>
              <CardTitle id="benefits" className="heading-zen text-xl">Why install?</CardTitle>
              <CardDescription className="text-zen">Enjoy the best WalletWala experience</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-zen">
                <li className="flex items-center gap-2"><Download className="h-4 w-4 text-success" /> Offline-friendly receipt scanning</li>
                <li className="flex items-center gap-2"><Download className="h-4 w-4 text-success" /> Faster startup and navigation</li>
                <li className="flex items-center gap-2"><Download className="h-4 w-4 text-success" /> Push notifications (where supported)</li>
                <li className="flex items-center gap-2"><Download className="h-4 w-4 text-success" /> Secure, native-like UI</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
