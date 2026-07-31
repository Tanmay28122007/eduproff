import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useSidebarOptional } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const footerLinks = {
  product: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/demo", label: "Demo Dashboard" },
    { href: "/verify", label: "Verify Certificate" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/support", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
  ],
};

export function Footer() {
  const sidebar = useSidebarOptional();
  const isSidebarCollapsible = sidebar !== null;
  const isSidebarOpen = sidebar?.open ?? false;

  return (
    <footer
      className={cn(
        "bg-card border-t border-border transition-[padding] duration-200 ease-linear",
        isSidebarCollapsible && (isSidebarOpen ? "md:pl-64" : "md:pl-12")
      )}
    >
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                EduProof
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-Powered Achievement Trust Platform. Verifying authentic achievements using multi-source evidence cross-validation and explainable confidence scores.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Product</h4>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} EduProof. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
