import React, { useState, useCallback, useEffect, useRef } from 'react';
import GalaxyMap from './components/GalaxyMap';
import BattleModal from './components/BattleModal';
import HUD from './components/HUD';
import OnboardingModal from './components/OnboardingModal';
import TutorialModal from './components/TutorialModal';
import { GraphNode, GraphLink, NodeStatus, NodeType, BattleScenario, LabelRevealMode, DifficultyLevel, Language, LogEntry } from './types';
import { expandTerritory, generateBattleScenario, getStartingWord } from './services/geminiService';
import { INITIAL_NODES, UI_TEXT } from './constants';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [gameStarted, setGameStarted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('NATIVE');
  // Default language set to Korean as requested
  const [language, setLanguage] = useState<Language>('KO');
  
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [revealMode, setRevealMode] = useState<LabelRevealMode>('FIRST_LETTER');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBattle, setActiveBattle] = useState<{scenario: BattleScenario, targetNodeId: string, sourceLabel: string, sourceId: string} | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- LOGIC HELPERS ---

  const addLog = (key: string, suffix?: string, prefix?: string) => {
    setLogs(prev => [...prev, {
      key,
      suffix,
      prefix,
      timestamp: Date.now()
    }]);
  };

  // --- INITIALIZATION ---
  const handleStartGame = async (mode: 'CUSTOM' | 'RECOMMEND', selectedLevel: DifficultyLevel, customWord?: string) => {
    setIsProcessing(true);
    setDifficulty(selectedLevel);
    
    let rootWord = customWord;

    if (mode === 'RECOMMEND' || !rootWord) {
      addLog('LOG_SCANNING', ` (${selectedLevel})...`);
      rootWord = await getStartingWord(selectedLevel, language);
    }

    // Initialize Graph
    const rootNode: GraphNode = {
      id: 'root',
      label: rootWord,
      status: NodeStatus.ROOT,
      type: NodeType.ROOT,
      mastery: 100,
      x: 0,
      y: 0
    };

    setNodes([rootNode]);
    setLinks([]);
    
    // Initial Logs
    setLogs([
      { key: 'LOG_INIT', timestamp: Date.now() },
      { key: 'LOG_SECTOR_CLEARANCE', suffix: `: ${selectedLevel}`, timestamp: Date.now() + 1 },
      { key: 'LOG_PRIMARY_DETECTED', suffix: `: '${rootWord}'`, timestamp: Date.now() + 2 },
      { key: 'LOG_CLICK_TO_SCAN', timestamp: Date.now() + 3 }
    ]);
    
    setGameStarted(true);
    setShowTutorial(true); // Show tutorial after start
    setIsProcessing(false);
  };

  const findConnectedSource = (targetId: string): GraphNode | undefined => {
    const link = links.find(l => {
      const s = typeof l.source === 'string' ? l.source : l.source.id;
      const t = typeof l.target === 'string' ? l.target : l.target.id;
      return s === targetId || t === targetId;
    });

    if (!link) return undefined;

    const s = typeof link.source === 'string' ? link.source : link.source.id;
    const t = typeof link.target === 'string' ? link.target : link.target.id;
    
    // Return the OTHER node (the source of the connection)
    const sourceId = (t === targetId) ? s : t;
    return nodes.find(n => n.id === sourceId);
  };

  // --- INTERACTION HANDLERS ---

  const handleNodeClick = useCallback(async (node: GraphNode) => {
    if (isProcessing) return;

    // 1. CLICKED A MASTERED/KNOWN NODE -> EXPAND (Scouting)
    if (node.status === NodeStatus.KNOWN || node.status === NodeStatus.MASTERED || node.status === NodeStatus.ROOT) {
      
      const hasChildren = links.some(l => {
         const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
         return sourceId === node.id;
      });

      if (hasChildren && node.status !== NodeStatus.ROOT) {
         addLog('LOG_ALREADY_CHARTED', `: '${node.label}'`);
         return; 
      }

      setIsProcessing(true);
      addLog('LOG_SCANNING', ` ['${node.label}']`);

      // Identify existing neighbors to prevent immediate loops (A -> B -> A)
      const neighborIds = new Set<string>();
      links.forEach(l => {
        const s = typeof l.source === 'string' ? l.source : l.source.id;
        const t = typeof l.target === 'string' ? l.target : l.target.id;
        if (s === node.id) neighborIds.add(t);
        if (t === node.id) neighborIds.add(s);
      });

      const newConnectionsRaw = await expandTerritory(node.label, difficulty, language);
      
      // Filter Logic
      const newConnections = newConnectionsRaw.filter(conn => {
         const center = node.label.toLowerCase();
         const target = conn.word.toLowerCase();
         
         // 1. Self Check
         if (target === center) return false;
         
         // 2. Substring Check (Prevent 'Friend' -> 'Boyfriend')
         if (center.length > 3 && target.includes(center)) return false;

         // 3. Neighbor Check (Prevent A -> B -> A)
         // Check if this suggested word is already a neighbor of the current node
         if (neighborIds.has(conn.word)) return false;
         // Case insensitive check against neighbors
         const isNeighbor = Array.from(neighborIds).some(nId => nId.toLowerCase() === target);
         if (isNeighbor) return false;

         return true;
      });

      if (newConnections.length === 0) {
        addLog('LOG_NO_SIGNALS');
        setIsProcessing(false);
        return;
      }

      // Add new "UNKNOWN" nodes (Satellites) AND Connect to existing nodes
      const newNodes: GraphNode[] = [];
      const newLinks: GraphLink[] = [];
      const currentLinks = [...links]; // Snapshot to check existing connections

      newConnections.forEach(conn => {
        const targetId = conn.word;
        
        // Check if node exists in state OR in the current batch
        const existingNode = nodes.find(n => n.id === targetId) || newNodes.find(n => n.id === targetId);

        // 1. Node Creation
        if (!existingNode) {
          const newNode: GraphNode = {
            id: targetId,
            label: targetId,
            status: NodeStatus.UNKNOWN,
            type: conn.type,
            mastery: 0,
            x: node.x ? node.x + (Math.random() - 0.5) * 50 : 0,
            y: node.y ? node.y + (Math.random() - 0.5) * 50 : 0
          };
          newNodes.push(newNode);
        }

        // 2. Link Creation
        // Check if link exists in state OR in current batch
        const linkExists = currentLinks.some(l => {
           const s = typeof l.source === 'string' ? l.source : l.source.id;
           const t = typeof l.target === 'string' ? l.target : l.target.id;
           return (s === node.id && t === targetId) || (s === targetId && t === node.id);
        }) || newLinks.some(l => {
           return (l.source === node.id && l.target === targetId) || (l.source === targetId && l.target === node.id);
        });

        if (!linkExists) {
           // If connecting to an existing KNOWN/MASTERED node, make the link solid (KNOWN)
           let linkStatus = NodeStatus.UNKNOWN;
           if (existingNode && (existingNode.status === NodeStatus.KNOWN || existingNode.status === NodeStatus.MASTERED)) {
              linkStatus = NodeStatus.KNOWN;
           }

           newLinks.push({
              source: node.id,
              target: targetId,
              strength: 0.1,
              status: linkStatus
           });
        }
      });

      if (newNodes.length > 0 || newLinks.length > 0) {
        setLinks(prev => {
          const resetLinks = prev.map(l => ({
            ...l,
            source: typeof l.source === 'string' ? l.source : l.source.id,
            target: typeof l.target === 'string' ? l.target : l.target.id
          }));
          return [...resetLinks, ...newLinks];
        });

        setNodes(prev => [...prev, ...newNodes]);
        
        if (newNodes.length > 0) {
           addLog('LOG_SATELLITES_DETECTED', '', `${newNodes.length} `);
        } else {
           // Only links were added
           addLog('LOG_DOCKING_CONFIRMED', ` (New Connections)`); 
        }
      } else {
        addLog('LOG_MAPPED');
      }
      setIsProcessing(false);
    }

    // 2. CLICKED AN UNKNOWN NODE -> BATTLE (Docking)
    else if (node.status === NodeStatus.UNKNOWN) {
      const sourceNode = findConnectedSource(node.id);
      if (!sourceNode) {
        addLog('LOG_ORPHAN');
        return;
      }

      setIsProcessing(true);
      
      let maskedLabel = node.label;
      if (revealMode === 'HIDDEN') {
        maskedLabel = '???';
      } else if (revealMode === 'FIRST_LETTER') {
        maskedLabel = node.label.charAt(0).toUpperCase() + '...';
      }

      addLog('LOG_DOCKING_SEQ', `: ${sourceNode.label} >> ${maskedLabel}`);
      
      const scenario = await generateBattleScenario(sourceNode.label, node.label, difficulty, language);
      setActiveBattle({
        scenario,
        targetNodeId: node.id,
        sourceId: sourceNode.id,
        sourceLabel: sourceNode.label
      });
      setIsProcessing(false);
    }

  }, [isProcessing, nodes, links, difficulty, revealMode, language]);

  const handleBattleComplete = (success: boolean) => {
    if (activeBattle) {
      if (success) {
        const { targetNodeId, sourceId } = activeBattle;

        setNodes(prev => prev.map(n => {
          if (n.id === targetNodeId) {
            // Terraforming successful
            return { ...n, status: NodeStatus.KNOWN, mastery: 50 };
          }
          return n;
        }));

        setLinks(prev => prev.map(l => {
          const s = typeof l.source === 'string' ? l.source : l.source.id;
          const t = typeof l.target === 'string' ? l.target : l.target.id;
          
          const baseLink = { ...l, source: s, target: t };
          
          // Check if this link involves the newly conquered node (targetNodeId)
          if (s === targetNodeId || t === targetNodeId) {
             const neighborId = s === targetNodeId ? t : s;
             
             // Check neighbor status. We use 'nodes' state (which is the state BEFORE this update, so neighbor status is reliable).
             const neighbor = nodes.find(n => n.id === neighborId);
             
             // If neighbor is ACTIVE (Known, Mastered, or Root), activate this link.
             // This ensures that if we have Happy(Known) - Smile(New) AND Joy(Known) - Smile(New),
             // Both links become KNOWN.
             if (neighbor && (neighbor.status === NodeStatus.KNOWN || neighbor.status === NodeStatus.MASTERED || neighbor.status === NodeStatus.ROOT)) {
                 return { ...baseLink, status: NodeStatus.KNOWN, strength: 0.8 };
             }
          }

          return baseLink;
        }));

        addLog('LOG_DOCKING_CONFIRMED', ` (${targetNodeId})`);
      } else {
        // FAILURE CASE
        addLog('LOG_DOCKING_FAILED', ` (${activeBattle.targetNodeId})`);
      }
    }
    setActiveBattle(null);
  };

  const stats = {
    discovered: nodes.length,
    mastered: nodes.filter(n => n.status === NodeStatus.MASTERED || n.status === NodeStatus.KNOWN).length,
    connections: links.filter(l => l.status === NodeStatus.KNOWN || l.status === NodeStatus.MASTERED).length
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans text-gray-100">
      
      {/* Dynamic Nebula Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-space-800 via-space-900 to-black opacity-80"></div>
      <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      {!gameStarted && (
        <OnboardingModal 
          onStart={handleStartGame} 
          isLoading={isProcessing}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialModal 
          onClose={() => setShowTutorial(false)}
          language={language}
        />
      )}

      {/* HUD Layer */}
      {gameStarted && (
        <HUD 
          stats={stats} 
          logs={logs} 
          revealMode={revealMode}
          onToggleRevealMode={setRevealMode}
          language={language}
          onToggleLanguage={setLanguage}
        />
      )}

      {/* Galaxy Map */}
      <div className="absolute inset-0 z-0">
        <GalaxyMap 
          nodes={nodes} 
          links={links} 
          width={dimensions.width} 
          height={dimensions.height}
          onNodeClick={handleNodeClick}
          revealMode={revealMode}
        />
      </div>

      {/* Battle/Docking Modal */}
      {activeBattle && (
        <BattleModal 
          scenario={activeBattle.scenario}
          sourceLabel={activeBattle.sourceLabel}
          onComplete={handleBattleComplete}
          onClose={() => setActiveBattle(null)}
          revealMode={revealMode}
          language={language}
        />
      )}

      {/* Loading Overlay */}
      {isProcessing && !activeBattle && gameStarted && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 bg-space-900/90 border border-neon-cyan/50 px-6 py-3 rounded-full flex items-center gap-4 shadow-[0_0_25px_rgba(0,243,255,0.4)] backdrop-blur">
          <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />
          <span className="text-sm font-display font-bold tracking-widest text-neon-cyan animate-pulse">ESTABLISHING LINK...</span>
        </div>
      )}

      {/* API Key Warning */}
      {!process.env.API_KEY && (
        <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <h1 className="text-3xl text-red-500 font-bold mb-4">API Key Missing</h1>
            <p className="text-gray-300">Please provide a valid Google Gemini API Key in the environment variables to explore the territory.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;