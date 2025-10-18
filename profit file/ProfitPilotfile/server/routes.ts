import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertInvestmentSchema, insertTransactionSchema, trc20AddressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed investment plans on startup
  await seedInvestmentPlans();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Get locked balance for display purposes
      const lockedBalance = await storage.getLockedBalance(userId);
      // Available balance is the current balance (investment amounts are already deducted)
      const availableBalance = parseFloat(user?.balance || '0');
      
      res.json({
        ...user,
        lockedBalance: lockedBalance.toFixed(2),
        availableBalance: availableBalance.toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Set TRC20 address (one-time only, immutable)
  app.post('/api/profile/trc20', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = trc20AddressSchema.parse(req.body);
      
      const updatedUser = await storage.setUserTrc20Address(userId, data.trc20Address);
      
      if (!updatedUser) {
        return res.status(400).json({ 
          message: "TRC20 address already set or user not found. TRC20 addresses cannot be changed once set." 
        });
      }
      
      res.json({ 
        message: "TRC20 address saved successfully",
        trc20Address: updatedUser.trc20Address 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      
      // Handle unique constraint violation (TRC20 address already in use by another user)
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        return res.status(400).json({ 
          message: "This TRC20 address is already registered to another user. Please use a different address." 
        });
      }
      
      console.error("Error setting TRC20 address:", error);
      res.status(500).json({ message: "Failed to save TRC20 address" });
    }
  });

  // Investment Plans
  app.get('/api/investment-plans', async (req, res) => {
    try {
      const plans = await storage.getInvestmentPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching investment plans:", error);
      res.status(500).json({ message: "Failed to fetch investment plans" });
    }
  });

  // User Investments
  app.get('/api/investments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const investments = await storage.getUserInvestments(userId);
      
      // Auto-complete investments that have reached their end date
      const now = new Date();
      for (const investment of investments) {
        if (investment.isActive && !investment.isCompleted && investment.endDate && new Date(investment.endDate) <= now) {
          // Calculate final profit
          const principal = parseFloat(investment.amount || '0');
          const roiRate = parseFloat(investment.roiPercentage || '0') / 100;
          const profit = principal * roiRate;
          
          // Atomically complete the investment (only first caller succeeds)
          const wasCompletedByUs = await storage.completeInvestment(investment.id);
          
          // Only process payout if WE were the ones who completed it
          if (!wasCompletedByUs) {
            console.log(`[Manual Completion] Investment ${investment.id} already completed by another process`);
            // Still update the local object for display
            investment.isCompleted = true;
            investment.isActive = false;
            continue;
          }
          
          // We successfully completed it - process the payout
          // Return principal to balance (not included in addUserProfit)
          await storage.updateUserBalance(userId, principal);
          
          // Add profit to total profit tracking (this also adds profit to balance)
          await storage.addUserProfit(userId, profit);
          
          // Create profit transaction
          await storage.createTransaction(userId, {
            type: 'profit',
            amount: profit.toFixed(2),
            description: `Profit from ${investment.planName || 'investment'}`,
          });
          
          // Update the investment object
          investment.isCompleted = true;
          investment.isActive = false;
          investment.currentProfit = profit.toFixed(2);
          
          console.log(`[Manual Completion] Investment ${investment.id} completed - Principal $${principal.toFixed(2)} + Profit $${profit.toFixed(2)}`);
        }
      }
      
      res.json(investments);
    } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  // Create Investment
  app.post('/api/investments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const investmentData = insertInvestmentSchema.parse(req.body);
      
      // Validate user has sufficient balance
      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.balance || '0') < parseFloat(investmentData.amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct amount from user balance
      await storage.updateUserBalance(userId, -parseFloat(investmentData.amount));

      // Create investment
      const investment = await storage.createInvestment(userId, investmentData);

      // Record transaction
      await storage.createTransaction(userId, {
        type: 'investment',
        amount: investmentData.amount,
        description: `Investment in plan`,
      });

      // Check if user was referred and if referrer has lifetime commission
      if (user.referredBy) {
        await storage.addLifetimeCommission(user.referredBy, parseFloat(investmentData.amount));
      }

      res.json(investment);
    } catch (error) {
      console.error("Error creating investment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid investment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create investment" });
    }
  });

  // User Transactions
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create Deposit Transaction
  app.post('/api/transactions/deposit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, walletAddress, referralCode, planType } = req.body;
      
      // Admin deposit addresses
      const ADMIN_DEPOSIT_ADDRESSES = {
        weekly: "TLYFVE2osiDPDwXrBuziWtkxLCsgfYvppM",
        monthly: "TPkL2MzntUSx4686rDv34eZRYxrRj5NmpG",
      };
      
      // Validate minimum deposit
      if (!amount || parseFloat(amount) < 100) {
        return res.status(400).json({ message: "Minimum deposit amount is $100" });
      }

      // Validate plan type
      if (!planType || !['weekly', 'monthly'].includes(planType)) {
        return res.status(400).json({ message: "Invalid plan type. Must be 'weekly' or 'monthly'" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const depositToAddress = ADMIN_DEPOSIT_ADDRESSES[planType as 'weekly' | 'monthly'];

      // Enhanced logging for deposit tracking
      console.log(`[DEPOSIT] User ${user.email || userId} initiated deposit:`);
      console.log(`  - Amount: $${amount}`);
      console.log(`  - Plan: ${planType}`);
      console.log(`  - From (User TRC20): ${walletAddress}`);
      console.log(`  - To (Admin TRC20): ${depositToAddress}`);
      console.log(`  - Referral Code: ${referralCode || 'None'}`);

      const transaction = await storage.createTransaction(userId, {
        type: 'deposit',
        amount: amount.toString(),
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Deposit`,
        walletAddress,
        depositToAddress,
        planType,
      });

      // Complete the transaction and update balance
      await storage.updateTransactionStatus(transaction.id, 'completed');
      await storage.updateUserBalance(userId, parseFloat(amount.toString()));

      console.log(`[DEPOSIT COMPLETED] Transaction ID: ${transaction.id} - Status: COMPLETED`);
      console.log(`[DEPOSIT SUMMARY] User ${user.email} | $${amount} deposited to ${depositToAddress}`);

      // Handle referral bonus (only if user hasn't been referred before and this is their first deposit)
      if (referralCode && !user.referredBy) {
        const referrer = await storage.getUserByReferralCode(referralCode);
        if (referrer && referrer.id !== userId) {
          console.log(`[REFERRAL BONUS] User ${user.email} used referral code ${referralCode}`);
          console.log(`  - Referrer: ${referrer.email || referrer.id}`);
          console.log(`  - Bonus Amount: $5.00`);
          
          // Give $5 bonus to referrer
          await storage.addReferralBonus(userId, referrer.id, 5);
          await storage.setReferredBy(userId, referrer.id);
          
          // Increment successful referrals count
          await storage.incrementSuccessfulReferrals(referrer.id);
          
          // Check and update referral tier (10, 50, 100 milestones)
          await storage.checkAndUpdateReferralTier(referrer.id);
          
          // Create referral bonus transaction
          await storage.createTransaction(referrer.id, {
            type: 'referral_bonus',
            amount: '5.00',
            description: `Referral bonus from ${user.email || 'user'}`,
          });
          
          console.log(`[REFERRAL BONUS COMPLETED] Bonus credited to ${referrer.email}`);
        }
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error creating deposit:", error);
      res.status(500).json({ message: "Failed to create deposit" });
    }
  });

  // Create Withdrawal Transaction
  app.post('/api/transactions/withdraw', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, walletAddress } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }

      // Check user balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get locked balance for informational purposes
      const lockedBalance = await storage.getLockedBalance(userId);
      // Available balance is current balance (investments already deducted)
      const availableBalance = parseFloat(user.balance || '0');

      if (availableBalance < parseFloat(amount)) {
        return res.status(400).json({ 
          message: `Insufficient balance. You have $${lockedBalance.toFixed(2)} locked in active investments that will be returned when they complete.`,
          lockedBalance: lockedBalance.toFixed(2),
          availableBalance: availableBalance.toFixed(2)
        });
      }

      console.log(`[WITHDRAWAL] User ${user.email || userId} initiated withdrawal:`);
      console.log(`  - Amount: $${amount}`);
      console.log(`  - To (User TRC20): ${walletAddress}`);
      console.log(`  - Available Balance: $${availableBalance.toFixed(2)}`);

      const transaction = await storage.createTransaction(userId, {
        type: 'withdrawal',
        amount: amount.toString(),
        description: `Withdrawal to wallet`,
        walletAddress,
      });

      // Deduct from balance and complete transaction
      await storage.updateUserBalance(userId, -parseFloat(amount.toString()));
      await storage.updateTransactionStatus(transaction.id, 'completed');

      console.log(`[WITHDRAWAL COMPLETED] Transaction ID: ${transaction.id} - $${amount} sent to ${walletAddress}`);

      res.json(transaction);
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ message: "Failed to create withdrawal" });
    }
  });

  // FAQs
  app.get('/api/faqs', async (req, res) => {
    try {
      const faqs = await storage.getFAQs();
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Seed initial investment plans
async function seedInvestmentPlans() {
  try {
    const existingPlans = await storage.getInvestmentPlans();
    if (existingPlans.length === 0) {
      // Insert default plans using raw database access
      const { db } = await import("./db");
      const { investmentPlans } = await import("@shared/schema");
      
      await db.insert(investmentPlans).values([
        {
          name: "Weekly Plan",
          type: "weekly",
          roiPercentage: "10.00",
          minAmount: "100.00",
          maxAmount: "10000.00",
          durationDays: 7,
          isActive: true,
        },
        {
          name: "Monthly Plan", 
          type: "monthly",
          roiPercentage: "50.00",
          minAmount: "500.00",
          maxAmount: "50000.00",
          durationDays: 30,
          isActive: true,
        }
      ]);
      
      console.log("Investment plans seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding investment plans:", error);
  }
}
