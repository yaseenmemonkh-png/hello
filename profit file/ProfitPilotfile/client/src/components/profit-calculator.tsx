import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign } from "lucide-react";

interface InvestmentPlan {
  id: string;
  name: string;
  type: 'weekly' | 'monthly';
  roiPercentage: string;
  minAmount: string;
  maxAmount?: string;
}

interface ProfitCalculatorProps {
  plans: InvestmentPlan[];
}

export default function ProfitCalculator({ plans }: ProfitCalculatorProps) {
  const [amount, setAmount] = useState("1000");
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('weekly');
  
  const weeklyPlan = plans.find(p => p.type === 'weekly');
  const monthlyPlan = plans.find(p => p.type === 'monthly');
  
  const currentPlan = selectedPlan === 'weekly' ? weeklyPlan : monthlyPlan;
  
  // Calculate profits
  const principal = parseFloat(amount) || 0;
  const roiRate = currentPlan ? parseFloat(currentPlan.roiPercentage) / 100 : 0;
  
  const weeklyProfit = selectedPlan === 'weekly' ? principal * roiRate : 0;
  const monthlyProfit = selectedPlan === 'monthly' ? principal * roiRate : weeklyProfit * 4;
  const totalReturn = principal + monthlyProfit;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Profit Calculator</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Calculate Your Returns</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="calc-amount">Investment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                id="calc-amount"
                type="number"
                placeholder="1000"
                className="pl-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-calc-amount"
              />
            </div>
          </div>
          
          {/* Plan Selection */}
          <div className="space-y-3">
            <Label>Select Plan</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={selectedPlan === 'weekly' ? 'default' : 'outline'}
                className="h-auto py-3 px-4"
                onClick={() => setSelectedPlan('weekly')}
                disabled={!weeklyPlan}
                data-testid="button-select-weekly"
              >
                <div className="text-left">
                  <div className="font-medium">Weekly</div>
                  <div className="text-xs opacity-80">
                    {weeklyPlan ? `${weeklyPlan.roiPercentage}%` : 'N/A'}
                  </div>
                </div>
              </Button>
              <Button 
                variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
                className="h-auto py-3 px-4"
                onClick={() => setSelectedPlan('monthly')}
                disabled={!monthlyPlan}
                data-testid="button-select-monthly"
              >
                <div className="text-left">
                  <div className="font-medium">Monthly</div>
                  <div className="text-xs opacity-80">
                    {monthlyPlan ? `${monthlyPlan.roiPercentage}%` : 'N/A'}
                  </div>
                </div>
              </Button>
            </div>
          </div>
          
          {/* Results */}
          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Principal Amount</span>
              <span className="font-semibold">${principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            
            {selectedPlan === 'weekly' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly Profit</span>
                <span className="font-semibold text-primary">
                  +${weeklyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedPlan === 'weekly' ? 'Monthly Estimate' : 'Monthly Profit'}
              </span>
              <span className="font-semibold text-secondary">
                +${monthlyProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total in 1 Month</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Minimum Amount Warning */}
          {currentPlan && principal > 0 && principal < parseFloat(currentPlan.minAmount) && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">
                Minimum investment for {currentPlan.name} is ${parseFloat(currentPlan.minAmount).toLocaleString()}
              </p>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            disabled={!currentPlan || principal < parseFloat(currentPlan?.minAmount || '0')}
            data-testid="button-start-investing"
          >
            Start Investing
          </Button>
        </CardContent>
      </Card>
      
      {/* Quick Stats */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-semibold">Platform Statistics</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Success Rate</span>
              <Badge variant="secondary" className="text-secondary">98.7%</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Investors</span>
              <span className="font-semibold">12,547</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Paid Out</span>
              <span className="font-semibold">$8.2M</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
