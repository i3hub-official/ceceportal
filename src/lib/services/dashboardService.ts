// app/dashboard/services/dashboardService.ts

export interface Candidate {
  id: number;
  name: string;
  examNumber: string;
  class: string;
  subjects: string[];
  status: "Registered" | "Pending" | "Completed";
  registrationDate: string;
  avatar: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  status: "Completed" | "Pending";
  type: "Credit" | "Debit";
}

export interface DashboardStats {
  totalCandidates: number;
  registeredCandidates: number;
  pendingCandidates: number;
  completedCandidates: number;
}

export const dashboardService = {
  async getCandidates(): Promise<Candidate[]> {
    return [
      {
        id: 1,
        name: "Chinwe Okoro",
        examNumber: "CEC2024-001",
        class: "SS3",
        subjects: ["Mathematics", "English", "Physics", "Chemistry"],
        status: "Registered",
        registrationDate: "2024-03-15",
        avatar: "CO",
      },
      {
        id: 2,
        name: "Emmanuel Nwosu",
        examNumber: "CEC2024-002",
        class: "SS3",
        subjects: ["Mathematics", "English", "Chemistry", "Biology"],
        status: "Registered",
        registrationDate: "2024-03-16",
        avatar: "EN",
      },
      {
        id: 3,
        name: "Amara Eze",
        examNumber: "CEC2024-003",
        class: "SS3",
        subjects: ["Mathematics", "English", "Biology"],
        status: "Pending",
        registrationDate: "2024-03-17",
        avatar: "AE",
      },
    ];
  },

  async getTransactions(): Promise<Transaction[]> {
    return [
      {
        id: 1,
        date: "2024-03-15",
        description: "Registration Fee - 50 Students",
        amount: 75000,
        status: "Completed",
        type: "Credit",
      },
      {
        id: 2,
        date: "2024-03-18",
        description: "Additional Registration - 10 Students",
        amount: 15000,
        status: "Completed",
        type: "Credit",
      },
      {
        id: 3,
        date: "2024-03-20",
        description: "Service Charge",
        amount: 2000,
        status: "Pending",
        type: "Debit",
      },
    ];
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const candidates = await this.getCandidates();
    return {
      totalCandidates: candidates.length,
      registeredCandidates: candidates.filter((c) => c.status === "Registered")
        .length,
      pendingCandidates: candidates.filter((c) => c.status === "Pending")
        .length,
      completedCandidates: candidates.filter((c) => c.status === "Completed")
        .length,
    };
  },
};
