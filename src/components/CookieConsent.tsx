import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay appearance for smoother UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch {
        // Handle old format
      }
    }
  }, []);

  const handleClose = (newPreferences: CookiePreferences) => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem("cookie-consent", JSON.stringify(newPreferences));
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    handleClose(allAccepted);
  };

  const handleDeclineAll = () => {
    const onlyEssential = { essential: true, analytics: false, marketing: false };
    setPreferences(onlyEssential);
    handleClose(onlyEssential);
  };

  const handleSavePreferences = () => {
    setShowPreferences(false);
    handleClose(preferences);
  };

  if (!isVisible) return null;

  return (
    <>
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg transition-all duration-300 ${
          isClosing ? "animate-fade-out translate-y-full" : "animate-fade-in"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cookie className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPreferences(true)}
              className="gap-1"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeclineAll}>
              Decline
            </Button>
            <Button size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Customize which cookies you want to accept. Essential cookies cannot be disabled as they are required for the site to function.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Essential Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Required for basic site functionality
                </p>
              </div>
              <Switch checked disabled />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Analytics Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Help us improve by collecting usage data
                </p>
              </div>
              <Switch 
                checked={preferences.analytics} 
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Marketing Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Used for personalized advertisements
                </p>
              </div>
              <Switch 
                checked={preferences.marketing} 
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowPreferences(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
