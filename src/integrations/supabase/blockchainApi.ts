
import { supabase } from "@/integrations/supabase/client";

// Record a new blockchain transaction
export async function createBlockchainTransaction({
  walletAddress,
  type,
  amount,
}: {
  walletAddress: string;
  type: string;
  amount: number;
}) {
  const { data, error } = await supabase
    .from("blockchain_transactions")
    .insert({
      wallet_address: walletAddress,
      transaction_type: type,
      amount,
      status: "pending",
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Record a blockchain achievement verification
export async function recordAchievementOnChain({
  walletAddress,
  achievementId,
  achievementTitle,
  transactionId,
}: {
  walletAddress: string;
  achievementId: string;
  achievementTitle: string;
  transactionId: string;
}) {
  const { data, error } = await supabase
    .from("player_achievements")
    .insert({
      wallet_address: walletAddress,
      achievement_id: achievementId,
      achievement_title: achievementTitle,
      transaction_id: transactionId,
      verified_on_chain: false,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Get or create the player's token balance row
export async function upsertPlayerTokenBalance({
  walletAddress,
  amount,
  pendingAmount,
}: {
  walletAddress: string;
  amount: number;
  pendingAmount?: number;
}) {
  const { data, error } = await supabase
    .from("player_tokens")
    .upsert(
      {
        wallet_address: walletAddress,
        balance: amount,
        pending_balance: pendingAmount ?? 0,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    )
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Fetch the player's token balance
export async function getPlayerTokenBalance(walletAddress: string) {
  const { data, error } = await supabase
    .from("player_tokens")
    .select("*")
    .eq("wallet_address", walletAddress)
    .maybeSingle();

  if (error) throw error;
  return data;
}
