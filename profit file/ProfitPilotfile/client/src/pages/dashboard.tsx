import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StatsOverview from "@/components/stats-overview";
import ProfitCalculator from "@/components/profit-calculator";
import InvestmentCard from "@/components/investment-card";
import TransactionHistory from "@/components/transaction-history";
import WalletSection from "@/components/wallet-section";
import CountdownTimer from "@/components/countdown-timer";
import { 
  ChartLine, 
  Bell, 
  ChevronDown, 
  CalendarIcon,
  Trophy,
  Gift,
  Copy,
  ExternalLink,
  HelpCircle,
  FileText,
  Headphones
} from "lucide-react";
import { Link } from "wouter";
import type { Investment, InvestmentPlan } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Redirect to onboarding if TRC20 address not set
  useEffect(() => {
    if (user && !user.trc20Address) {
      setLocation('/onboarding');
    }
  }, [user, setLocation]);

  // Fetch user investments
  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
    enabled: isAuthenticated,
  });

  // Fetch investment plans
  const { data: investmentPlans = [] } = useQuery<InvestmentPlan[]>({
    queryKey: ["/api/investment-plans"],
    enabled: isAuthenticated,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto animate-pulse">
            <ChartLine className="text-2xl text-white" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const activeInvestments = investments.filter((inv) => inv.isActive);
  const weeklyPlan = investmentPlans.find((plan) => plan.type === 'weekly');
  const monthlyPlan = investmentPlans.find((plan) => plan.type === 'monthly');

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <ChartLine className="text-xl text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                InvestPro
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#dashboard" className="text-sm font-medium text-primary border-b-2 border-primary pb-1">
                Dashboard
              </a>
              <a href="#investments" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Investments
              </a>
              <a href="#transactions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Transactions
              </a>
              <Link href="/faqs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                FAQs
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              
              <div className="relative group">
                <Button variant="ghost" className="flex items-center space-x-3" data-testid="button-profile-menu">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
                
                <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start px-3 py-2 text-sm"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Investor'}! 👋
          </h2>
          <p className="text-muted-foreground">Here's what's happening with your investments today.</p>
        </div>
        
        {/* Stats Overview */}
        <StatsOverview user={user!} investments={investments} />
        
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Investment Plans */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Investment Plans</h3>
              <Button variant="outline" size="sm" data-testid="button-view-all-plans">
                View All
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Weekly Plan */}
              {weeklyPlan && (
                <InvestmentCard 
                  plan={weeklyPlan}
                  variant="primary"
                  badge="POPULAR"
                />
              )}
              
              {/* Monthly Plan */}
              {monthlyPlan && (
                <InvestmentCard 
                  plan={monthlyPlan}
                  variant="secondary"
                  badge="BEST VALUE"
                />
              )}
            </div>
          </div>
          
          {/* Profit Calculator */}
          <ProfitCalculator plans={investmentPlans} />
        </div>
        
        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Active Investments</h3>
              <Button variant="outline" size="sm" data-testid="button-filter-investments">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeInvestments.slice(0, 6).map((investment: any) => (
                <Card key={investment.id} className="hover:shadow-lg transition-shadow" data-testid={`card-investment-${investment.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={investment.planType === 'weekly' ? 'default' : 'secondary'}>
                        {investment.planType?.toUpperCase()}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Invested Amount</p>
                      <h4 className="text-2xl font-bold">${parseFloat(investment.amount).toLocaleString()}</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Profit</p>
                        <p className="text-lg font-semibold text-secondary">
                          +${parseFloat(investment.currentProfit || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">ROI</p>
                        <p className="text-lg font-semibold">
                          {investment.roiPercentage}%
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {Math.floor((Date.now() - new Date(investment.startDate).getTime()) / (new Date(investment.endDate).getTime() - new Date(investment.startDate).getTime()) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.floor((Date.now() - new Date(investment.startDate).getTime()) / (new Date(investment.endDate).getTime() - new Date(investment.startDate).getTime()) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                      <span className="text-muted-foreground">
                        Started: {new Date(investment.startDate).toLocaleDateString()}
                      </span>
                      <CountdownTimer 
                        endDate={investment.endDate}
                        onComplete={() => {
                          queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
                          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Wallet & Transactions */}
          <div className="lg:col-span-2">
            <WalletSection />
            <div className="mt-6">
              <TransactionHistory />
            </div>
          </div>
          
          {/* Referral & Support */}
          <div className="space-y-6">
            {/* Referral Program */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Gift className="text-purple-400 text-xl" />
                  </div>
                  {(user as any)?.isVipPartner ? (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      VIP PARTNER
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                      REWARDS
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">Referral Rewards</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {parseFloat((user as any)?.lifetimeCommissionRate || '0') > 0 
                    ? `Earning ${parseFloat((user as any)?.lifetimeCommissionRate).toFixed(0)}% lifetime commission` 
                    : 'Invite friends and unlock amazing rewards'}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-background/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
                  <div className="flex items-center justify-between">
                    <code className="font-mono font-bold">{user?.referralCode || 'INVEST2024'}</code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={copyReferralCode}
                      data-testid="button-copy-referral"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Successful Referrals</span>
                    <span className="font-semibold">{(user as any)?.successfulReferrals || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Earned</span>
                    <span className="font-semibold text-purple-400">
                      ${parseFloat(user?.referralEarnings || '0').toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tier Progress */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">REWARD TIERS</div>
                  
                  {/* Tier 1: 10 Referrals */}
                  <div className={`p-3 rounded-lg border ${
                    (user as any)?.successfulReferrals >= 10 
                      ? 'bg-secondary/10 border-secondary/20' 
                      : 'bg-muted/50 border-border'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">10 Referrals</span>
                      {(user as any)?.successfulReferrals >= 10 && (
                        <Badge className="bg-secondary text-secondary-foreground text-xs">UNLOCKED</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">$50 Bonus</p>
                  </div>

                  {/* Tier 2: 50 Referrals */}
                  <div className={`p-3 rounded-lg border ${
                    (user as any)?.successfulReferrals >= 50 
                      ? 'bg-secondary/10 border-secondary/20' 
                      : 'bg-muted/50 border-border'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">50 Referrals</span>
                      {(user as any)?.successfulReferrals >= 50 && (
                        <Badge className="bg-secondary text-secondary-foreground text-xs">UNLOCKED</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">1% Lifetime Commission</p>
                  </div>

                  {/* Tier 3: 100 Referrals */}
                  <div className={`p-3 rounded-lg border ${
                    (user as any)?.successfulReferrals >= 100 
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20' 
                      : 'bg-muted/50 border-border'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">100 Referrals</span>
                      {(user as any)?.successfulReferrals >= 100 && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">VIP</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">VIP Partner + Higher Profits</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  data-testid="button-share-referral"
                >
                  Share Referral Link
                </Button>
              </CardContent>
            </Card>
            
            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/faqs" className="w-full">
                  <Button variant="ghost" className="w-full justify-between" data-testid="button-faqs">
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="text-primary w-5 h-5" />
                      <span className="font-medium">FAQs</span>
                    </div>
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
                
                <Link href="/terms" className="w-full">
                  <Button variant="ghost" className="w-full justify-between" data-testid="button-terms">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-accent w-5 h-5" />
                      <span className="font-medium">Terms & Conditions</span>
                    </div>
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
                
                <Button variant="ghost" className="w-full justify-between" data-testid="button-live-support">
                  <div className="flex items-center space-x-3">
                    <Headphones className="text-secondary w-5 h-5" />
                    <span className="font-medium">Live Support</span>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary text-xs">
                    Online
                  </Badge>
                </Button>
              </CardContent>
            </Card>
            
            {/* Achievement Badge */}
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="text-accent text-2xl" />
                </div>
                <h4 className="font-bold mb-1">Gold Investor</h4>
                <p className="text-sm text-muted-foreground mb-3">Level 3 - Keep investing to reach Platinum!</p>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{width: '72%'}} />
                </div>
                <p className="text-xs text-muted-foreground">$2,800 to next level</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <ChartLine className="text-xl text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  InvestPro
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">Smart investing made simple. Start growing your wealth today.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faqs" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Safety</a></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </Button>
                <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </Button>
                <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </Button>
                <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 InvestPro. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-2.01L12 1z"/>
                </svg>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <span>Bank Level Security</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
