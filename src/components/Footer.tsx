import { Link } from "react-router-dom";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              jeesi.ai
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.productsTitle')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.myAgents')}
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.community')}
                </Link>
              </li>
              <li>
                <Link to="/workspaces" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.workspaces')}
                </Link>
              </li>
              <li>
                <Link to="/billing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.companyTitle')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('footer.contactTitle')}</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:info@jeesi.ai" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  info@jeesi.ai
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://twitter.com/jeesi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/jeesi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/jeesi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} jeesi.ai — {t('footer.copyright')} 🇫🇮
          </p>
        </div>
      </div>
    </footer>
  );
}
