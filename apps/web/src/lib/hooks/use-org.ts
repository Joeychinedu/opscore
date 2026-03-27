'use client';

import { create } from 'zustand';
import { api } from '../api-client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
}

interface OrgState {
  currentOrg: Organization | null;
  orgs: Organization[];
  isLoading: boolean;
  init: () => void;
  fetchOrgs: () => Promise<void>;
  selectOrg: (org: Organization) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  orgs: [],
  isLoading: false,

  init: () => {
    try {
      const orgJson = localStorage.getItem('currentOrg');
      if (orgJson) {
        const org = JSON.parse(orgJson) as Organization;
        api.setOrgId(org.id);
        set({ currentOrg: org });
      }
    } catch {
      // Ignore parse errors
    }
  },

  fetchOrgs: async () => {
    set({ isLoading: true });
    try {
      const orgs = await api.get<Organization[]>('/organizations');
      set({ orgs, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectOrg: (org) => {
    api.setOrgId(org.id);
    localStorage.setItem('currentOrg', JSON.stringify(org));
    set({ currentOrg: org });
  },
}));
