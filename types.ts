export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CASE_ANALYSIS = 'CASE_ANALYSIS',
  RESEARCH = 'RESEARCH',
  MOCK_TRIAL = 'MOCK_TRIAL',
  ARGUMENT_WRITER = 'ARGUMENT_WRITER'
}

export type Jurisdiction = 'US Federal' | 'California' | 'New York' | 'Texas' | 'Delaware' | 'United Kingdom' | 'European Union';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface CaseAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  verdictProbability: number; // 0-100
  keyPrecedents: string[];
  strategy: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ResearchResult {
  text: string;
  sources: GroundingSource[];
}

export enum TrialPersona {
  JUDGE = 'Judge',
  OPPOSING_COUNSEL = 'Opposing Counsel',
  WITNESS = 'Hostile Witness'
}

export interface CaseFile {
  id: string;
  refNumber: string;
  title: string;
  client: string;
  status: 'Active' | 'Review' | 'Closed';
  lastUpdated: string;
}
