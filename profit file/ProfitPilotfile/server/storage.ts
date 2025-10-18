import {
  users,
  investments,
  investmentPlans,
  transactions,
  faqs,
  type User,
  type UpsertUser,
  type Investment,
  type InvestmentPlan,
  type Transaction,
  type FAQ,
  type InsertInvestment,
  type InsertTransaction,
  type InsertFAQ,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  setUserTrc20Address(userId: string, trc20Address: string): Promise<User | null>;
  
  // Investment operations
  getInvestmentPlans(): Promise<InvestmentPlan[]>;
  getUserInvestments(userId: string): Promise<any[]>;
  getInvestmentById(investmentId: string): Promise<Investment | null>;
  createInvestment(userId: string, investment: InsertInvestment): Promise<Investment>;
  updateInvestmentProfit(investmentId: string, profit: number): Promise<void>;
  completeInvestment(investmentId: string): Promise<boolean>;
  getLockedBalance(userId: string): Promise<number>;
  
  // Transaction operations
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(transactionId: string, status: 'pending' | 'completed' | 'failed' | 'cancelled'): Promise<void>;
  
  // FAQ operations
  getFAQs(): Promise<FAQ[]>;
  
  // User balance operations
  updateUserBalance(userId: string, amount: number): Promise<void>;
  addUserProfit(userId: string, profit: number): Promise<void>;
  
  // Referral operations
  addReferralBonus(userId: string, referrerId: string, amount: number): Promise<void>;
  setReferredBy(userId: string, referrerId: string): Promise<void>;
  incrementSuccessfulReferrals(referrerId: string): Promise<void>;
  checkAndUpdateReferralTier(referrerId: string): Promise<void>;
  addLifetimeCommission(referrerId: string, investmentAmount: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Generate referral code if not exists (use last 8 chars of ID, uppercase)
    const referralCode = userData.id.slice(-8).toUpperCase();
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        referralCode,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async setUserTrc20Address(userId: string, trc20Address: string): Promise<User | null> {
    // Only allow setting TRC20 address if not already set (immutable)
    const result = await db
      .update(users)
      .set({
        trc20Address,
        updatedAt: new Date(),
      })
      .where(and(
        eq(users.id, userId),
        isNull(users.trc20Address)
      ))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  // Investment operations
  async getInvestmentPlans(): Promise<InvestmentPlan[]> {
    return await db
      .select()
      .from(investmentPlans)
      .where(eq(investmentPlans.isActive, true));
  }

  async getInvestmentById(investmentId: string): Promise<Investment | null> {
    const [investment] = await db
      .select()
      .from(investments)
      .where(eq(investments.id, investmentId))
      .limit(1);
    return investment || null;
  }

  async getUserInvestments(userId: string): Promise<any[]> {
    return await db
      .select({
        id: investments.id,
        userId: investments.userId,
        planId: investments.planId,
        amount: investments.amount,
        currentProfit: investments.currentProfit,
        totalReturn: investments.totalReturn,
        startDate: investments.startDate,
        endDate: investments.endDate,
        isActive: investments.isActive,
        isCompleted: investments.isCompleted,
        createdAt: investments.createdAt,
        updatedAt: investments.updatedAt,
        planName: investmentPlans.name,
        planType: investmentPlans.type,
        roiPercentage: investmentPlans.roiPercentage,
      })
      .from(investments)
      .leftJoin(investmentPlans, eq(investments.planId, investmentPlans.id))
      .where(eq(investments.userId, userId))
      .orderBy(desc(investments.createdAt));
  }

  async createInvestment(userId: string, investment: InsertInvestment): Promise<Investment> {
    // Get the plan details
    const [plan] = await db
      .select()
      .from(investmentPlans)
      .where(eq(investmentPlans.id, investment.planId));
    
    if (!plan) {
      throw new Error('Investment plan not found');
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const [newInvestment] = await db
      .insert(investments)
      .values({
        ...investment,
        userId,
        endDate,
      })
      .returning();
    
    return newInvestment;
  }

  async updateInvestmentProfit(investmentId: string, profit: number): Promise<void> {
    await db
      .update(investments)
      .set({
        currentProfit: sql`${investments.currentProfit} + ${profit}`,
        totalReturn: sql`${investments.amount} + ${investments.currentProfit} + ${profit}`,
        updatedAt: new Date(),
      })
      .where(eq(investments.id, investmentId));
  }

  // Transaction operations
  async getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(userId: string, transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        ...transaction,
        userId,
      })
      .returning();
    
    return newTransaction;
  }

  async updateTransactionStatus(
    transactionId: string, 
    status: 'pending' | 'completed' | 'failed' | 'cancelled'
  ): Promise<void> {
    await db
      .update(transactions)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));
  }

  // FAQ operations
  async getFAQs(): Promise<FAQ[]> {
    return await db
      .select()
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(faqs.order, faqs.createdAt);
  }

  // User balance operations
  async updateUserBalance(userId: string, amount: number): Promise<void> {
    await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async addUserProfit(userId: string, profit: number): Promise<void> {
    await db
      .update(users)
      .set({
        totalProfit: sql`${users.totalProfit} + ${profit}`,
        balance: sql`${users.balance} + ${profit}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Referral operations
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user;
  }

  async addReferralBonus(userId: string, referrerId: string, amount: number): Promise<void> {
    // Update referrer's earnings and balance
    await db
      .update(users)
      .set({
        referralEarnings: sql`${users.referralEarnings} + ${amount}`,
        balance: sql`${users.balance} + ${amount}`,
        referrals: sql`${users.referrals} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, referrerId));
  }

  async setReferredBy(userId: string, referrerId: string): Promise<void> {
    await db
      .update(users)
      .set({
        referredBy: referrerId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Investment completion (atomic - returns true if this call actually completed it)
  async completeInvestment(investmentId: string): Promise<boolean> {
    const result = await db
      .update(investments)
      .set({
        isCompleted: true,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(
        eq(investments.id, investmentId),
        eq(investments.isCompleted, false)
      ))
      .returning({ id: investments.id });
    
    // Return true if we actually updated the row (i.e., we were first to complete it)
    return result.length > 0;
  }

  async getLockedBalance(userId: string): Promise<number> {
    const activeInvestments = await db
      .select({
        total: sql<number>`COALESCE(SUM(${investments.amount}), 0)`,
      })
      .from(investments)
      .where(
        and(
          eq(investments.userId, userId),
          eq(investments.isActive, true),
          eq(investments.isCompleted, false)
        )
      );
    
    return Number(activeInvestments[0]?.total || 0);
  }

  async incrementSuccessfulReferrals(referrerId: string): Promise<void> {
    await db
      .update(users)
      .set({
        successfulReferrals: sql`${users.successfulReferrals} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, referrerId));
  }

  async checkAndUpdateReferralTier(referrerId: string): Promise<void> {
    const [referrer] = await db
      .select()
      .from(users)
      .where(eq(users.id, referrerId));

    if (!referrer) return;

    const successfulReferrals = referrer.successfulReferrals || 0;

    // Tier 1: 10 successful referrals = $50 bonus (one-time)
    if (successfulReferrals === 10) {
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + 50`,
          referralEarnings: sql`${users.referralEarnings} + 50`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, referrerId));

      // Create transaction for tier bonus
      await this.createTransaction(referrerId, {
        type: 'referral_bonus',
        amount: '50.00',
        description: 'Tier 1 Bonus: 10 Successful Referrals',
      });
    }

    // Tier 2: 50 successful referrals = 1% lifetime commission
    if (successfulReferrals === 50) {
      await db
        .update(users)
        .set({
          lifetimeCommissionRate: '1.00',
          updatedAt: new Date(),
        })
        .where(eq(users.id, referrerId));
    }

    // Tier 3: 100 successful referrals = VIP partner badge + higher profit share
    if (successfulReferrals === 100) {
      await db
        .update(users)
        .set({
          isVipPartner: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, referrerId));
    }
  }

  async addLifetimeCommission(referrerId: string, investmentAmount: number): Promise<void> {
    const [referrer] = await db
      .select()
      .from(users)
      .where(eq(users.id, referrerId));

    if (!referrer || parseFloat(referrer.lifetimeCommissionRate || '0') === 0) {
      return;
    }

    const commissionRate = parseFloat(referrer.lifetimeCommissionRate || '0') / 100;
    const commission = investmentAmount * commissionRate;

    await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${commission}`,
        referralEarnings: sql`${users.referralEarnings} + ${commission}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, referrerId));

    // Create transaction for lifetime commission
    await this.createTransaction(referrerId, {
      type: 'referral_bonus',
      amount: commission.toFixed(2),
      description: `Lifetime Commission (${referrer.lifetimeCommissionRate}%) from referral investment`,
    });
  }
}

export const storage = new DatabaseStorage();
