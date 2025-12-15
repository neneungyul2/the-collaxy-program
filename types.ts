import * as d3 from 'd3';

export type LabelRevealMode = 'HIDDEN' | 'FIRST_LETTER';

export type DifficultyLevel = 'ELEMENTARY' | 'MIDDLE' | 'HIGH' | 'NATIVE';

export type Language = 'EN' | 'KO';

export enum NodeStatus {
  ROOT = 'ROOT',           // Special status for the starting node
  LOCKED = 'LOCKED',       // Invisible or barely visible
  UNKNOWN = 'UNKNOWN',     // Visible but gray/dim (Fog of War frontier)
  KNOWN = 'KNOWN',         // Active, bright (Conquered)
  MASTERED = 'MASTERED'    // Gold/Glowing (Heavily reinforced)
}

export enum NodeType {
  ROOT = 'ROOT',
  NOUN = 'NOUN',
  VERB = 'VERB',
  ADJECTIVE = 'ADJECTIVE',
  PHRASE = 'PHRASE'
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  status: NodeStatus;
  type: NodeType;
  mastery: number; // 0 to 100
  // D3 optional properties
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number; // 0 to 1
  status: NodeStatus; // Usually matches the target node status
}

export interface BattleScenario {
  targetWord: string;
  contextSentence: string; // "I need to _____ a decision."
  correctAnswer: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  hint: string;
}

export interface ExpansionResult {
  word: string;
  type: NodeType;
  connectionReason: string; // "Collocation", "Synonym", etc.
}

export interface LogEntry {
  key: string;     // Key matching UI_TEXT properties
  prefix?: string; // Content to prepend (e.g., numbers)
  suffix?: string; // Content to append (e.g., node labels)
  timestamp: number;
}