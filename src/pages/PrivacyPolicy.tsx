import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, UserCheck } from "lucide-react";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const lastUpdated = "December 3, 2025";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">GDPR Compliant</p>
          </Card>
          <Card className="text-center p-4">
            <Lock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">SSL Encrypted</p>
          </Card>
          <Card className="text-center p-4">
            <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Transparent</p>
          </Card>
          <Card className="text-center p-4">
            <UserCheck className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">User Control</p>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              At jeesi.ai, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our AI agent builder platform. We are committed to protecting 
              your personal data and ensuring transparency in our data practices.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <div className="text-muted-foreground space-y-4">
              <h3 className="text-lg font-medium text-foreground">1.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
                <li><strong>Profile Information:</strong> Optional information you add to your profile</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through Stripe (we do not store full card numbers)</li>
                <li><strong>Agent Content:</strong> Configuration, prompts, knowledge bases, and settings for your AI agents</li>
                <li><strong>Communications:</strong> Messages you send to us or through our support channels</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">1.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> How you interact with our Service, features used, and actions taken</li>
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong>Log Data:</strong> IP address, access times, pages viewed, and referring URLs</li>
                <li><strong>Cookies:</strong> Small data files stored on your device for authentication and preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">1.3 Conversation Data</h3>
              <p>
                When you use our AI agents or interact with Helpie (our assistant), we may collect conversation data to 
                provide and improve the Service. This collection is subject to your consent preferences, which you can 
                manage in your account settings.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <div className="text-muted-foreground space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process transactions and send related information</li>
                <li>Create and manage your account</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Send technical notices, updates, and administrative messages</li>
                <li>Monitor and analyze usage trends to improve user experience</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Personalize your experience and provide tailored content</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <Separator />

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Legal Basis for Processing (GDPR)</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Under the General Data Protection Regulation (GDPR), we process your data based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contract Performance:</strong> To provide the Service you have requested</li>
                <li><strong>Consent:</strong> Where you have given explicit consent for specific processing activities</li>
                <li><strong>Legitimate Interests:</strong> To improve our Service, ensure security, and communicate with you</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          <Separator />

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Your Rights and Choices</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Under GDPR and applicable privacy laws, you have the following rights:</p>
              
              <div className="grid gap-4">
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium text-foreground mb-2">Right to Access</h4>
                  <p className="text-sm">Request a copy of the personal data we hold about you.</p>
                </Card>
                
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium text-foreground mb-2">Right to Rectification</h4>
                  <p className="text-sm">Request correction of inaccurate or incomplete personal data.</p>
                </Card>
                
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium text-foreground mb-2">Right to Erasure</h4>
                  <p className="text-sm">Request deletion of your personal data under certain circumstances.</p>
                </Card>
                
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium text-foreground mb-2">Right to Data Portability</h4>
                  <p className="text-sm">Receive your data in a structured, commonly used format.</p>
                </Card>
                
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium text-foreground mb-2">Right to Object</h4>
                  <p className="text-sm">Object to processing based on legitimate interests or for direct marketing.</p>
                </Card>
                
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium text-foreground mb-2">Right to Withdraw Consent</h4>
                  <p className="text-sm">Withdraw consent at any time where processing is based on consent.</p>
                </Card>
              </div>
              
              <p>
                To exercise these rights, please contact us at info@jeesi.ai or use the privacy settings in your account.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Consent Management</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We provide granular control over data collection through our consent management system. You can manage 
                your preferences for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Analytics:</strong> Collection of platform usage data for service improvement</li>
                <li><strong>Prompt Analysis:</strong> Analysis of conversation prompts to enhance AI responses</li>
                <li><strong>Error Tracking:</strong> Collection of error data to improve reliability</li>
                <li><strong>Metadata Collection:</strong> Collection of session and interaction metadata</li>
              </ul>
              <p>
                You can update your consent preferences at any time through your Profile settings under the Privacy tab.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Sharing and Disclosure</h2>
            <div className="text-muted-foreground space-y-4">
              <p>We may share your information with:</p>
              
              <h3 className="text-lg font-medium text-foreground">6.1 Service Providers</h3>
              <p>
                Third-party vendors who perform services on our behalf, including payment processing (Stripe), 
                hosting, analytics, and customer support. These providers are contractually bound to protect 
                your data and use it only for the services they provide to us.
              </p>

              <h3 className="text-lg font-medium text-foreground">6.2 AI Model Providers</h3>
              <p>
                To power our AI agents, we use third-party AI models (Google, OpenAI). Conversation data may be 
                processed by these providers according to their privacy policies and our data processing agreements.
              </p>

              <h3 className="text-lg font-medium text-foreground">6.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required by law, subpoena, or other legal process, or if we 
                believe disclosure is necessary to protect our rights, your safety, or the safety of others.
              </p>

              <h3 className="text-lg font-medium text-foreground">6.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to 
                the acquiring entity.
              </p>

              <p className="font-medium text-foreground">
                We do not sell your personal information to third parties.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Security</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We implement industry-standard security measures to protect your data, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SSL/TLS encryption for all data in transit</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers located in the European Union</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p>
                While we strive to protect your information, no method of transmission over the Internet or electronic 
                storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the 
                highest standards of data protection.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Retention</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was 
                collected, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period after closure</li>
                <li><strong>Agent Data:</strong> Retained while you maintain your account or until you delete your agents</li>
                <li><strong>Conversation Logs:</strong> Retained according to your plan and consent settings</li>
                <li><strong>Billing Records:</strong> Retained as required by tax and financial regulations</li>
                <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained indefinitely</li>
              </ul>
              <p>
                You can request deletion of your data at any time by contacting us or through your account settings.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. International Data Transfers</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                jeesi.ai is based in Finland, European Union. Your data is primarily processed and stored within the EU. 
                When we transfer data outside the EU (e.g., to AI model providers), we ensure appropriate safeguards are 
                in place, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Data processing agreements with all third-party providers</li>
                <li>Adequacy decisions where applicable</li>
              </ul>
            </div>
          </section>

          <Separator />

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cookies and Tracking</h2>
            <div className="text-muted-foreground space-y-4">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authenticate users and maintain sessions</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve the Service</li>
                <li>Provide security features</li>
              </ul>
              <p>
                You can control cookie settings through your browser. Note that disabling certain cookies may affect 
                the functionality of the Service.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Children's Privacy</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                The Service is not intended for users under 18 years of age. We do not knowingly collect personal 
                information from children. If we become aware that we have collected personal data from a child 
                without parental consent, we will take steps to delete that information.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Policy</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you 
                to review this Privacy Policy periodically.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <Card className="p-4 bg-muted/30">
                <p><strong>jeesi.ai</strong></p>
                <p>Data Protection Contact</p>
                <p>Email: info@jeesi.ai</p>
                <p>Location: Finland, European Union</p>
              </Card>
              <p>
                You also have the right to lodge a complaint with a supervisory authority if you believe your data 
                protection rights have been violated. In Finland, this is the Office of the Data Protection Ombudsman.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}