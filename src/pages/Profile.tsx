import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, MapPin, Edit, Settings, Heart, ShoppingBag, Coffee, Leaf, Plus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { UserService } from "@/services/userService";
import { SellerService } from "@/services/sellerService";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    memberSince: "",
    // Seller-specific fields
    businessName: "",
    businessHours: "",
    specialty: "coffee" as "coffee" | "matcha" | "both"
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.businessAddress || "",
        avatar: user.profileImage || "",
        memberSince: new Date(user.id).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        businessName: user.businessName || "",
        businessHours: user.businessHours || "",
        specialty: (user.specialty as any) || "coffee"
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update user profile
      await updateUser({
        name: profile.name,
        phone: profile.phone,
        profileImage: profile.avatar
      });

      // If seller, update seller-specific fields
      if (user.userType === 'seller') {
        await SellerService.updateSellerProfile(user.id, {
          name: profile.businessName, // Include the name field
          business_name: profile.businessName,
          address: profile.address,
          hours: profile.businessHours,
          specialty: profile.specialty,
          phone: profile.phone
        });
      }

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show loading if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const stats = user.userType === 'seller' ? [
    { label: "Profile Views", value: "127", icon: User },
    { label: "Contact Requests", value: "23", icon: Phone },
    { label: "Menu Items", value: "8", icon: Coffee },
  ] : [
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
          <div className="ml-auto flex items-center gap-3">
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
                  disabled={loading}
                  className="bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
                >
                  {loading ? "Saving..." : "Save"}
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
            <UserMenu variant="desktop" />
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
                {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name || 'User'}</h2>
              <p className="text-muted-foreground">Member since {profile.memberSince}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  Verified User
                </Badge>
                {user.userType === 'seller' && (
                  <Badge variant="default" className="bg-gradient-matcha">
                    <Coffee className="w-3 h-3 mr-1" />
                    Seller
                  </Badge>
                )}
                {/* Debug info */}
                <Badge variant="outline" className="text-xs">
                  Type: {user.userType || 'undefined'}
                </Badge>
              </div>
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

            {/* Seller-specific fields */}
            {user.userType === 'seller' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  {isEditing ? (
                    <Input
                      id="businessName"
                      value={profile.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      <Coffee className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.businessName || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessHours">Business Hours</Label>
                  {isEditing ? (
                    <Input
                      id="businessHours"
                      value={profile.businessHours}
                      onChange={(e) => handleInputChange("businessHours", e.target.value)}
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.businessHours || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  {isEditing ? (
                    <select
                      id="specialty"
                      value={profile.specialty}
                      onChange={(e) => handleInputChange("specialty", e.target.value)}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="coffee">Coffee</option>
                      <option value="matcha">Matcha</option>
                      <option value="both">Both</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      {profile.specialty === 'matcha' ? (
                        <Leaf className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Coffee className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">{profile.specialty}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {user.userType === 'seller' ? (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/seller-dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Seller Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/add-listing")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/orders")}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                View Order History
              </Button>
            )}
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
