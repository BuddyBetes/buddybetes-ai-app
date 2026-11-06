import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { identifyPurchaser, usesAppStoreBilling } from "@/lib/purchases";

// Keeps the RevenueCat customer in sync with the signed-in Supabase user (iOS only)
const PurchasesIdentity = () => {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!usesAppStoreBilling() || loading) return;
    identifyPurchaser(userId);
  }, [userId, loading]);

  return null;
};

export default PurchasesIdentity;
