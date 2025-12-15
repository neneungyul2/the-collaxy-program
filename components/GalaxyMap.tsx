import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink, NodeStatus, NodeType, LabelRevealMode } from '../types';

interface GalaxyMapProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick: (node: GraphNode) => void;
  width: number;
  height: number;
  revealMode: LabelRevealMode;
}

const GalaxyMap: React.FC<GalaxyMapProps> = ({ nodes, links, onNodeClick, width, height, revealMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  
  // Ref to keep track of the latest callback without re-triggering the effect
  const onNodeClickRef = useRef(onNodeClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // --- VISUAL HELPERS ---

  const getNodeColor = (node: GraphNode) => {
    if (node.status === NodeStatus.MASTERED || node.status === NodeStatus.ROOT) return 'url(#grad-star)'; 
    if (node.status === NodeStatus.UNKNOWN || node.status === NodeStatus.LOCKED) return '#374151';
    switch (node.type) {
      case NodeType.VERB: return '#ec4899';
      case NodeType.ADJECTIVE: return '#8b5cf6';
      default: return '#06b6d4';
    }
  };

  const getNodeRadius = (node: GraphNode) => {
    if (node.status === NodeStatus.ROOT) return 30;
    if (node.status === NodeStatus.MASTERED) return 20;
    if (node.status === NodeStatus.KNOWN) return 16;
    return 10;
  };

  const getLinkColor = (link: GraphLink) => {
    if (link.status === NodeStatus.MASTERED) return '#fbbf24';
    if (link.status === NodeStatus.KNOWN) return '#22d3ee';
    // CHANGED: Lighter gray for Unknown links so they are visible against black background
    return '#6b7280'; 
  };

  const getLabel = (node: GraphNode) => {
    if (node.status === NodeStatus.UNKNOWN) {
      if (revealMode === 'HIDDEN') return '???';
      if (revealMode === 'FIRST_LETTER') return node.label.charAt(0).toUpperCase() + '...';
    }
    return node.label;
  };

  // --- D3 SIMULATION ---

  useEffect(() => {
    if (!svgRef.current) return;

    if (simulationRef.current) {
        simulationRef.current.stop();
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); 

    // DEFS
    const defs = svg.append("defs");
    const starGrad = defs.append("radialGradient")
      .attr("id", "grad-star").attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
    starGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
    starGrad.append("stop").attr("offset", "50%").attr("stop-color", "#fcd34d");
    starGrad.append("stop").attr("offset", "100%").attr("stop-color", "#d97706");

    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Zoom Group
    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));

    // Simulation
    const simulation = d3.forceSimulation<GraphNode, GraphLink>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(d => d.status === NodeStatus.UNKNOWN ? 140 : 90))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(0, 0))
      .force("collide", d3.forceCollide().radius(d => getNodeRadius(d as GraphNode) + 15));

    simulationRef.current = simulation;

    // --- DRAW LAYERS ---

    // 0. Proximity Links (Weak Lines)
    // IMPORTANT: Drawn first to be in background
    const proximityGroup = g.append("g").attr("class", "proximity-links");

    // 1. Links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", d => d.status === NodeStatus.MASTERED ? 2 : 1)
      .attr("stroke", d => getLinkColor(d))
      .attr("stroke-dasharray", d => d.status === NodeStatus.UNKNOWN ? "3,3" : "none")
      .attr("opacity", d => d.status === NodeStatus.UNKNOWN ? 0.5 : 0.8); // Increased opacity for unknown links

    // 2. Nodes
    const nodeGroup = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    nodeGroup.append("circle")
      .attr("r", 40)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClickRef.current(d); // Use Ref to access latest handler
      });

    nodeGroup.append("circle")
      .attr("r", d => getNodeRadius(d) + 3)
      .attr("fill", "none")
      .attr("stroke", d => d.status === NodeStatus.KNOWN || d.status === NodeStatus.MASTERED ? (d.status === NodeStatus.MASTERED ? "#fbbf24" : "#10b981") : "none")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6)
      .attr("class", d => d.status === NodeStatus.MASTERED ? "animate-pulse-slow" : "")
      .style("pointer-events", "none");

    nodeGroup.append("circle")
      .attr("r", d => getNodeRadius(d))
      .attr("fill", d => getNodeColor(d))
      .attr("stroke", "#0b0d17")
      .attr("stroke-width", 2)
      .style("filter", d => d.status === NodeStatus.MASTERED ? "url(#glow)" : "none")
      .style("pointer-events", "none");

    nodeGroup.filter(d => d.status === NodeStatus.UNKNOWN).append("circle")
       .attr("r", d => getNodeRadius(d) / 2).attr("fill", "#1f2937").attr("cx", 2).attr("cy", -2).style("pointer-events", "none");

    nodeGroup.append("rect")
      .attr("rx", 4).attr("ry", 4)
      .attr("x", d => getNodeRadius(d) + 8).attr("y", -10)
      .attr("width", d => getLabel(d).length * 11 + 24).attr("height", 28)
      .attr("fill", "#0b0d17").attr("opacity", 0.7).style("pointer-events", "none");

    nodeGroup.append("text")
      .text(d => getLabel(d))
      .attr("x", d => getNodeRadius(d) + 14).attr("y", 8)
      .attr("font-family", "Rajdhani, sans-serif")
      .attr("font-size", d => d.status === NodeStatus.ROOT ? "28px" : "20px")
      .attr("font-weight", d => d.status === NodeStatus.UNKNOWN ? "400" : "700")
      .attr("fill", d => d.status === NodeStatus.UNKNOWN ? "#9ca3af" : "#e2e8f0")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      // 1. Update Real Links
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      // 2. Proximity Mesh
      // Performance guard
      if (nodes.length < 150) {
        const proximityThreshold = 250;
        const proximityPairs: { x1: number, y1: number, x2: number, y2: number, opacity: number }[] = [];
        const linkMap = new Set<string>();
        links.forEach(l => {
          const s = (l.source as GraphNode).id;
          const t = (l.target as GraphNode).id;
          linkMap.add(`${s}-${t}`);
          linkMap.add(`${t}-${s}`);
        });

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            
            // Do not connect two UNKNOWN (Satellite) nodes with proximity lines.
            const isN1Unknown = n1.status === NodeStatus.UNKNOWN;
            const isN2Unknown = n2.status === NodeStatus.UNKNOWN;
            
            // Prevent Satellite-to-Satellite connections
            if (isN1Unknown && isN2Unknown) continue;

            if (linkMap.has(`${n1.id}-${n2.id}`)) continue;
            
            const dx = (n1.x || 0) - (n2.x || 0);
            const dy = (n1.y || 0) - (n2.y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < proximityThreshold) {
              const opacity = 0.4 * (1 - dist / proximityThreshold); 
              if (opacity > 0.05) {
                proximityPairs.push({ x1: n1.x || 0, y1: n1.y || 0, x2: n2.x || 0, y2: n2.y || 0, opacity });
              }
            }
          }
        }

        const weakLines = proximityGroup.selectAll("line").data(proximityPairs);
        
        weakLines.join(
            enter => enter.append("line")
                .attr("stroke", "#6b7280") // Updated to lighter gray to match standard unknown links
                .attr("stroke-dasharray", "4,4") 
                .attr("stroke-width", 1) 
                .style("pointer-events", "none"),
            update => update,
            exit => exit.remove()
        )
        .attr("x1", d => d.x1)
        .attr("y1", d => d.y1)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("opacity", d => d.opacity);
      }

      // 3. Update Nodes
      nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, height, width, revealMode]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height} 
      className="bg-transparent cursor-move"
    />
  );
};

export default GalaxyMap;