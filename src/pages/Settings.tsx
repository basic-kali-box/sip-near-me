import { useState } from "react";
import { ArrowLeft, Bell, MapPin, Moon, Sun, Globe, Shield, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      promotions: false,
      newSellers: true,
      push: true,
      email: false,
      sms: true
    },
    location: {
      shareLocation: true,
      autoDetect: true,
      radius: "5"
    },
    appearance: {
      theme: "system",
      language: "en"
    },
    privacy: {
      profileVisible: true,
      shareOrderHistory: false,
      analytics: true
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
    
    toast({
      title: "Setting updated",
      description: "Your preference has been saved.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    // In a real app, this would clear auth tokens and redirect
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order-updates">Order Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about your order status</p>
              </div>
              <Switch
                id="order-updates"
                checked={settings.notifications.orderUpdates}
                onCheckedChange={(checked) => 
                  handleSettingChange("notifications", "orderUpdates", checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promotions">Promotions & Offers</Label>
                <p className="text-sm text-muted-foreground">Receive special deals and discounts</p>
              </div>
              <Switch
                id="promotions"
                checked={settings.notifications.promotions}
                onCheckedChange={(checked) => 
                  handleSettingChange("notifications", "promotions", checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-sellers">New Sellers</Label>
                <p className="text-sm text-muted-foreground">Know when new sellers join your area</p>
              </div>
              <Switch
                id="new-sellers"
                checked={settings.notifications.newSellers}
                onCheckedChange={(checked) => 
                  handleSettingChange("notifications", "newSellers", checked)
                }
              />
            </div>

            <Separator />
            
            <div className="space-y-3">
              <h3 className="font-medium">Notification Methods</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push">Push Notifications</Label>
                <Switch
                  id="push"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "push", checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email</Label>
                <Switch
                  id="email"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "email", checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sms">SMS</Label>
                <Switch
                  id="sms"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "sms", checked)
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Location</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="share-location">Share Location</Label>
                <p className="text-sm text-muted-foreground">Allow app to access your location</p>
              </div>
              <Switch
                id="share-location"
                checked={settings.location.shareLocation}
                onCheckedChange={(checked) => 
                  handleSettingChange("location", "shareLocation", checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-detect">Auto-detect Location</Label>
                <p className="text-sm text-muted-foreground">Automatically find sellers near you</p>
              </div>
              <Switch
                id="auto-detect"
                checked={settings.location.autoDetect}
                onCheckedChange={(checked) => 
                  handleSettingChange("location", "autoDetect", checked)
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label>Search Radius</Label>
              <Select
                value={settings.location.radius}
                onValueChange={(value) => 
                  handleSettingChange("location", "radius", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mile</SelectItem>
                  <SelectItem value="3">3 miles</SelectItem>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.appearance.theme}
                onValueChange={(value) => 
                  handleSettingChange("appearance", "theme", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.appearance.language}
                onValueChange={(value) => 
                  handleSettingChange("appearance", "language", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visible">Public Profile</Label>
                <p className="text-sm text-muted-foreground">Make your profile visible to sellers</p>
              </div>
              <Switch
                id="profile-visible"
                checked={settings.privacy.profileVisible}
                onCheckedChange={(checked) => 
                  handleSettingChange("privacy", "profileVisible", checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="share-history">Share Order History</Label>
                <p className="text-sm text-muted-foreground">Help improve recommendations</p>
              </div>
              <Switch
                id="share-history"
                checked={settings.privacy.shareOrderHistory}
                onCheckedChange={(checked) => 
                  handleSettingChange("privacy", "shareOrderHistory", checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics">Analytics</Label>
                <p className="text-sm text-muted-foreground">Help us improve the app</p>
              </div>
              <Switch
                id="analytics"
                checked={settings.privacy.analytics}
                onCheckedChange={(checked) => 
                  handleSettingChange("privacy", "analytics", checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/help")}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/terms")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Terms & Privacy
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
