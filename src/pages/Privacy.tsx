import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
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
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
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
                At Sip Near Me, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and contact information (email, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely by third-party providers)</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Location Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>GPS coordinates when you use location services</li>
                <li>Address information you provide</li>
                <li>Location preferences and search history</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>App usage patterns and preferences</li>
                <li>Order history and transaction details</li>
                <li>Device information and identifiers</li>
                <li>Log files and analytics data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To process transactions and send order confirmations</li>
                <li>To connect you with nearby sellers</li>
                <li>To personalize your experience and recommendations</li>
                <li>To send you notifications about orders and promotions</li>
                <li>To improve our app and develop new features</li>
                <li>To prevent fraud and ensure security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              <p>We may share your information in the following circumstances:</p>
              
              <h3 className="text-lg font-medium mb-2 mt-4">With Sellers</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contact information for order fulfillment</li>
                <li>Delivery address and preferences</li>
                <li>Order details and special instructions</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">With Service Providers</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment processors for transaction handling</li>
                <li>Analytics providers for app improvement</li>
                <li>Cloud storage providers for data hosting</li>
                <li>Customer support platforms</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Legal Requirements</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>When required by law or legal process</li>
                <li>To protect our rights and safety</li>
                <li>To prevent fraud or illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p>We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure payment processing through certified providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Privacy Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and review your personal information</li>
                <li>Update or correct your information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Control location sharing settings</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Location Services</h2>
              <p>
                Our app uses location services to connect you with nearby sellers. You can control location sharing through your device settings and app preferences. Disabling location services may limit app functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can manage cookie preferences through your device settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Third-Party Services</h2>
              <p>
                Our app may contain links to third-party services. We are not responsible for the privacy practices of these external services. Please review their privacy policies before providing any information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during international transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li>Email: privacy@sipnearme.com</li>
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

export default Privacy;
