import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Camera, DollarSign, Coffee, Leaf, Upload, X, Check, AlertCircle, Tag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { DrinkService } from "@/services/drinkService";
import { SellerService } from "@/services/sellerService";

const EditListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useUser();
  const { itemId } = useParams<{ itemId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing item data
  useEffect(() => {
    const loadItem = async () => {
      if (!itemId) {
        toast({
          title: "Invalid Item",
          description: "No item ID provided.",
          variant: "destructive",
        });
        navigate('/seller-dashboard');
        return;
      }

      try {
        const item = await DrinkService.getDrinkById(itemId);
        if (!item) {
          toast({
            title: "Item Not Found",
            description: "The requested item could not be found.",
            variant: "destructive",
          });
          navigate('/seller-dashboard');
          return;
        }

        // Check if user owns this item
        if (item.seller_id !== user?.id) {
          toast({
            title: "Access Denied",
            description: "You can only edit your own items.",
            variant: "destructive",
          });
          navigate('/seller-dashboard');
          return;
        }

        // Populate form with existing data
        setFormData({
          name: item.name,
          description: item.description || "",
          price: item.price.toString(),
          category: item.category || "",
          image: null
        });

        if (item.photo_url) {
          setImagePreview(item.photo_url);
        }

      } catch (error: any) {
        toast({
          title: "Error Loading Item",
          description: error.message || "Failed to load item data.",
          variant: "destructive",
        });
        navigate('/seller-dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user && itemId) {
      loadItem();
    }
  }, [user, itemId, navigate, toast]);

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    const checkSellerProfile = async () => {
      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }
      if (user?.userType !== 'seller') {
        toast({
          title: "Access Denied",
          description: "Only sellers can edit menu items.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Check if seller profile exists in database
      try {
        const sellerProfile = await SellerService.getSellerById(user.id);
        if (!sellerProfile || !sellerProfile.business_name || !sellerProfile.address || !sellerProfile.phone) {
          toast({
            title: "Complete Your Profile",
            description: "Please complete your seller profile before editing menu items.",
            variant: "destructive",
          });
          navigate('/complete-profile');
          return;
        }
      } catch (error) {
        console.error('Error checking seller profile:', error);
        toast({
          title: "Complete Your Profile",
          description: "Please complete your seller profile before editing menu items.",
          variant: "destructive",
        });
        navigate('/complete-profile');
        return;
      }
    };

    if (user) {
      checkSellerProfile();
    }
  }, [isAuthenticated, user, navigate, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a valid positive number';
      }
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (file: File) => {
    setFormData(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user || !itemId) return;

    setIsSubmitting(true);

    try {
      console.log('🔄 Updating menu item...');

      // Update the drink using DrinkService
      const drinkData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
      };

      await DrinkService.updateDrink(itemId, drinkData);
      console.log('✅ Menu item updated successfully');

      // TODO: Upload new image if provided
      if (formData.image) {
        console.log('📸 Image upload will be implemented in future update');
      }

      toast({
        title: "🎉 Menu Item Updated!",
        description: `${formData.name} has been updated successfully.`,
      });

      // Navigate back to seller dashboard
      navigate("/seller-dashboard");
    } catch (error: any) {
      console.error('❌ Error updating menu item:', error);
      toast({
        title: "Failed to Update Item",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-elegant">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/seller-dashboard')}
              className="flex items-center gap-1 md:gap-2 text-gray-700 hover:bg-coffee-50 hover:text-coffee-700 transition-colors duration-200 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">Edit Menu Item</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Update your menu item details</p>
            </div>
          </div>
          <UserMenu variant="desktop" />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Menu Item Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-border/30 shadow-sm">
              <div className="p-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-coffee-500 to-matcha-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Save className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Edit Menu Item</h2>
                    <p className="text-gray-600">Update your menu item details</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Item Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-coffee-600" />
                      Item Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Caramel Macchiato, Green Tea Latte"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`h-12 border-gray-300 focus:border-coffee-500 focus:ring-coffee-500 ${
                        errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your drink - ingredients, taste, special features..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={`min-h-[100px] border-gray-300 focus:border-coffee-500 focus:ring-coffee-500 resize-none ${
                        errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Price and Category Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Price (Dh)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="25.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className={`h-12 border-gray-300 focus:border-coffee-500 focus:ring-coffee-500 ${
                          errors.price ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.price}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        Category
                      </Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className={`w-full h-12 px-3 border border-gray-300 rounded-md bg-white focus:border-coffee-500 focus:ring-coffee-500 focus:outline-none ${
                          errors.category ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                        disabled={isSubmitting}
                      >
                        <option value="">Select a category</option>
                        <option value="coffee">☕ Coffee</option>
                        <option value="matcha">🍵 Matcha</option>
                        <option value="tea">🫖 Tea</option>
                        <option value="cold-brew">🧊 Cold Brew</option>
                        <option value="specialty">⭐ Specialty</option>
                        <option value="seasonal">🍂 Seasonal</option>
                      </select>
                      {errors.category && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/seller-dashboard')}
                    className="flex items-center gap-2 hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Item
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
