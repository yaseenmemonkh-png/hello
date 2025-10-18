import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChartLine, 
  Shield, 
  Rocket, 
  Wallet, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  CheckCircle 
} from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/api/login";
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/api/login";
  };

  const handleSocialAuth = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding and Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <ChartLine className="text-2xl text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                InvestPro
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">Smart investing made simple</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Bank-Level Security</h3>
                <p className="text-muted-foreground text-sm">Multi-factor authentication and encrypted transactions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Rocket className="text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">High Returns</h3>
                <p className="text-muted-foreground text-sm">Up to 50% monthly returns on your investments</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wallet className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Instant Transactions</h3>
                <p className="text-muted-foreground text-sm">Connect with Trust Wallet or other crypto wallets for seamless deposits</p>
              </div>
            </div>
          </div>
          
          <Card className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 space-y-3 border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Total Investments</span>
              <span className="text-secondary font-semibold">↑ 24%</span>
            </div>
            <div className="text-3xl font-bold">$2,847,392</div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{width: '68%'}}></div>
            </div>
          </Card>
        </div>
        
        {/* Right Side - Auth Forms */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl overflow-hidden border-border">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted">
                  <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login" className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-muted-foreground text-sm">Enter your credentials to continue</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-12"
                          required
                          data-testid="input-login-email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-12 pr-12"
                          required
                          data-testid="input-login-password"
                        />
                        <Button 
                          type="button" 
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          data-testid="button-toggle-login-password"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" data-testid="checkbox-remember" />
                        <Label htmlFor="remember" className="text-muted-foreground cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <a href="#" className="text-primary hover:underline">Forgot password?</a>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      data-testid="button-login"
                    >
                      Sign In
                    </Button>
                  </form>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="py-3"
                      onClick={handleSocialAuth}
                      data-testid="button-google-login"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="py-3"
                      onClick={handleSocialAuth}
                      data-testid="button-biometric-login"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1C8.686 1 6 3.686 6 7v2H5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V11c0-1.103-.897-2-2-2h-1V7c0-3.314-2.686-6-6-6zM8 7c0-2.206 1.794-4 4-4s4 1.794 4 4v2H8V7z"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="py-3"
                      onClick={handleSocialAuth}
                      data-testid="button-faceid-login"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Sign Up Form */}
                <TabsContent value="signup" className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Create Account</h2>
                    <p className="text-muted-foreground text-sm">Start your investment journey today</p>
                  </div>
                  
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-12"
                          required
                          data-testid="input-signup-name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-12"
                          required
                          data-testid="input-signup-email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-12 pr-12"
                          required
                          data-testid="input-signup-password"
                        />
                        <Button 
                          type="button" 
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          data-testid="button-toggle-signup-password"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Must be at least 8 characters with uppercase, lowercase, and numbers</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="signup-confirm"
                          type="password"
                          placeholder="••••••••"
                          className="pl-12"
                          required
                          data-testid="input-signup-confirm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox id="terms" required data-testid="checkbox-terms" />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                        I agree to the <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and Privacy Policy
                      </Label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      data-testid="button-signup"
                    >
                      Create Account
                    </Button>
                  </form>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="py-3"
                      onClick={handleSocialAuth}
                      data-testid="button-google-signup"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="py-3"
                      onClick={handleSocialAuth}
                      data-testid="button-biometric-signup"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1C8.686 1 6 3.686 6 7v2H5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V11c0-1.103-.897-2-2-2h-1V7c0-3.314-2.686-6-6-6zM8 7c0-2.206 1.794-4 4-4s4 1.794 4 4v2H8V7z"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="py-3"
                      onClick={handleSocialAuth}
                      data-testid="button-faceid-signup"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
            
            {/* Trust Indicators */}
            <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Secure Wallet</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
