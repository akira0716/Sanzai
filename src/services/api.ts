import type { Transaction } from "../types";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-aaa005ee`;

class ApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const accessToken = localStorage.getItem("supabase_access_token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken || publicAnonKey}`,
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async signup(email: string, password: string, name: string) {
    return this.makeRequest("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    return this.makeRequest("/transactions");
  }

  async addTransaction(
    transaction: Omit<Transaction, "id">
  ): Promise<{ transaction: Transaction }> {
    return this.makeRequest("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/transactions/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
