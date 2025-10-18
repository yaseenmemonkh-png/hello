import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChartLine, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { FAQ } from "@shared/schema";

export default function FAQs() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Fetch FAQs from API
  const { data: faqs = [], isLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });

  // Fallback FAQs if API is not available
  const fallbackFaqs = [
    {
      id: "1",
      question: "How do I create an account?",
      answer: "Click 'Get Started' and you can sign up using your Google/Gmail account, GitHub account, or create an account with email and password. It's quick and secure!",
      category: "Getting Started"
    },
    {
      id: "1b",
      question: "How do I start investing?",
      answer: "After creating your account, connect your crypto wallet and deposit funds (minimum $100). Then select your preferred investment plan (Weekly or Monthly) and start earning profits automatically.",
      category: "Getting Started"
    },
    {
      id: "2", 
      question: "When will I receive my profits?",
      answer: "Weekly plan profits are distributed every 7 days from your investment date. Monthly plan profits are paid out every 30 days. All profits are automatically credited to your wallet balance.",
      category: "Returns"
    },
    {
      id: "3",
      question: "Can I withdraw my funds anytime?",
      answer: "Yes, you can withdraw your available balance anytime. However, funds locked in active investment plans cannot be withdrawn until the plan period completes. Early withdrawal may result in penalty fees.",
      category: "Withdrawals"
    },
    {
      id: "4",
      question: "Is my investment safe and secure?",
      answer: "Absolutely. We use bank-level 256-bit SSL encryption, multi-factor authentication, and cold storage for crypto assets. Your investments are protected by industry-leading security protocols.",
      category: "Security"
    },
    {
      id: "5",
      question: "What is the minimum investment amount?",
      answer: "The minimum investment for the Weekly Plan is $100, and $500 for the Monthly Plan. There is no maximum limit - invest as much as you're comfortable with.",
      category: "Investment Plans"
    },
    {
      id: "6",
      question: "How are profits calculated?",
      answer: "Weekly plans offer 10% return per week on your invested amount. Monthly plans offer 50% return per month. Profits are calculated based on your principal investment amount.",
      category: "Returns"
    },
    {
      id: "7",
      question: "What wallets are supported?",
      answer: "We currently support Trust Wallet and other major crypto wallets for deposits and withdrawals. More wallet integrations are coming soon.",
      category: "Wallets"
    },
    {
      id: "8",
      question: "How does the referral program work?",
      answer: "Share your unique referral code with friends. You'll earn $5 for each successful deposit they make. Plus, unlock amazing tier rewards: 10 referrals = $50 bonus, 50 referrals = 1% lifetime commission on all their investments, 100 referrals = VIP Partner badge with higher profit share!",
      category: "Referrals"
    },
    {
      id: "8b",
      question: "What are the referral tier rewards?",
      answer: "Tier 1 (10 successful referrals): Get a $50 bonus. Tier 2 (50 successful referrals): Unlock 1% lifetime commission on every investment your referrals make. Tier 3 (100 successful referrals): Become a VIP Partner with exclusive badge and higher profit share on your own investments.",
      category: "Referrals"
    },
    {
      id: "8c",
      question: "What counts as a successful referral?",
      answer: "A successful referral is when someone signs up using your referral code and makes their first deposit of at least $100. Once they deposit, you get the $5 bonus and it counts toward your tier progress.",
      category: "Referrals"
    }
  ];

  const displayFaqs = faqs.length > 0 ? faqs : fallbackFaqs;

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto animate-pulse">
            <ChartLine className="text-2xl text-white" />
          </div>
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about InvestPro</p>
          </div>
        </div>
      </header>

      {/* FAQs Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {displayFaqs.map((faq) => (
            <Card key={faq.id} className="overflow-hidden" data-testid={`faq-item-${faq.id}`}>
              <Collapsible 
                open={openItems.includes(faq.id)}
                onOpenChange={() => toggleItem(faq.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-left text-lg pr-4">
                        {faq.question}
                      </CardTitle>
                      <ChevronDown 
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          openItems.includes(faq.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {faq.category && (
                      <div className="flex justify-start">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {faq.category}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to help you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-live-chat">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Start Live Chat
              </Button>
              <Button variant="outline" data-testid="button-email-support">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89c.39.39 1.02.39 1.41 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support
              </Button>
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
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms & Conditions
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
