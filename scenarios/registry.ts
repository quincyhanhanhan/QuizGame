import { CaseScenario } from '../types';
import { caseX92 } from './caseX92';
import { caseMD20230401 } from './caseMD20230401';
import { case19960329 } from './case19960329';

// Map Case IDs to their Scenario Data
export const CASE_REGISTRY: Record<string, CaseScenario> = {
  [caseX92.caseId]: caseX92,
  [caseMD20230401.caseId]: caseMD20230401,
  [case19960329.caseId]: case19960329,
};

export const AVAILABLE_CASES = Object.values(CASE_REGISTRY)
  .filter(c => !c.isHidden) // Only show non-hidden cases in the list
  .map(c => ({
    id: c.caseId,
    title: c.caseTitle,
    systemName: c.systemName
}));

export const getScenario = (caseId: string): CaseScenario | null => {
  return CASE_REGISTRY[caseId] || null;
};