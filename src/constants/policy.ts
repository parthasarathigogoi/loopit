export const POLICY_VERSION = '2026-04-21';
const POLICY_ACCEPTANCE_KEY = 'loopit_policy_acceptance';

type PolicyAcceptance = {
  accepted: boolean;
  version: string;
  acceptedAt: string;
};

export const getPolicyAcceptance = (): PolicyAcceptance | null => {
  const rawValue = localStorage.getItem(POLICY_ACCEPTANCE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as PolicyAcceptance;
  } catch {
    localStorage.removeItem(POLICY_ACCEPTANCE_KEY);
    return null;
  }
};

export const hasAcceptedCurrentPolicy = () => {
  const acceptance = getPolicyAcceptance();
  return Boolean(acceptance?.accepted && acceptance.version === POLICY_VERSION);
};

export const acceptCurrentPolicy = () => {
  const acceptance: PolicyAcceptance = {
    accepted: true,
    version: POLICY_VERSION,
    acceptedAt: new Date().toISOString(),
  };

  localStorage.setItem(POLICY_ACCEPTANCE_KEY, JSON.stringify(acceptance));
};

export const clearPolicyAcceptance = () => {
  localStorage.removeItem(POLICY_ACCEPTANCE_KEY);
};
