import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

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
          <h1 className="text-lg font-semibold">Terms of Service</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Card className="p-6 prose prose-sm max-w-none">
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-4">
                Last updated: January 15, 2024
              </p>
              <p>
                Welcome to Sip Near Me. These Terms of Service ("Terms") govern your use of our mobile application and services. By using our app, you agree to these terms.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Sip Near Me, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p>
                Sip Near Me is a platform that connects users with local beverage sellers. We facilitate the discovery and ordering of homemade and artisanal drinks from verified sellers in your area.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must be at least 18 years old to use our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Seller Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sellers must comply with all local health and safety regulations</li>
                <li>All food and beverage items must be prepared in safe, sanitary conditions</li>
                <li>Sellers must accurately describe their products and pricing</li>
                <li>Sellers are responsible for timely order fulfillment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any unlawful purpose</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, abuse, or harm other users or sellers</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Orders and Payments</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All orders are subject to seller acceptance</li>
                <li>Prices are set by individual sellers</li>
                <li>Payment is processed securely through our platform</li>
                <li>Refunds are handled on a case-by-case basis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are owned by Sip Near Me and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Disclaimers</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not guarantee the quality or safety of products sold by sellers</li>
                <li>We are not responsible for disputes between users and sellers</li>
                <li>The service is provided "as is" without warranties of any kind</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p>
                In no event shall Sip Near Me be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li>Email: legal@sipnearme.com</li>
                <li>Phone: +1 (555) 123-HELP</li>
                <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
