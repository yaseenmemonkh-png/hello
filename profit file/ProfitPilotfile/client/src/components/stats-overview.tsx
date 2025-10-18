import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ChartLine, Briefcase, Users, TrendingUp } from "lucide-react";

interface User {
  id: string;
  balance: string;
  totalProfit: string;
  referrals: number;
  successfulReferrals?: number;
  referralEarnings: string;
}

interface Investment {
  id: string;
  amount: string;
  isActive: boolean;
  planType: 'weekly' | 'monthly';
}

interface StatsOverviewProps {
  user: User;
  investments: Investment[];
}

export default function StatsOverview({ user, investments }: StatsOverviewProps) {
  const balance = parseFloat(user.balance || '0');
  const totalProfit = parseFloat(user.totalProfit || '0');
  const referralEarnings = parseFloat(user.referralEarnings || '0');
  const referrals = user.successfulReferrals || 0;

  const activeInvestments = investments.filter(inv => inv.isActive);
  const weeklyInvestments = activeInvestments.filter(inv => inv.planType === 'weekly').length;
  const monthlyInvestments = activeInvestments.filter(inv => inv.planType === 'monthly').length;

  // Calculate percentage changes (mock data for demo)
  const balanceChange = "+12.5%";
  const profitChange = "+8.2%";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Balance */}
      <Card className="hover:scale-[1.02] transition-all" data-testid="card-total-balance">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Wallet className="text-primary text-xl" />
            </div>
            <Badge variant="secondary" className="text-xs font-medium bg-secondary/20 text-secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              {balanceChange}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <h3 className="text-2xl font-bold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-muted-foreground">
              ≈ {(balance / 43000).toFixed(3)} BTC
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Profit */}
      <Card className="hover:scale-[1.02] transition-all" data-testid="card-total-profit">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <ChartLine className="text-secondary text-xl" />
            </div>
            <Badge variant="secondary" className="text-xs font-medium bg-secondary/20 text-secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              {profitChange}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Profit</p>
            <h3 className="text-2xl font-bold">${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Plans */}
      <Card className="hover:scale-[1.02] transition-all" data-testid="card-active-plans">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <Briefcase className="text-accent text-xl" />
            </div>
            <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
              Active
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Plans</p>
            <h3 className="text-2xl font-bold">{activeInvestments.length}</h3>
            <p className="text-xs text-muted-foreground">
              {weeklyInvestments} weekly, {monthlyInvestments} monthly
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Referrals */}
      <Card className="hover:scale-[1.02] transition-all" data-testid="card-referrals">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Users className="text-purple-400 text-xl" />
            </div>
            <Badge variant="outline" className="text-xs font-medium bg-purple-500/20 text-purple-400">
              {referralEarnings > 0 ? 'Earning' : 'New'}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Referrals</p>
            <h3 className="text-2xl font-bold">{referrals}</h3>
            <p className="text-xs text-muted-foreground">
              +${referralEarnings.toFixed(2)} bonus earned
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
