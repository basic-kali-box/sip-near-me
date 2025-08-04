import { useState } from "react";
import { ArrowLeft, Search, MessageCircle, Phone, Mail, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqData: FAQItem[] = [
    {
      id: "1",
      question: "How do I place an order?",
      answer: "To place an order, browse sellers in your area using the List or Map view, select a seller, choose your drinks from their menu, add them to your cart, and proceed to checkout. You'll receive updates on your order status.",
      category: "Ordering"
    },
    {
      id: "2",
      question: "How do I find sellers near me?",
      answer: "The app uses your location to show nearby sellers. Make sure location services are enabled in your device settings and in the app settings. You can adjust your search radius in Settings > Location.",
      category: "Location"
    },
    {
      id: "3",
      question: "What payment methods are accepted?",
      answer: "We accept all major credit cards, debit cards, PayPal, Apple Pay, and Google Pay. Payment is processed securely through our platform.",
      category: "Payment"
    },
    {
      id: "4",
      question: "How long does delivery take?",
      answer: "Delivery times vary by seller and location, typically ranging from 15-45 minutes. Each seller displays their estimated preparation and delivery time on their profile.",
      category: "Delivery"
    },
    {
      id: "5",
      question: "Can I cancel my order?",
      answer: "You can cancel your order within 5 minutes of placing it, or before the seller starts preparing it. Go to Order History and select 'Cancel Order' if the option is available.",
      category: "Ordering"
    },
    {
      id: "6",
      question: "How do I become a seller?",
      answer: "To become a seller, tap 'Add Listing' from the main screen, fill out your information, add your drinks menu, and submit for approval. We'll review your application within 24-48 hours.",
      category: "Selling"
    },
    {
      id: "7",
      question: "What if my order is wrong or missing items?",
      answer: "If there's an issue with your order, contact the seller directly through the app or reach out to our support team. We'll work to resolve the issue quickly and may offer a refund or replacement.",
      category: "Support"
    },
    {
      id: "8",
      question: "How do I update my profile information?",
      answer: "Go to Profile from the main menu, tap 'Edit' in the top right corner, make your changes, and tap 'Save'. You can update your name, email, phone, and address.",
      category: "Account"
    }
  ];

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  const filteredFAQs = faqData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const contactOptions = [
    {
      title: "Live Chat",
      description: "Chat with our support team",
      icon: MessageCircle,
      action: () => {
        // In a real app, this would open a chat widget
        alert("Live chat would open here");
      }
    },
    {
      title: "Call Us",
      description: "+1 (555) 123-HELP",
      icon: Phone,
      action: () => {
        window.location.href = "tel:+15551234357";
      }
    },
    {
      title: "Email Support",
      description: "support@sipnearme.com",
      icon: Mail,
      action: () => {
        window.location.href = "mailto:support@sipnearme.com";
      }
    }
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
          <h1 className="text-lg font-semibold">Help & Support</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Contact Options */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactOptions.map((option) => (
              <Button
                key={option.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={option.action}
              >
                <option.icon className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium">{option.title}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          
          {searchQuery && (
            <p className="text-sm text-muted-foreground mb-4">
              {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}

          <div className="space-y-2">
            {filteredFAQs.map((faq) => (
              <Collapsible
                key={faq.id}
                open={openItems.includes(faq.id)}
                onOpenChange={() => toggleItem(faq.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto text-left"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{faq.question}</div>
                      <div className="text-sm text-primary mt-1">{faq.category}</div>
                    </div>
                    {openItems.includes(faq.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No results found for "{searchQuery}"
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/terms")}
            >
              Terms of Service
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/settings")}
            >
              App Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Help;
