import { storage } from "./storage";
import { db } from "./db";
import { investments } from "@shared/schema";
import { and, eq, lte, sql } from "drizzle-orm";

/**
 * Background worker to automatically complete investments and payout profits
 * Runs periodically to check for investments that have reached their end date
 */
export async function processCompletedInvestments() {
  try {
    console.log('[Investment Worker] Checking for completed investments...');
    
    // Find all active investments that have reached their end date
    const now = new Date();
    const completedInvestments = await db
      .select({
        id: investments.id,
        userId: investments.userId,
        amount: investments.amount,
        planId: investments.planId,
        endDate: investments.endDate,
      })
      .from(investments)
      .where(
        and(
          eq(investments.isActive, true),
          eq(investments.isCompleted, false),
          lte(investments.endDate, now)
        )
      );

    if (completedInvestments.length === 0) {
      console.log('[Investment Worker] No completed investments found');
      return;
    }

    console.log(`[Investment Worker] Processing ${completedInvestments.length} completed investments...`);

    // Process each completed investment
    for (const investment of completedInvestments) {
      try {
        // Get investment plan details to calculate profit
        const userInvestments = await storage.getUserInvestments(investment.userId);
        const investmentDetails = userInvestments.find(inv => inv.id === investment.id);
        
        if (!investmentDetails) {
          console.error(`[Investment Worker] Investment ${investment.id} not found`);
          continue;
        }

        const principal = parseFloat(investmentDetails.amount || '0');
        const roiRate = parseFloat(investmentDetails.roiPercentage || '0') / 100;
        const profit = principal * roiRate;

        // Atomically complete the investment (only first caller succeeds)
        const wasCompletedByUs = await storage.completeInvestment(investment.id);

        // Only process payout if WE were the ones who completed it
        if (!wasCompletedByUs) {
          console.log(`[Investment Worker] Investment ${investment.id} already completed by another process`);
          continue;
        }

        // We successfully completed it - process the payout
        // Return principal to balance (not included in addUserProfit)
        await storage.updateUserBalance(investment.userId, principal);

        // Add profit to total profit tracking (this also adds profit to balance)
        await storage.addUserProfit(investment.userId, profit);

        // Create profit transaction
        await storage.createTransaction(investment.userId, {
          type: 'profit',
          amount: profit.toFixed(2),
          description: `Investment profit from ${investmentDetails.planName || 'plan'}`,
        });

        console.log(`[Investment Worker] Completed investment ${investment.id} - Returned principal $${principal.toFixed(2)} + profit $${profit.toFixed(2)} to user ${investment.userId}`);
      } catch (error) {
        console.error(`[Investment Worker] Error processing investment ${investment.id}:`, error);
      }
    }

    console.log('[Investment Worker] Processing complete');
  } catch (error) {
    console.error('[Investment Worker] Error in processCompletedInvestments:', error);
  }
}

/**
 * Start the investment worker
 * Runs every hour to check for completed investments
 */
export function startInvestmentWorker() {
  const INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  console.log('[Investment Worker] Starting investment worker (runs every hour)');

  // Run immediately on startup
  processCompletedInvestments();

  // Then run every hour
  setInterval(processCompletedInvestments, INTERVAL);
}
