import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  integer,
  boolean,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  totalProfit: decimal("total_profit", { precision: 15, scale: 2 }).default("0.00"),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"), // User ID of the person who referred this user
  referrals: integer("referrals").default(0),
  successfulReferrals: integer("successful_referrals").default(0), // Count of referrals who made deposits
  referralEarnings: decimal("referral_earnings", { precision: 15, scale: 2 }).default("0.00"),
  lifetimeCommissionRate: decimal("lifetime_commission_rate", { precision: 5, scale: 2 }).default("0.00"), // 1% for 50+ referrals
  isVipPartner: boolean("is_vip_partner").default(false), // True for 100+ referrals
  walletAddress: varchar("wallet_address"), // Deprecated - use trc20Address
  trc20Address: varchar("trc20_address").unique(), // User's TRC20 wallet address (immutable after set)
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investment plan types
export const planTypeEnum = pgEnum('plan_type', ['weekly', 'monthly']);

// Investment plans
export const investmentPlans = pgTable("investment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: planTypeEnum("type").notNull(),
  roiPercentage: decimal("roi_percentage", { precision: 5, scale: 2 }).notNull(),
  minAmount: decimal("min_amount", { precision: 15, scale: 2 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 15, scale: 2 }),
  durationDays: integer("duration_days").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User investments
export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => investmentPlans.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currentProfit: decimal("current_profit", { precision: 15, scale: 2 }).default("0.00"),
  totalReturn: decimal("total_return", { precision: 15, scale: 2 }).default("0.00"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction types
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'profit', 'investment', 'referral_bonus']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").default('pending'),
  description: text("description"),
  referenceId: varchar("reference_id"), // For external transaction IDs
  walletAddress: varchar("wallet_address"), // User's TRC20 address (source)
  depositToAddress: varchar("deposit_to_address"), // Admin TRC20 address (destination for deposits)
  planType: planTypeEnum("plan_type"), // weekly or monthly (for deposit tracking)
  txHash: varchar("tx_hash"), // Blockchain transaction hash
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FAQ
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  investments: many(investments),
  transactions: many(transactions),
}));

export const investmentPlansRelations = relations(investmentPlans, ({ many }) => ({
  investments: many(investments),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  user: one(users, {
    fields: [investments.userId],
    references: [users.id],
  }),
  plan: one(investmentPlans, {
    fields: [investments.planId],
    references: [investmentPlans.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).pick({
  planId: true,
  amount: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  amount: true,
  description: true,
  walletAddress: true,
  depositToAddress: true,
  planType: true,
});

export const insertFaqSchema = createInsertSchema(faqs).pick({
  question: true,
  answer: true,
  category: true,
  order: true,
});

// TRC20 address validation schema
export const trc20AddressSchema = z.object({
  trc20Address: z.string()
    .regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, "Invalid TRC20 address format")
    .describe("Tron TRC20 wallet address starting with T"),
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema> & { id: string };
export type User = typeof users.$inferSelect;
export type Trc20AddressInput = z.infer<typeof trc20AddressSchema>;
export type Investment = typeof investments.$inferSelect;
export type InvestmentPlan = typeof investmentPlans.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type FAQ = typeof faqs.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;
