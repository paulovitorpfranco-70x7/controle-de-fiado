import { useEffect, useMemo, useState } from "react";
import { fetchChargeMessages } from "../features/charges/api/fetch-charge-messages";
import { fetchChargeOverview } from "../features/charges/api/fetch-charge-overview";
import { fetchDailyChargeJobMonitor } from "../features/charges/api/fetch-daily-charge-job-monitor";
import { restoreSession, signIn, signOut, subscribeToAuthChanges } from "../features/auth/api/session";
import type { LoginInput } from "../features/auth/types/auth";
import { fetchCustomerDetail } from "../features/customers/api/fetch-customer-detail";
import { fetchCustomers } from "../features/customers/api/fetch-customers";
import { fetchDashboardSummary } from "../features/dashboard/api/fetch-dashboard-summary";
import { fetchPayments } from "../features/payments/api/fetch-payments";
import { fetchSales } from "../features/sales/api/fetch-sales";
import { fetchSystemStatus } from "../features/system/api/fetch-system-status";
import type { AppDataState, AppSection, NoticeState } from "./types";

const initialState: AppDataState = {
  authUser: null,
  customers: [],
  selectedCustomerId: "",
  customerDetail: null,
  dashboardSummary: null,
  sales: [],
  payments: [],
  chargeOverview: null,
  chargeMessages: [],
  dailyChargeJobMonitor: null,
  systemStatus: null,
  loading: true,
  error: null,
  notice: null,
  activeSection: "dashboard"
};

export function useFiadoApp() {
  const [state, setState] = useState<AppDataState>(initialState);

  const isOwner = state.authUser?.role === "OWNER";

  function patchState(patch: Partial<AppDataState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function clearSession() {
    setState((current) => ({
      ...current,
      authUser: null,
      customers: [],
      selectedCustomerId: "",
      customerDetail: null,
      dashboardSummary: null,
      sales: [],
      payments: [],
      chargeOverview: null,
      chargeMessages: [],
      dailyChargeJobMonitor: null,
      systemStatus: null,
      error: null
    }));
  }

  function handleRequestError(err: unknown) {
    const message = err instanceof Error ? err.message : "Falha ao carregar dados.";

    if (message.includes("Token")) {
      clearSession();
    }

    patchState({
      error: message,
      notice: { tone: "error", message }
    });
  }

  async function refreshSelectedCustomer(customerId: string, ownerAccess: boolean) {
    const detailPromise = fetchCustomerDetail(customerId);
    const chargeMessagesPromise = ownerAccess ? fetchChargeMessages(customerId) : Promise.resolve([]);
    const [customerDetail, chargeMessages] = await Promise.all([detailPromise, chargeMessagesPromise]);

    patchState({
      customerDetail,
      chargeMessages: chargeMessages.slice(0, 5)
    });
  }

  async function refreshCoreData(userRole: "OWNER" | "STAFF") {
    const ownerAccess = userRole === "OWNER";
    const [
      customers,
      dashboardSummary,
      sales,
      payments,
      chargeOverview,
      dailyChargeJobMonitor,
      systemStatus
    ] = await Promise.all([
      fetchCustomers(),
      ownerAccess ? fetchDashboardSummary() : Promise.resolve(null),
      fetchSales(),
      ownerAccess ? fetchPayments() : Promise.resolve([]),
      ownerAccess ? fetchChargeOverview() : Promise.resolve(null),
      ownerAccess ? fetchDailyChargeJobMonitor() : Promise.resolve(null),
      ownerAccess ? fetchSystemStatus() : Promise.resolve(null)
    ]);

    const selectedCustomerId = customers[0]?.id ?? "";

    patchState({
      customers,
      selectedCustomerId,
      dashboardSummary,
      sales: sales.slice(0, 6),
      payments: payments.slice(0, 6),
      chargeOverview,
      dailyChargeJobMonitor,
      systemStatus,
      error: null
    });

    if (selectedCustomerId) {
      await refreshSelectedCustomer(selectedCustomerId, ownerAccess);
    } else {
      patchState({
        customerDetail: null,
        chargeMessages: []
      });
    }
  }

  async function restoreAuthSession() {
    try {
      const user = await restoreSession();

      if (!user) {
        patchState({
          authUser: null,
          loading: false
        });
        return;
      }

      patchState({
        authUser: user
      });

      await refreshCoreData(user.role);
    } catch {
      clearSession();
    } finally {
      patchState({ loading: false });
    }
  }

  useEffect(() => {
    restoreAuthSession();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      restoreAuthSession();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!state.authUser || !state.selectedCustomerId) {
      return;
    }

    refreshSelectedCustomer(state.selectedCustomerId, state.authUser.role === "OWNER").catch(handleRequestError);
  }, [state.authUser, state.selectedCustomerId]);

  useEffect(() => {
    if (!isOwner && (state.activeSection === "charges" || state.activeSection === "status")) {
      patchState({ activeSection: "dashboard" });
    }
  }, [isOwner, state.activeSection]);

  const actions = useMemo(
    () => ({
      setActiveSection(section: AppSection) {
        patchState({ activeSection: section });
      },
      setSelectedCustomerId(customerId: string) {
        patchState({ selectedCustomerId: customerId });
      },
      setNotice(notice: NoticeState | null) {
        patchState({ notice });
      },
      async login(input: LoginInput) {
        const user = await signIn(input);
        patchState({
          authUser: user,
          loading: true,
          notice: { tone: "success", message: "Sessao iniciada com sucesso." }
        });

        try {
          await refreshCoreData(user.role);
        } catch (err) {
          handleRequestError(err);
        } finally {
          patchState({ loading: false });
        }
      },
      async logout() {
        await signOut();
        clearSession();
        patchState({
          notice: { tone: "success", message: "Sessao encerrada com sucesso." }
        });
      },
      async refreshOperationalData(customerId: string) {
        if (!state.authUser) {
          return;
        }

        patchState({ loading: true });

        try {
          await refreshCoreData(state.authUser.role);
          patchState({ selectedCustomerId: customerId });
        } catch (err) {
          handleRequestError(err);
        } finally {
          patchState({ loading: false });
        }
      },
      async refreshChargeData(customerId: string) {
        if (!state.authUser || state.authUser.role !== "OWNER") {
          return;
        }

        try {
          const [chargeOverview, chargeMessages, dailyChargeJobMonitor] = await Promise.all([
            fetchChargeOverview(),
            fetchChargeMessages(customerId),
            fetchDailyChargeJobMonitor()
          ]);

          patchState({
            chargeOverview,
            chargeMessages: chargeMessages.slice(0, 5),
            dailyChargeJobMonitor
          });
        } catch (err) {
          handleRequestError(err);
        }
      }
    }),
    [state.authUser]
  );

  return {
    state,
    isOwner,
    actions
  };
}
