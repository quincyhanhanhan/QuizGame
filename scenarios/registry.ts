import { CaseScenario } from '../types';
import { caseX92 } from './caseX92';
// templateCase is kept in the file system for reference but not imported here
// import { templateCase } from './template'; 

// Map Case IDs to their Scenario Data
export const CASE_REGISTRY: Record<string, CaseScenario> = {
  [caseX92.caseId]: caseX92,
  // Template case removed from runtime registry
};

export const AVAILABLE_CASES = Object.values(CASE_REGISTRY).map(c => ({
  id: c.caseId,
  title: c.caseTitle,
  systemName: c.systemName
}));

export const getScenario = (caseId: string): CaseScenario | null => {
  return CASE_REGISTRY[caseId] || null;
};