import { useState } from "react";
import { ArrowLeft, User, Mail, Phone, MapPin, Edit, Settings, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, San Francisco, CA",
    avatar: "",
    memberSince: "January 2024"
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const stats = [
    { label: "Orders Placed", value: "12", icon: ShoppingBag },
    { label: "Favorites", value: "8", icon: Heart },
    { label: "Reviews", value: "5", icon: User },
  ];

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
          <h1 className="text-lg font-semibold">Profile</h1>
          <div className="ml-auto">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
                >
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl bg-gradient-sunrise text-primary-foreground">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">Member since {profile.memberSince}</p>
              <Badge variant="secondary" className="mt-2">
                Verified User
              </Badge>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Profile Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/orders")}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              View Order History
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              App Settings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/help")}
            >
              <User className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
