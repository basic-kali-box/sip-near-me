import { useState, useRef, useEffect } from "react";
import { ArrowLeft, X, AlertCircle, Tag, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { UserMenu } from "@/components/UserMenu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { DrinkService } from "@/services/drinkService";
import { SellerService } from "@/services/sellerService";

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
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const checkSellerProfile = async () => {
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

      try {
        const sellerProfile = await SellerService.getSellerById(user.id);
        if (!sellerProfile || !sellerProfile.business_name || !sellerProfile.address || !sellerProfile.phone) {
          toast({
            title: "Complete Your Profile",
            description: "Please complete your seller profile before adding menu items.",
            variant: "destructive",
          });
          navigate('/complete-profile');
          return;
        }
      } catch (error) {
        console.error('Error checking seller profile:', error);
        toast({
          title: "Complete Your Profile",
          description: "Please complete your seller profile before adding menu items.",
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "A name is required for your delicious item.";
    if (!formData.description.trim()) newErrors.description = "A description helps customers know what they're getting!";
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Please enter a valid price (e.g., 50.00).";
      }
    }
    if (!formData.category.trim()) newErrors.category = "Please select a category.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;
    setIsSubmitting(true);

    try {
      const drinkData = {
        seller_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        is_available: true
      };

      const newDrink = await DrinkService.createDrink(drinkData);

      if (formData.image) {
        try {
          await DrinkService.uploadDrinkPhoto(newDrink.id, formData.image);
        } catch (imageError) {
          console.error('❌ Image upload failed:', imageError);
          toast({
            title: "Image Upload Failed",
            description: "Your item was added, but the photo upload failed. You can try again later from your dashboard.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "🎉 Your item is live!",
        description: `${formData.name} is now on your menu. Time to celebrate!`,
      });

      navigate("/seller-dashboard");
    } catch (error: any) {
      console.error('❌ Error creating menu item:', error);
      toast({
        title: "Failed to Add Item",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-matcha-50">
      {/* Animated Header */}
      <div className="relative bg-gradient-to-r from-coffee-500 to-matcha-600 px-6 pt-16 pb-8 text-center overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="animate-float-pattern absolute top-0 left-0 w-full h-full bg-repeat" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='2' fill='white'/%3E%3C/svg%3E")`,
                 backgroundSize: '100px 100px'
               }}>
          </div>
        </div>
        
        {/* Header Content */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">BrewNear</h1>
          <p className="text-white/90 text-lg mb-6 font-medium">Craft Your Menu Item</p>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-bounce-gentle">
            ☕
          </div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/20 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        {/* Enhanced User Menu */}
        <div className="absolute top-4 right-4 z-20">
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Menu Container */}
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-1.5 border border-white/30 shadow-lg hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl user-menu-glow">
              {/* Status Indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>

              {/* Seller Badge */}
              {user?.userType === 'seller' && (
                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-matcha-500 to-matcha-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg border border-white/20">
                  ✨ Seller
                </div>
              )}

              <UserMenu
                variant="desktop"
                className="text-white hover:bg-white/10 border-0 shadow-none [&>div>p]:text-white [&>div>p.text-muted-foreground]:text-white/80 [&>svg]:text-white/80 px-2 py-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 pb-24 -mt-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Let's Create */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 overflow-hidden animate-slide-up">
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                  ✨ Let's Create!
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Start by adding the key details of your new menu item.
                </p>
              </div>

              <div className="space-y-6">
                {/* Item Name */}
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Caramel Macchiato"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`h-12 px-4 bg-gray-50 border-2 transition-all duration-300 focus:bg-white focus:scale-[1.02] ${
                      errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-coffee-500'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className={`w-full h-12 pl-10 pr-4 bg-gray-50 border-2 rounded-lg appearance-none transition-all duration-300 focus:bg-white focus:scale-[1.02] ${
                        errors.category ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-coffee-500'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 12px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="">Choose a category</option>
                      {getCategoryOptions().map(category => (
                        <option key={category} value={category} className="capitalize">
                          {category === 'coffee' && '☕'} {category === 'tea' && '🍵'} 
                          {category === 'cold-drinks' && '🧊'} {category === 'smoothies' && '🥤'}
                          {category === 'pastries' && '🥐'} {category === 'snacks' && '🍪'} {category}
                        </option>
                      ))}
                    </select>
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.category && (
                    <p className="text-xs text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="w-3 h-3" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us what makes this item special..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className={`p-4 bg-gray-50 border-2 resize-none transition-all duration-300 focus:bg-white focus:scale-[1.02] ${
                      errors.description ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-coffee-500'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Photo & Price */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                  📸 Add a Photo & Price
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Make your item irresistible with a great picture!
                </p>
              </div>

              <div className="space-y-6">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className={`h-12 pl-12 bg-gray-50 border-2 transition-all duration-300 focus:bg-white focus:scale-[1.02] ${
                        errors.price ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-coffee-500'
                      }`}
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-600 font-semibold text-base">
                      Dh
                    </span>
                  </div>
                  {errors.price && (
                    <p className="text-xs text-red-600 flex items-center gap-1 animate-slide-in">
                      <AlertCircle className="w-3 h-3" />
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Item Photo</Label>
                  
                  {imagePreview ? (
                    <div className="relative animate-fade-in">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full p-0 bg-black/70 hover:bg-black/90"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`w-full h-48 border-3 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                        dragOver 
                          ? 'border-coffee-500 bg-coffee-50' 
                          : 'border-gray-300 bg-gray-50 hover:border-coffee-500 hover:bg-white hover:-translate-y-1'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-coffee-500 to-matcha-600 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Click or drag & drop to upload
                      </div>
                      <div className="text-sm text-gray-500">
                        PNG, JPG, or JPEG (Max 5MB)
                      </div>
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
          </Card>
        </form>
      </div>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gradient-to-t from-white via-white/95 to-transparent p-6 pt-8">
        <Button
          type="submit"
          form="itemForm"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="w-full h-14 bg-gradient-to-r from-coffee-500 to-matcha-600 hover:from-coffee-600 hover:to-matcha-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding to Menu...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              🚀 Add to Menu
            </div>
          )}
        </Button>
      </div>

      <style>{`
        @keyframes float-pattern {
          0% { transform: translateX(-100px) translateY(-100px); }
          100% { transform: translateX(100px) translateY(100px); }
        }
        
        @keyframes bounce-gentle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .animate-float-pattern {
          animation: float-pattern 20s infinite linear;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        /* Enhanced User Menu Animations */
        .user-menu-glow {
          animation: user-menu-glow 3s ease-in-out infinite;
        }

        @keyframes user-menu-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.2), 0 0 40px rgba(255, 255, 255, 0.1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default AddListing;