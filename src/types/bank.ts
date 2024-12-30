export interface Bank {
  id: number;
  bank_code: string;
  bank_name: string;
  account_name: string;
  bank_number: string;
  api_type: number;
  balance: number;
  status: number;
  status_withdraw: number;
  status_withdraw_auto: number;
  max_amount_withdraw_auto: number;
  updated_at: string;
}
