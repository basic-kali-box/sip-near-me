import { useState, useRef } from "react";
import { ArrowLeft, Plus, Camera, MapPin, Clock, DollarSign, Coffee, Leaf, Star, Upload, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AddListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "coffee", // Default to coffee
    address: "",
    phone: "",
    hours: "",
    description: "",
    profileImage: null as File | null,
    drinks: [{ name: "", description: "", price: "", image: null as File | null }]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Enhanced form validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Business name is required";
      if (!formData.specialty) newErrors.specialty = "Please select a specialty";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    } else if (step === 2) {
      if (!formData.description.trim()) newErrors.description = "Description is required";
      if (!formData.hours.trim()) newErrors.hours = "Operating hours are required";
    } else if (step === 3) {
      formData.drinks.forEach((drink, index) => {
        if (!drink.name.trim()) newErrors[`drink_${index}_name`] = "Drink name is required";
        if (!drink.price.trim()) newErrors[`drink_${index}_price`] = "Price is required";
      });
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

  const handleDrinkChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      drinks: prev.drinks.map((drink, i) =>
        i === index ? { ...drink, [field]: value } : drink
      )
    }));
    // Clear error when user starts typing
    const errorKey = `drink_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  };

  const handleImageUpload = (file: File, type: 'profile' | 'drink', drinkIndex?: number) => {
    if (type === 'profile') {
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (type === 'drink' && drinkIndex !== undefined) {
      setFormData(prev => ({
        ...prev,
        drinks: prev.drinks.map((drink, i) =>
          i === drinkIndex ? { ...drink, image: file } : drink
        )
      }));
    }
  };

  const addDrink = () => {
    setFormData(prev => ({
      ...prev,
      drinks: [...prev.drinks, { name: "", description: "", price: "", image: null }]
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "🎉 Listing Created Successfully!",
        description: "Your coffee/matcha business is now live on BrewNear!",
      });

      // Navigate back with success state
      navigate("/", { state: { newListing: true } });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Business Info", icon: Coffee },
    { number: 2, title: "Details", icon: Star },
    { number: 3, title: "Menu", icon: Plus },
    { number: 4, title: "Review", icon: Check }
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-elegant">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-primary/10 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Start Selling on BrewNear
              </h1>
              <p className="text-sm text-muted-foreground">Join our community of coffee & matcha sellers</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  currentStep >= step.number
                    ? 'bg-gradient-matcha text-primary-foreground shadow-glow'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Premium Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Mobile Progress Indicator */}
          <div className="md:hidden mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-matcha h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <Card className="glass-card border-border/30 shadow-elegant">
                <div className="p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-matcha rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                      <Coffee className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Business Information</h2>
                      <p className="text-muted-foreground">Tell us about your coffee or matcha business</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-foreground">Business Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Matcha Dreams Café"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`transition-all duration-200 ${errors.name ? 'border-destructive focus:border-destructive' : 'focus:border-primary/50'}`}
                      />
                      {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialty" className="text-sm font-semibold text-foreground">Specialty *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={formData.specialty === 'coffee' ? 'default' : 'outline'}
                          onClick={() => handleInputChange('specialty', 'coffee')}
                          className={`justify-start ${formData.specialty === 'coffee' ? 'bg-gradient-coffee' : 'hover:bg-primary/10'}`}
                        >
                          <Coffee className="w-4 h-4 mr-2" />
                          Coffee
                        </Button>
                        <Button
                          type="button"
                          variant={formData.specialty === 'matcha' ? 'default' : 'outline'}
                          onClick={() => handleInputChange('specialty', 'matcha')}
                          className={`justify-start ${formData.specialty === 'matcha' ? 'bg-gradient-matcha' : 'hover:bg-primary/10'}`}
                        >
                          <Leaf className="w-4 h-4 mr-2" />
                          Matcha
                        </Button>
                      </div>
                      {errors.specialty && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.specialty}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-foreground">Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="address"
                          placeholder="123 Coffee Street, City, State"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className={`pl-10 transition-all duration-200 ${errors.address ? 'border-destructive focus:border-destructive' : 'focus:border-primary/50'}`}
                        />
                      </div>
                      {errors.address && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`transition-all duration-200 ${errors.phone ? 'border-destructive focus:border-destructive' : 'focus:border-primary/50'}`}
                      />
                      {errors.phone && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 hover:bg-primary/10 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </span>
              </div>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-matcha hover:shadow-glow transition-all duration-300 flex items-center gap-2"
                >
                  Next
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-matcha hover:shadow-glow transition-all duration-300 flex items-center gap-2 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Listing
                    </>
                  )}
                </Button>
              )}
            </div>


          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
