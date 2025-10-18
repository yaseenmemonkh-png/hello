import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { trc20AddressSchema, type Trc20AddressInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Lock, Shield } from "lucide-react";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<Trc20AddressInput>({
    resolver: zodResolver(trc20AddressSchema),
    defaultValues: {
      trc20Address: "",
    },
  });

  const saveTrc20Mutation = useMutation({
    mutationFn: async (data: Trc20AddressInput) => {
      return await apiRequest('POST', '/api/profile/trc20', data);
    },
    onSuccess: () => {
      toast({
        title: "TRC20 Address Saved",
        description: "Your wallet address has been successfully registered.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save TRC20 address",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Trc20AddressInput) => {
    saveTrc20Mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-purple-900/20 backdrop-blur">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Wallet className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">
            Register Your TRC20 Wallet
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Enter your TRC20 wallet address to complete registration. This address will be used for all deposits and withdrawals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="trc20Address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">TRC20 Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="T..."
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        data-testid="input-trc20-address"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500 text-sm">
                      Must start with 'T' and be 34 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-purple-400 mt-0.5" />
                  <p className="text-xs text-slate-400">
                    Your TRC20 address <strong className="text-purple-400">cannot be changed</strong> once saved. Ensure it's correct before continuing.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-purple-400 mt-0.5" />
                  <p className="text-xs text-slate-400">
                    Only deposits from this address will be accepted to verify your identity.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                disabled={saveTrc20Mutation.isPending}
                data-testid="button-save-trc20"
              >
                {saveTrc20Mutation.isPending ? "Saving..." : "Save & Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
