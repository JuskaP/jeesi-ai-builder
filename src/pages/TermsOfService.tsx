import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
  const { t } = useTranslation();
  const lastUpdated = "December 3, 2025";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6 prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to jeesi.ai. These Terms of Service ("Terms") govern your access to and use of our AI agent builder platform, 
              including our website, services, and any related applications (collectively, the "Service"). By accessing or using 
              the Service, you agree to be bound by these Terms.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                By creating an account or using the Service, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use 
                the Service.
              </p>
              <p>
                You must be at least 18 years old or the age of majority in your jurisdiction to use the Service. By using 
                the Service, you represent and warrant that you meet this age requirement.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                jeesi.ai provides an AI-powered platform that enables users to create, customize, deploy, and manage AI agents 
                for various purposes including customer service, sales, marketing, and more. The Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI agent creation and configuration tools</li>
                <li>Conversation design and management</li>
                <li>Agent deployment and embedding capabilities</li>
                <li>Analytics and performance monitoring</li>
                <li>Team collaboration and workspace features</li>
                <li>Integration with third-party services</li>
              </ul>
            </div>
          </section>

          <Separator />

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <div className="text-muted-foreground space-y-4">
              <h3 className="text-lg font-medium text-foreground">3.1 Account Registration</h3>
              <p>
                To access certain features of the Service, you must register for an account. You agree to provide accurate, 
                current, and complete information during registration and to update such information to keep it accurate, 
                current, and complete.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">3.2 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                that occur under your account. You agree to immediately notify us of any unauthorized use of your account 
                or any other breach of security.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">3.3 Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account at any time for any reason, including but not 
                limited to violation of these Terms, fraudulent activity, or extended periods of inactivity.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Subscription Plans and Billing</h2>
            <div className="text-muted-foreground space-y-4">
              <h3 className="text-lg font-medium text-foreground">4.1 Pricing</h3>
              <p>
                jeesi.ai offers various subscription plans with different features and pricing. Current pricing is available 
                on our Billing page. We reserve the right to modify pricing at any time with 30 days advance notice to 
                existing subscribers.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">4.2 Payment</h3>
              <p>
                By subscribing to a paid plan, you authorize us to charge your payment method on a recurring basis until 
                you cancel your subscription. All payments are processed securely through Stripe.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">4.3 Refunds</h3>
              <p>
                Subscription fees are generally non-refundable except where required by law. If you believe you are entitled 
                to a refund, please contact our support team at info@jeesi.ai.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">4.4 Credits</h3>
              <p>
                Some subscription plans include usage credits. Unused daily credits do not roll over to the next day. 
                Monthly credits may roll over according to your plan terms. Additional credits can be purchased separately.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Acceptable Use Policy</h2>
            <div className="text-muted-foreground space-y-4">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Create agents that generate harmful, illegal, or misleading content</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                <li>Transmit viruses, malware, or any other malicious code</li>
                <li>Attempt to gain unauthorized access to the Service or other systems</li>
                <li>Engage in any activity that interferes with or disrupts the Service</li>
                <li>Scrape, harvest, or collect data from the Service without authorization</li>
                <li>Use the Service for spamming or unsolicited communications</li>
                <li>Create agents for fraudulent or deceptive purposes</li>
                <li>Violate the intellectual property rights of others</li>
              </ul>
            </div>
          </section>

          <Separator />

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
            <div className="text-muted-foreground space-y-4">
              <h3 className="text-lg font-medium text-foreground">6.1 Our Intellectual Property</h3>
              <p>
                The Service, including its original content, features, and functionality, is owned by jeesi.ai and is 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">6.2 Your Content</h3>
              <p>
                You retain ownership of any content, data, or materials you upload, create, or share through the Service 
                ("User Content"). By using the Service, you grant us a non-exclusive, worldwide, royalty-free license to 
                use, reproduce, modify, and display your User Content solely for the purpose of providing and improving 
                the Service.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">6.3 Community Shared Content</h3>
              <p>
                If you choose to share your AI agents to the Community, you grant other users a license to use and 
                customize your shared agents according to the community sharing terms.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. AI-Generated Content</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                The Service uses artificial intelligence to generate responses and content. You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI-generated content may not always be accurate, complete, or appropriate</li>
                <li>You are responsible for reviewing and verifying AI-generated content before use</li>
                <li>We are not liable for any decisions made based on AI-generated content</li>
                <li>AI outputs should not be considered professional advice (legal, medical, financial, etc.)</li>
              </ul>
            </div>
          </section>

          <Separator />

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy and Data Protection</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Your privacy is important to us. Our collection, use, and protection of your personal information is 
                governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p>
                By using the Service, you consent to the collection and use of your information as described in our 
                Privacy Policy. We are committed to GDPR compliance and protecting the privacy rights of all users.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Disclaimer of Warranties</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR 
                IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the Service will be uninterrupted, secure, or error-free, or that any defects 
                will be corrected. We do not make any warranties regarding the accuracy, reliability, or availability 
                of the Service.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, JEESI.AI AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, 
                AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
                DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR 
                RELATED TO YOUR USE OF THE SERVICE.
              </p>
              <p>
                Our total liability for any claims arising from or related to the Service shall not exceed the amount 
                you paid us in the twelve (12) months preceding the claim.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Indemnification</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                You agree to indemnify, defend, and hold harmless jeesi.ai and its affiliates, officers, directors, 
                employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including 
                reasonable legal fees, arising out of or in any way connected with your access to or use of the Service, 
                your violation of these Terms, or your violation of any third-party rights.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Modifications to Terms</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by 
                posting the updated Terms on the Service and updating the "Last updated" date. Your continued use of 
                the Service after such changes constitutes your acceptance of the modified Terms.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Governing Law and Disputes</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Finland, without regard 
                to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be 
                resolved in the courts of Finland.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. General Provisions</h2>
            <div className="text-muted-foreground space-y-4">
              <h3 className="text-lg font-medium text-foreground">14.1 Entire Agreement</h3>
              <p>
                These Terms, together with the Privacy Policy, constitute the entire agreement between you and jeesi.ai 
                regarding the Service and supersede all prior agreements and understandings.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">14.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall 
                continue in full force and effect.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">14.3 Waiver</h3>
              <p>
                Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right 
                or provision.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">14.4 Assignment</h3>
              <p>
                You may not assign or transfer these Terms without our prior written consent. We may assign these Terms 
                without restriction.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 15 */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contact Information</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>jeesi.ai</strong></p>
                <p>Email: info@jeesi.ai</p>
                <p>Location: Finland, European Union</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}