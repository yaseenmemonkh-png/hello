import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, ChartLine, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'referral_bonus';
  amount: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  walletAddress?: string;
  createdAt: string;
}

export default function TransactionHistory() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    staleTime: 30000, // 30 seconds
  });

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="text-secondary" />;
      case 'withdrawal':
        return <ArrowUp className="text-primary" />;
      case 'profit':
      case 'referral_bonus':
        return <ChartLine className="text-accent" />;
      case 'investment':
        return <ChartLine className="text-primary" />;
      default:
        return <ChartLine className="text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'profit':
      case 'referral_bonus':
        return 'text-secondary';
      case 'withdrawal':
      case 'investment':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAmountPrefix = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'profit':
      case 'referral_bonus':
        return '+';
      case 'withdrawal':
      case 'investment':
        return '-';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-secondary" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-accent" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-3 h-3 text-destructive" />;
      default:
        return null;
    }
  };

  const formatTransactionType = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'profit':
        return 'Profit Earned';
      case 'investment':
        return 'Investment';
      case 'referral_bonus':
        return 'Referral Bonus';
      default:
        return type;
    }
  };

  const formatStatus = (status: Transaction['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          {transactions.length > 0 && (
            <Button variant="outline" size="sm" data-testid="button-view-all-transactions">
              View All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartLine className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your transaction history will appear here once you make your first deposit or investment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id} 
                className="p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${transaction.type === 'deposit' || transaction.type === 'profit' || transaction.type === 'referral_bonus' 
                        ? 'bg-secondary/20' 
                        : transaction.type === 'withdrawal' || transaction.type === 'investment'
                        ? 'bg-primary/20'
                        : 'bg-muted'
                      }
                    `}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">{formatTransactionType(transaction.type)}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy - h:mm a')}
                        </p>
                        {transaction.walletAddress && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground font-mono">
                              {transaction.walletAddress.slice(0, 6)}...{transaction.walletAddress.slice(-4)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {getAmountPrefix(transaction.type)}${parseFloat(transaction.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end space-x-1">
                      {getStatusIcon(transaction.status)}
                      <p className="text-xs text-muted-foreground">
                        {formatStatus(transaction.status)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {transaction.description && (
                  <p className="mt-2 text-sm text-muted-foreground ml-14">
                    {transaction.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {transactions.length > 5 && (
          <>
            <Separator />
            <div className="p-6 text-center">
              <Button variant="outline" className="w-full" data-testid="button-load-more-transactions">
                Load More Transactions
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
