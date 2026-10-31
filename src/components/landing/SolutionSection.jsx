import { useState, useRef, useCallback, useLayoutEffect, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Building2, Database, HeartPulse, Hospital, Layers3, Stethoscope, UserRound, Waypoints } from "lucide-react";
import Container from "../common/Container";
import FrostedPanel from "../common/FrostedPanel";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../react-bits/ScrollReveal";
import { cn } from "../../utils/cn";

const nodes = [
  { label: "Hospitals", icon: Hospital },
  { label: "Doctors", icon: Stethoscope },
  { label: "Specialties", icon: HeartPulse },
  { label: "Facilities", icon: Building2 },
  { label: "Services", icon: Layers3 },
  { label: "Sources", icon: Database },
  { label: "Patients", icon: UserRound },
  { label: "Future schemes", icon: Waypoints, future: true },
];

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function SolutionSection() {
  const [activeNode, setActiveNode] = useState(null);
  const reduceMotion = useReducedMotion();

  const mobileContainerRef = useRef(null);
  const mobileCardRefs = useRef([]);
  const mobileHubRef = useRef(null);
  const [mobilePaths, setMobilePaths] = useState([]);

  const computeMobilePaths = useCallback(() => {
    const container = mobileContainerRef.current;
    const hub = mobileHubRef.current;
    if (!container || !hub) return;

    const containerRect = container.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return;

    const hubRect = hub.getBoundingClientRect();
    const hubCenterX = hubRect.left + hubRect.width / 2 - containerRect.left;
    const hubCenterY = hubRect.top + hubRect.height / 2 - containerRect.top;
    const hubRadius = hubRect.width / 2;

    const paths = nodes.map((_, i) => {
      const cardEl = mobileCardRefs.current[i];
      if (!cardEl) return "";
      const cardRect = cardEl.getBoundingClientRect();

      const cardLeft = cardRect.left - containerRect.left;
      const cardRight = cardRect.right - containerRect.left;
      const cardTop = cardRect.top - containerRect.top;
      const cardBottom = cardRect.bottom - containerRect.top;
      const cardCenterX = cardLeft + cardRect.width / 2;

      // Upper cluster
      // 0: Hospitals (Col 1, Row 1)
      // 1: Doctors (Col 2, Row 1)
      // 2: Specialties (Col 1, Row 2)
      // 3: Facilities (Col 2, Row 2)

      // Lower cluster
      // 4: Services (Col 1, Row 1)
      // 5: Sources (Col 2, Row 1)
      // 6: Patients (Col 1, Row 2)
      // 7: Future schemes (Col 2, Row 2)

      if (i === 0) {
        // Hospitals (top-left outer) -> down central gap into top-left shoulder of hub
        const sx = cardRight - 6;
        const sy = cardBottom;
        const ex = hubCenterX - hubRadius * 0.28;
        const ey = hubCenterY - hubRadius * 0.9;
        const cx = hubCenterX - 8;
        const cy = (sy + ey) * 0.52;
        return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      }

      if (i === 1) {
        // Doctors (top-right outer) -> down central gap into top-right shoulder of hub
        const sx = cardLeft + 6;
        const sy = cardBottom;
        const ex = hubCenterX + hubRadius * 0.28;
        const ey = hubCenterY - hubRadius * 0.9;
        const cx = hubCenterX + 8;
        const cy = (sy + ey) * 0.52;
        return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      }

      if (i === 2) {
        // Specialties (top-left inner) -> direct curve to upper-left quadrant of hub
        const sx = cardCenterX + (cardRight - cardCenterX) * 0.35;
        const sy = cardBottom;
        const ex = hubCenterX - hubRadius * 0.65;
        const ey = hubCenterY - hubRadius * 0.68;
        const cx = sx + (ex - sx) * 0.25;
        const cy = sy + (ey - sy) * 0.75;
        return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      }

      if (i === 3) {
        // Facilities (top-right inner) -> direct curve to upper-right quadrant of hub
        const sx = cardCenterX - (cardCenterX - cardLeft) * 0.35;
        const sy = cardBottom;
        const ex = hubCenterX + hubRadius * 0.65;
        const ey = hubCenterY - hubRadius * 0.68;
        const cx = sx + (ex - sx) * 0.25;
        const cy = sy + (ey - sy) * 0.75;
        return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      }

      if (i === 4) {
        // Services (bottom-left inner) -> direct curve to lower-left quadrant of hub
        const sx = cardCenterX + (cardRight - cardCenterX) * 0.35;
        const sy = cardTop;
        const ex = hubCenterX - hubRadius * 0.65;
        const ey = hubCenterY + hubRadius * 0.68;
        const cx = sx + (ex - sx) * 0.25;
        const cy = sy + (ey - sy) * 0.75;
        return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      }

      if (i === 5) {
        // Sources (bottom-right inner) -> direct curve to lower-right quadrant of hub
        const sx = cardCenterX - (cardCenterX - cardLeft) * 0.35;
        const sy = cardTop;
        const ex = hubCenterX + hubRadius * 0.65;
        const ey = hubCenterY + hubRadius * 0.68;
        const cx = sx + (ex - sx) * 0.25;
        const cy = sy + (ey - sy) * 0.75;
        return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      }

      if (i === 6) {
        // Patients (bottom-left outer) -> up central gap into bottom-left shoulder of hub
        const sx = cardRight - 6;
        const sy = cardTop;
        const ex = hubCenterX - hubRadius * 0.28;
        const ey = hubCenterY + hubRadius * 0.9;
        const cx = hubCenterX - 8;
        const cy = (sy + ey) * 0.52;
        return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      }

      if (i === 7) {
        // Future schemes (bottom-right outer) -> up central gap into bottom-right shoulder of hub
        const sx = cardLeft + 6;
        const sy = cardTop;
        const ex = hubCenterX + hubRadius * 0.28;
        const ey = hubCenterY + hubRadius * 0.9;
        const cx = hubCenterX + 8;
        const cy = (sy + ey) * 0.52;
        return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
      }

      return "";
    });

    setMobilePaths(paths);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const container = mobileContainerRef.current;
    if (!container) return;

    computeMobilePaths();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        computeMobilePaths();
      });
      resizeObserver.observe(container);
    }

    const handleResize = () => {
      computeMobilePaths();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [computeMobilePaths]);

  const renderCard = (node, index, isMobile = false) => {
    const Icon = node.icon;
    const isSelected = activeNode === index;
    const isDimmed = activeNode !== null && !isSelected;

    return (
      <button
        key={node.label}
        ref={(el) => {
          if (isMobile) {
            mobileCardRefs.current[index] = el;
          }
        }}
        type="button"
        className={cn(
          "group relative z-10 rounded-[16px] border border-border bg-[#fdfbf7]/90 text-left shadow-[0_4px_16px_rgba(15,40,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 sm:rounded-[18px] sm:shadow-[0_8px_24px_rgba(15,40,35,0.04)]",
          isMobile ? "min-h-[84px] p-2.5 sm:min-h-[92px] sm:p-4" : "min-h-[92px] p-3 sm:p-4",
          isDimmed && "opacity-45",
        )}
        onMouseEnter={() => setActiveNode(index)}
        onMouseLeave={() => setActiveNode(null)}
        onFocus={() => setActiveNode(index)}
        onBlur={() => setActiveNode(null)}
        onClick={() => setActiveNode((prev) => (prev === index ? null : index))}
        aria-label={`Highlight ${node.label} connection`}
      >
        <Icon className="h-4 w-4 text-primary" />
        <span className="mt-2 block text-xs font-bold sm:mt-3 sm:text-sm">{node.label}</span>
        {node.future && (
          <span className="mt-0.5 block text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground sm:mt-1 sm:text-[9px]">
            Potential
          </span>
        )}
      </button>
    );
  };

  return (
    <Section className="relative overflow-hidden py-24 md:py-36" background="transparent">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow="02 / The MEDIMESH approach"
            title="One place to understand your options."
            description="MEDIMESH organizes healthcare entities, capabilities, and source context into an information mesh built for discovery and comparison."
            alignment="center"
            className="mx-auto mb-14 max-w-3xl"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-white/80 bg-white/45 px-3.5 py-8 shadow-[0_25px_80px_rgba(15,40,35,0.07)] backdrop-blur-sm sm:rounded-[36px] sm:px-10 sm:py-12 lg:py-16">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,122,106,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,122,106,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Desktop View (>= 1024px) - Exactly preserved layout, coordinates, and SVG */}
            <div className="relative hidden lg:block">
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 1000 520" preserveAspectRatio="none">
                {nodes.map((node, index) => {
                  const starts = [[155,118],[390,84],[650,84],[845,118],[155,402],[390,438],[650,438],[845,402]];
                  const [x, y] = starts[index];
                  const active = activeNode === null || activeNode === index;
                  return (
                    <motion.path
                      key={node.label}
                      d={`M${x} ${y} Q ${500 + (x < 500 ? -50 : 50)} 260 500 260`}
                      fill="none"
                      stroke="#0A7A6A"
                      strokeWidth={activeNode === index ? 2.2 : 1.2}
                      strokeOpacity={active ? 0.42 : 0.08}
                      initial={reduceMotion ? false : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : index * 0.06 }}
                    />
                  );
                })}
              </svg>

              <div className="relative grid grid-cols-4 gap-x-16 gap-y-36">
                {nodes.map((node, index) => renderCard(node, index, false))}
              </div>

              <FrostedPanel variant="floating" className="absolute left-1/2 top-1/2 z-20 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-primary/20 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Information</span>
                <strong className="mt-1 text-lg tracking-[-0.04em]">MEDIMESH</strong>
                <span className="mt-1 text-[10px] font-semibold text-muted-foreground">structured layer</span>
              </FrostedPanel>
            </div>

            {/* Mobile & Tablet View (< 1024px) - Upper 2x2, Central Hub, Lower 2x2 with dynamic connector lines */}
            <div ref={mobileContainerRef} className="relative block max-w-lg mx-auto sm:max-w-xl lg:hidden">
              <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full">
                {mobilePaths.map((d, index) => {
                  if (!d) return null;
                  const active = activeNode === null || activeNode === index;
                  return (
                    <motion.path
                      key={nodes[index].label}
                      d={d}
                      fill="none"
                      stroke="#0A7A6A"
                      strokeWidth={activeNode === index ? 2.4 : 1.4}
                      strokeOpacity={active ? 0.58 : 0.12}
                      initial={reduceMotion ? false : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : index * 0.04 }}
                    />
                  );
                })}
              </svg>

              {/* Upper cluster — 2 × 2 grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {nodes.slice(0, 4).map((node, idx) => renderCard(node, idx, true))}
              </div>

              {/* Central information hub */}
              <div className="relative my-7 flex justify-center sm:my-8">
                <FrostedPanel
                  ref={mobileHubRef}
                  variant="floating"
                  className="relative z-20 flex h-28 w-28 flex-col items-center justify-center rounded-full border-primary/20 bg-white/95 text-center shadow-[0_12px_32px_rgba(15,40,35,0.08)] backdrop-blur-md sm:h-32 sm:w-32"
                >
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-primary sm:text-[10px]">Information</span>
                  <strong className="mt-0.5 text-base tracking-[-0.04em] sm:mt-1 sm:text-lg">MEDIMESH</strong>
                  <span className="mt-0.5 text-[9px] font-semibold text-muted-foreground sm:mt-1 sm:text-[10px]">structured layer</span>
                </FrostedPanel>
              </div>

              {/* Lower cluster — 2 × 2 grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {nodes.slice(4, 8).map((node, idx) => renderCard(node, idx + 4, true))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
