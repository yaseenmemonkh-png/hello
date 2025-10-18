import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CalendarIcon, CheckCircle, DollarSign } from "lucide-react";

interface InvestmentPlan {
  id: string;
  name: string;
  type: 'weekly' | 'monthly';
  roiPercentage: string;
  minAmount: string;
  maxAmount?: string;
  durationDays: number;
}

interface InvestmentCardProps {
  plan: InvestmentPlan;
  variant: 'primary' | 'secondary';
  badge?: string;
}

export default function InvestmentCard({ plan, variant, badge }: InvestmentCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createInvestmentMutation = useMutation({
    mutationFn: async (investmentData: { planId: string; amount: string }) => {
      return await apiRequest('POST', '/api/investments', investmentData);
    },
    onSuccess: () => {
      toast({
        title: "Investment Created!",
        description: "Your investment has been successfully created and is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setIsOpen(false);
      setAmount("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to create investment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    
    const investmentAmount = parseFloat(amount);
    const minAmount = parseFloat(plan.minAmount);
    const userBalance = parseFloat(user?.balance || '0');

    if (investmentAmount < minAmount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment for ${plan.name} is $${minAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (investmentAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance. Please deposit funds first.",
        variant: "destructive",
      });
      return;
    }

    createInvestmentMutation.mutate({
      planId: plan.id,
      amount: amount,
    });
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <>
      <Card 
        className={`
          ${isPrimary ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' : ''}
          ${isSecondary ? 'bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 relative overflow-hidden' : ''}
          hover:scale-[1.02] transition-all cursor-pointer
        `}
        onClick={() => setIsOpen(true)}
        data-testid={`card-plan-${plan.type}`}
      >
        {isSecondary && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
        )}
        
        <div className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${isPrimary ? 'bg-primary' : 'bg-secondary'}
              `}>
                <CalendarIcon className="text-white text-xl" />
              </div>
              {badge && (
                <Badge className={`
                  text-xs font-bold
                  ${isPrimary ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
                `}>
                  {badge}
                </Badge>
              )}
            </div>
            
            <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
            <p className="text-sm text-muted-foreground mb-6">
              {plan.type === 'weekly' ? 'Perfect for short-term gains' : 'Maximum returns guaranteed'}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-baseline">
                <span className={`text-4xl font-bold ${isPrimary ? 'text-primary' : 'text-secondary'}`}>
                  {plan.roiPercentage}%
                </span>
                <span className="text-muted-foreground ml-2">per {plan.type.slice(0, -2)}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <CheckCircle className={`w-4 h-4 ${isPrimary ? 'text-primary' : 'text-secondary'}`} />
                  <span>{plan.type === 'weekly' ? 'Weekly' : 'Monthly'} profit payout</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <CheckCircle className={`w-4 h-4 ${isPrimary ? 'text-primary' : 'text-secondary'}`} />
                  <span>Minimum: ${parseFloat(plan.minAmount).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <CheckCircle className={`w-4 h-4 ${isPrimary ? 'text-primary' : 'text-secondary'}`} />
                  <span>{plan.type === 'weekly' ? 'Instant withdrawals' : 'Priority support'}</span>
                </div>
              </div>
            </div>
            
            <Button 
              className={`
                w-full py-3 rounded-xl font-semibold hover:opacity-90 transition-all
                ${isPrimary ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
              `}
              data-testid={`button-invest-${plan.type}`}
            >
              Invest Now
            </Button>
          </CardContent>
        </div>
      </Card>

      {/* Investment Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md" data-testid="modal-investment">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${isPrimary ? 'bg-primary' : 'bg-secondary'}
              `}>
                <CalendarIcon className="text-white w-4 h-4" />
              </div>
              <span>Invest in {plan.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleInvest} className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ROI:</span>
                  <span className={`font-semibold ${isPrimary ? 'text-primary' : 'text-secondary'}`}>
                    {plan.roiPercentage}% per {plan.type.slice(0, -2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{plan.durationDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span className="font-semibold">${parseFloat(user?.balance || '0').toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment-amount">Investment Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="investment-amount"
                    type="number"
                    placeholder={plan.minAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10"
                    min={plan.minAmount}
                    max={user?.balance}
                    step="0.01"
                    required
                    data-testid="input-investment-amount"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum: ${parseFloat(plan.minAmount).toLocaleString()} • 
                  Available: ${parseFloat(user?.balance || '0').toLocaleString()}
                </p>
              </div>

              {amount && parseFloat(amount) >= parseFloat(plan.minAmount) && (
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-semibold mb-2">Expected Returns</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Principal:</span>
                      <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {plan.type === 'weekly' ? 'Weekly' : 'Monthly'} Profit:
                      </span>
                      <span className={`font-semibold ${isPrimary ? 'text-primary' : 'text-secondary'}`}>
                        +${(parseFloat(amount) * parseFloat(plan.roiPercentage) / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-medium">Total Return:</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        ${(parseFloat(amount) * (1 + parseFloat(plan.roiPercentage) / 100)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsOpen(false)}
                disabled={createInvestmentMutation.isPending}
                data-testid="button-cancel-investment"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={`
                  flex-1
                  ${isPrimary ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'}
                `}
                disabled={
                  createInvestmentMutation.isPending || 
                  !amount || 
                  parseFloat(amount) < parseFloat(plan.minAmount) ||
                  parseFloat(amount) > parseFloat(user?.balance || '0')
                }
                data-testid="button-confirm-investment"
              >
                {createInvestmentMutation.isPending ? "Creating..." : "Confirm Investment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
