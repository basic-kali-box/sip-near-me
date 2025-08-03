import { useState } from "react";
import { Plus, Camera, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddListingViewProps {
  className?: string;
}

export const AddListingView = ({ className }: AddListingViewProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    address: "",
    phone: "",
    hours: "",
    drinks: [{ name: "", description: "", price: "" }]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDrinkChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      drinks: prev.drinks.map((drink, i) => 
        i === index ? { ...drink, [field]: value } : drink
      )
    }));
  };

  const addDrink = () => {
    setFormData(prev => ({
      ...prev,
      drinks: [...prev.drinks, { name: "", description: "", price: "" }]
    }));
  };

  const removeDrink = (index: number) => {
    if (formData.drinks.length > 1) {
      setFormData(prev => ({
        ...prev,
        drinks: prev.drinks.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission - in a real app, this would send to backend
    toast({
      title: "Listing submitted!",
      description: "Your drink listing is now pending approval.",
    });
  };

  return (
    <div className={`h-full overflow-y-auto ${className}`}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-sunrise rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Add Your Listing</h1>
          <p className="text-muted-foreground">
            Share your delicious homemade drinks with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4 space-y-4 border-border/50">
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="name">Business/Seller Name</Label>
              <Input
                id="name"
                placeholder="e.g., Sarah's Fresh Juices"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty/Category</Label>
              <Input
                id="specialty"
                placeholder="e.g., Cold-pressed juices, Smoothie bowls"
                value={formData.specialty}
                onChange={(e) => handleInputChange("specialty", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address/Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="address"
                  placeholder="123 Main St, City, State"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Operating Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="hours"
                    placeholder="9AM-6PM"
                    value={formData.hours}
                    onChange={(e) => handleInputChange("hours", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Drinks Menu */}
          <Card className="p-4 space-y-4 border-border/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Drinks Menu</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDrink}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Drink
              </Button>
            </div>

            <div className="space-y-4">
              {formData.drinks.map((drink, index) => (
                <div key={index} className="p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Drink #{index + 1}</h3>
                    {formData.drinks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrink(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Drink Name</Label>
                      <Input
                        placeholder="e.g., Green Smoothie"
                        value={drink.name}
                        onChange={(e) => handleDrinkChange(index, "name", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="5"
                          value={drink.price}
                          onChange={(e) => handleDrinkChange(index, "price", e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="e.g., Fresh spinach, apple, and banana blend"
                      value={drink.description}
                      onChange={(e) => handleDrinkChange(index, "description", e.target.value)}
                      rows={2}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Photo Upload */}
          <Card className="p-4 space-y-4 border-border/50">
            <h2 className="text-lg font-semibold text-foreground">Photos</h2>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Add photos of your drinks and setup
              </p>
              <Button variant="outline" type="button">
                Choose Photos
              </Button>
            </div>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            Submit Listing
          </Button>
        </form>

        {/* Bottom padding for mobile navigation */}
        <div className="h-20 md:h-4" />
      </div>
    </div>
  );
};