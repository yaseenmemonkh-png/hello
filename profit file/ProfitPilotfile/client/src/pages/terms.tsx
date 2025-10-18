import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChartLine, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <ChartLine className="text-2xl text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              InvestPro
            </h1>
          </div>
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Terms & Conditions</h2>
            <p className="text-muted-foreground text-lg">Investment platform terms and conditions</p>
            <p className="text-sm text-muted-foreground">Last updated: October 2, 2024</p>
          </div>
        </div>
      </header>

      {/* Terms Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Important Investment Risk Notice
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                  All investments carry risk of loss. Past performance does not guarantee future results. 
                  Please read these terms carefully and only invest what you can afford to lose.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Section 1: Acceptance of Terms */}
          <Card data-testid="section-acceptance">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  1
                </span>
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By accessing and using InvestPro ("we," "our," or "us"), you agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, you may not use our platform.
              </p>
              <p>
                These terms may be updated from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Platform Description */}
          <Card data-testid="section-platform">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  2
                </span>
                <span>Platform Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                InvestPro is an investment platform that offers structured investment plans with predetermined return rates:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Weekly Plan: 10% return per week, minimum investment $100</li>
                <li>Monthly Plan: 50% return per month, minimum investment $500</li>
              </ul>
              <p>
                Our platform integrates with cryptocurrency wallets including Trust Wallet and other major crypto wallets for deposits and withdrawals.
              </p>
            </CardContent>
          </Card>

          {/* Section 3: Investment Risks */}
          <Card data-testid="section-risks">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center text-sm font-bold text-destructive">
                  3
                </span>
                <span>Investment Risks & Disclaimers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-semibold text-destructive mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  High-Risk Investment Warning
                </h4>
                <p className="text-sm">
                  High-return investment opportunities carry significant risk of total loss. 
                  Only invest funds you can afford to lose entirely.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Past performance does not guarantee future results</li>
                <li>Returns are not guaranteed and may vary</li>
                <li>Principal amount may be lost partially or entirely</li>
                <li>Cryptocurrency markets are highly volatile</li>
                <li>Regulatory changes may affect operations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4: User Responsibilities */}
          <Card data-testid="section-responsibilities">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  4
                </span>
                <span>User Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>As a user of our platform, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and truthful information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent or illegal activities</li>
                <li>Verify the legitimacy of the platform before investing</li>
                <li>Conduct your own research and due diligence</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5: Deposits and Withdrawals */}
          <Card data-testid="section-transactions">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  5
                </span>
                <span>Deposits & Withdrawals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Deposits</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Deposits are processed through connected cryptocurrency wallets</li>
                  <li>Minimum deposit amounts apply based on selected investment plan</li>
                  <li>Deposits may take time to confirm on the blockchain</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Withdrawals</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Available balance can be withdrawn at any time</li>
                  <li>Active investments cannot be withdrawn until maturity</li>
                  <li>Early withdrawal may incur penalty fees</li>
                  <li>Withdrawals are subject to security checks and verification</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Security */}
          <Card data-testid="section-security">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center text-sm font-bold text-secondary">
                  6
                </span>
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="flex items-start space-x-3 bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                <Shield className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary mb-2">Our Security Measures</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>256-bit SSL encryption for all data transmission</li>
                    <li>Multi-factor authentication for account access</li>
                    <li>Cold storage for cryptocurrency assets</li>
                    <li>Regular security audits and monitoring</li>
                  </ul>
                </div>
              </div>
              <p>
                While we implement industry-standard security measures, users are responsible for maintaining 
                the security of their account credentials and connected wallets.
              </p>
            </CardContent>
          </Card>

          {/* Section 7: Limitations */}
          <Card data-testid="section-limitations">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  7
                </span>
                <span>Limitation of Liability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                InvestPro and its operators shall not be liable for any direct, indirect, incidental, 
                special, or consequential damages resulting from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Investment losses or failure to achieve expected returns</li>
                <li>Technical issues or platform downtime</li>
                <li>Third-party wallet or service failures</li>
                <li>Regulatory changes affecting platform operations</li>
                <li>Force majeure events beyond our control</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8: Termination */}
          <Card data-testid="section-termination">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  8
                </span>
                <span>Account Termination</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to suspend or terminate user accounts that violate these terms or engage in:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fraudulent or illegal activities</li>
                <li>Money laundering or financing of illegal activities</li>
                <li>Violation of applicable laws or regulations</li>
                <li>Abuse of platform features or referral systems</li>
              </ul>
              <p>
                Users may close their accounts at any time, subject to completion of active investments and withdrawal procedures.
              </p>
            </CardContent>
          </Card>

          {/* Section 9: Contact */}
          <Card data-testid="section-contact">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  9
                </span>
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                For questions about these terms or our platform, please contact our support team:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p><strong>Email:</strong> support@investpro.com</p>
                <p><strong>Live Chat:</strong> Available 24/7 through the platform</p>
                <p><strong>Response Time:</strong> Within 24 hours for general inquiries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acknowledgment */}
        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">Acknowledgment</h3>
              <p className="text-muted-foreground">
                By using InvestPro, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                You confirm that you are investing at your own risk and have the financial capacity to bear potential losses.
              </p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                <strong>Effective Date:</strong> October 2, 2024<br />
                <strong>Version:</strong> 1.0
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 InvestPro. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/faqs" className="hover:text-foreground transition-colors">
                FAQs
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
