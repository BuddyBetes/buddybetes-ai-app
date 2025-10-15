export interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  duration_days: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscountRedemption {
  id: string;
  user_id: string;
  discount_code_id: string;
  subscription_id: string | null;
  redeemed_at: string;
  profiles?: {
    email: string | null;
  };
  discount_codes?: {
    code: string;
    discount_percentage: number;
  };
}

export interface DiscountCodeFormData {
  code: string;
  discount_percentage: number;
  duration_days?: number | null;
  max_uses?: number | null;
  expires_at?: string | null;
  is_active: boolean;
}
