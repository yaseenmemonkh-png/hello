import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Wallet, 
  ArrowDown, 
  ArrowUp, 
  Copy, 
  ExternalLink,
  DollarSign,
  CreditCard
} from "lucide-react";

// Deposit addresses for different plans
const DEPOSIT_ADDRESSES = {
  weekly: "TLYFVE2osiDPDwXrBuziWtkxLCsgfYvppM",
  monthly: "TPkL2MzntUSx4686rDv34eZRYxrRj5NmpG",
};

export default function WalletSection() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [planType, setPlanType] = useState<"weekly" | "monthly">("weekly");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User's registered TRC20 address
  const userTrc20Address = user?.trc20Address || "Not set";
  const depositAddress = DEPOSIT_ADDRESSES[planType];

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; walletAddress: string; referralCode?: string; planType: "weekly" | "monthly" }) => {
      return await apiRequest('POST', '/api/transactions/deposit', data);
    },
    onSuccess: () => {
      toast({
        title: "Deposit Initiated",
        description: "Your deposit has been initiated and will be processed shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setDepositOpen(false);
      setDepositAmount("");
      setWalletAddress("");
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
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: string; walletAddress: string }) => {
      return await apiRequest('POST', '/api/transactions/withdraw', data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal has been initiated and will be processed shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setWithdrawOpen(false);
      setWithdrawAmount("");
      setWalletAddress("");
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
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }
    
    depositMutation.mutate({
      amount: depositAmount,
      walletAddress: walletAddress || userTrc20Address,
      referralCode: referralCode,
      planType: planType,
    });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawalAmount = parseFloat(withdrawAmount);
    const userBalance = parseFloat(user?.balance || '0');

    if (!withdrawAmount || withdrawalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      amount: withdrawAmount,
      walletAddress: walletAddress || userTrc20Address,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Wallet & Transactions</h3>
      
      {/* Wallet Connection */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg mb-1">Registered TRC20 Wallet</CardTitle>
              <p className="text-sm text-muted-foreground">Your deposit address</p>
            </div>
            {userTrc20Address === "Not set" && (
              <Badge variant="destructive">Not Set</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <Wallet className="text-accent w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">TRC20 Address</p>
                {userTrc20Address === "Not set" ? (
                  <p className="text-sm text-muted-foreground">Please set your TRC20 address</p>
                ) : (
                  <p className="font-mono text-sm truncate">{userTrc20Address}</p>
                )}
              </div>
            </div>
            {userTrc20Address !== "Not set" && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(userTrc20Address);
                  toast({ title: "Copied!", description: "TRC20 address copied to clipboard" });
                }}
                data-testid="button-copy-wallet"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:scale-[1.02] transition-all" data-testid="button-open-deposit">
              <CardContent className="p-6 text-left">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                  <ArrowDown className="text-secondary text-xl" />
                </div>
                <h4 className="font-semibold mb-1">Deposit Funds</h4>
                <p className="text-sm text-muted-foreground">Add money to your wallet</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md" data-testid="modal-deposit">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <ArrowDown className="text-secondary w-5 h-5" />
                <span>Deposit Funds</span>
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Select Investment Plan</Label>
                  <RadioGroup 
                    value={planType} 
                    onValueChange={(value: string) => setPlanType(value as "weekly" | "monthly")}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="weekly"
                        id="weekly"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="weekly"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="text-sm font-medium">Weekly Plan</span>
                        <span className="text-xs text-muted-foreground">10% ROI</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="monthly"
                        id="monthly"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="monthly"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="text-sm font-medium">Monthly Plan</span>
                        <span className="text-xs text-muted-foreground">50% ROI</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Deposit To (Admin Address)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(depositAddress);
                          toast({ title: "Copied!", description: "Deposit address copied to clipboard" });
                        }}
                        className="h-6 px-2"
                        data-testid="button-copy-deposit-address"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs font-mono bg-background/50 p-2 rounded break-all">
                      {depositAddress}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Your TRC20 Address (Send From)</Label>
                    <p className="text-xs font-mono bg-background/50 p-2 rounded break-all text-muted-foreground">
                      {userTrc20Address}
                    </p>
                    <p className="text-xs text-yellow-500/80">
                      ⚠️ Only deposits from your registered TRC20 address will be accepted
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="100.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="pl-10"
                      min="100"
                      step="0.01"
                      required
                      data-testid="input-deposit-amount"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum deposit: $100
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit-wallet">Wallet Address (Optional)</Label>
                  <Input
                    id="deposit-wallet"
                    type="text"
                    placeholder={userTrc20Address !== "Not set" ? `${userTrc20Address.slice(0, 12)}...${userTrc20Address.slice(-6)}` : "Enter wallet address"}
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="font-mono text-sm"
                    data-testid="input-deposit-wallet"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use your registered TRC20 address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                  <Input
                    id="referral-code"
                    type="text"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="uppercase"
                    data-testid="input-referral-code"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get $5 bonus for your referrer on first deposit
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setDepositOpen(false)}
                  disabled={depositMutation.isPending}
                  data-testid="button-cancel-deposit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                  disabled={depositMutation.isPending || !depositAmount}
                  data-testid="button-confirm-deposit"
                >
                  {depositMutation.isPending ? "Processing..." : "Confirm Deposit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:scale-[1.02] transition-all" data-testid="button-open-withdraw">
              <CardContent className="p-6 text-left">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <ArrowUp className="text-primary text-xl" />
                </div>
                <h4 className="font-semibold mb-1">Withdraw Funds</h4>
                <p className="text-sm text-muted-foreground">Transfer to your wallet</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md" data-testid="modal-withdraw">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <ArrowUp className="text-primary w-5 h-5" />
                <span>Withdraw Funds</span>
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-primary font-medium">
                    ⏱️ Withdrawal Processing Time: Within 24 hours
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your withdrawal will be processed and sent to your wallet within 24 hours
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available Balance:</span>
                    <span className="font-bold text-secondary">${parseFloat((user as any)?.availableBalance || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Locked in Active Investments:</span>
                    <span className="font-medium text-muted-foreground">${parseFloat((user as any)?.lockedBalance || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Withdrawal Fee:</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Locked funds will be returned with profit when investments complete
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="100.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-10"
                      min="1"
                      max={user?.balance || '0'}
                      step="0.01"
                      required
                      data-testid="input-withdraw-amount"
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Minimum: $1.00</span>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => setWithdrawAmount(user?.balance || '0')}
                      data-testid="button-withdraw-max"
                    >
                      Use Max
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdraw-wallet">Destination Wallet</Label>
                  <Input
                    id="withdraw-wallet"
                    type="text"
                    placeholder={userTrc20Address !== "Not set" ? `${userTrc20Address.slice(0, 12)}...${userTrc20Address.slice(-6)}` : "Enter destination wallet"}
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="font-mono text-sm"
                    data-testid="input-withdraw-wallet"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use your registered TRC20 address
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setWithdrawOpen(false)}
                  disabled={withdrawMutation.isPending}
                  data-testid="button-cancel-withdraw"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={
                    withdrawMutation.isPending || 
                    !withdrawAmount || 
                    parseFloat(withdrawAmount) > parseFloat(user?.balance || '0')
                  }
                  data-testid="button-confirm-withdraw"
                >
                  {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
