import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Plus, Camera, DollarSign, Coffee, Leaf, Upload, X, Check, AlertCircle, Tag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { DrinkService } from "@/services/drinkService";

const AddListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (user?.userType !== 'seller') {
      toast({
        title: "Access Denied",
        description: "Only sellers can add menu items.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    if (!user?.businessName) {
      toast({
        title: "Complete Your Profile",
        description: "Please complete your seller profile before adding menu items.",
        variant: "destructive",
      });
      navigate('/complete-profile');
      return;
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Please enter a valid price";
      }
    }
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
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

    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      console.log('🔄 Creating menu item...');

      // Create the drink using DrinkService
      const drinkData = {
        seller_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        is_available: true
      };

      const newDrink = await DrinkService.createDrink(drinkData);
      console.log('✅ Menu item created successfully:', newDrink.id);

      // TODO: Upload image if provided
      if (formData.image) {
        console.log('📸 Image upload will be implemented in future update');
      }

      toast({
        title: "🎉 Menu Item Added!",
        description: `${formData.name} has been added to your menu.`,
      });

      // Navigate back to seller dashboard
      navigate("/seller-dashboard");
    } catch (error: any) {
      console.error('❌ Error creating menu item:', error);
      toast({
        title: "Failed to Add Item",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category options based on seller's specialty
  const getCategoryOptions = () => {
    const baseCategories = ['hot', 'iced', 'specialty', 'seasonal'];
    if (user?.specialty === 'coffee') {
      return [...baseCategories, 'espresso', 'latte', 'cappuccino', 'americano'];
    } else if (user?.specialty === 'matcha') {
      return [...baseCategories, 'traditional', 'latte', 'bubble tea', 'dessert'];
    } else {
      return [...baseCategories, 'coffee', 'matcha', 'espresso', 'latte', 'traditional'];
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-matcha-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-primary/10 transition-colors duration-200 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Add Menu Item
              </h1>
              <p className="text-sm text-gray-600">Add a new item to {user.businessName}</p>
            </div>
          </div>
          <UserMenu variant="desktop" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Business Info Display */}
          <Card className="mb-8 bg-white/60 backdrop-blur-sm border-border/30 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-coffee-500 to-matcha-500 rounded-xl flex items-center justify-center">
                  {user.specialty === 'coffee' ? (
                    <Coffee className="w-6 h-6 text-white" />
                  ) : user.specialty === 'matcha' ? (
                    <Leaf className="w-6 h-6 text-white" />
                  ) : (
                    <Coffee className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{user.businessName}</h2>
                  <p className="text-sm text-gray-600">{user.businessAddress}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {user.specialty} Specialist
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Adding a new menu item to your {user.specialty} business
              </p>
            </div>
          </Card>

          {/* Menu Item Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-border/30 shadow-sm">
              <div className="p-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-coffee-500 to-matcha-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">New Menu Item</h2>
                    <p className="text-gray-600">Add a delicious item to your menu</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Item Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Item Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Ceremonial Matcha Latte"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`transition-all duration-200 bg-white/80 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-coffee-400'}`}
                    />
                    {errors.name && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">Dh</span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="50.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className={`pl-12 transition-all duration-200 bg-white/80 ${errors.price ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-coffee-400'}`}
                      />
                    </div>
                    {errors.price && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.price}</p>}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category *</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-md transition-all duration-200 bg-white/80 ${errors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-coffee-400'}`}
                      >
                        <option value="">Select category</option>
                        {getCategoryOptions().map(category => (
                          <option key={category} value={category} className="capitalize">
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.category && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Item Photo</Label>
                    <div className="space-y-3">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeImage}
                            className="absolute top-2 right-2 w-8 h-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-coffee-400 transition-colors duration-200 bg-white/40"
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload photo</p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item... ingredients, preparation method, taste notes, etc."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className={`transition-all duration-200 bg-white/80 resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-coffee-400'}`}
                  />
                  {errors.description && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
                </div>
              </div>
            </Card>

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
                className="bg-gradient-to-r from-coffee-500 to-matcha-500 hover:from-coffee-600 hover:to-matcha-600 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Menu
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
