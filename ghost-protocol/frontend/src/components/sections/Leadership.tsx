"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SVGProps } from "react";
import { useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import AnimatedSection from "../animations/AnimatedSection";
import { getLeadershipData } from "../../services/dataService";
import CmdBar from "../ui/CmdBar";
import type { LeadershipEntry } from "../../data/leadership";

// ─── SVG Logo Components ───

export const OSPCLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height="1.2em"
    viewBox="0 0 28 28"
    width="1.2em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>OSPC</title>
    <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10 8h8v2h-3v8h-2V10h-3V8z"
      fill="currentColor"
    />
  </svg>
);

export const RASLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height="1.2em"
    viewBox="0 0 28 28"
    width="1.2em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>IEEE RAS</title>
    <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M9 10h4l2 4 2-4h4l-4 8v-4h-2l-4-8z"
      fill="currentColor"
    />
  </svg>
);

export const SCLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height="1.2em"
    viewBox="0 0 28 28"
    width="1.2em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Student Council</title>
    <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M14 6l8 6v2H6v-2l8-6zM6 16h16v2H6v-2z"
      fill="currentColor"
    />
  </svg>
);

export const PSSLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height="1.2em"
    viewBox="0 0 28 28"
    width="1.2em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>P. S. Senior Secondary School</title>
    <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 8h6a4 4 0 0 1 0 8h-2v4H8V8zm4 6h2a2 2 0 0 0 0-4h-2v4z"
      fill="currentColor"
    />
  </svg>
);

// ─── Types ───

interface LeadershipRole extends LeadershipEntry {
  logo: React.ReactNode;
}

const roleLogoMap: Record<string, React.ReactNode> = {
  "lead-1": <OSPCLogo />,
  "lead-2": <RASLogo />,
  "lead-3": <SCLogo />,
  "lead-4": <PSSLogo />,
};

// ─── Component ───

export default function Leadership() {
  const rawRoles = getLeadershipData();
  const roles: LeadershipRole[] = rawRoles.map((r) => ({
    ...r,
    logo: roleLogoMap[r.id] ?? null,
  }));

  const [activeItem, setActiveItem] = useState<LeadershipRole | null>(null);
  const ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const shouldReduceMotion = useReducedMotion();
  useOnClickOutside(ref, () => setActiveItem(null));

  useEffect(() => {
    function onKeyDown(event: { key: string }) {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const formattedPeriod = (role: LeadershipEntry) => {
    const start = role.date_started.split("-")[0];
    const end = role.current ? "PRESENT" : role.date_ended.split("-")[0];
    return `${start} — ${end}`;
  };

  return (
    <AnimatedSection id="leadership" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>LEADERSHIP & ROLES</span>
        </motion.div>

        {/* ─── Backdrop Overlay ─── */}
        <AnimatePresence>
          {activeItem ? (
            <motion.div
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
              className="pointer-events-none fixed inset-0 z-10 bg-[#0a0c0a]/80 backdrop-blur-sm"
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0 }
              }
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }
              }
            />
          ) : null}
        </AnimatePresence>

        {/* ─── Expanded Detail ─── */}
        <AnimatePresence>
          {activeItem ? (
            <div className="group fixed inset-0 z-10 grid place-items-center">
              <motion.div
                className="flex h-fit w-[90%] max-w-lg cursor-pointer select-none flex-col items-start overflow-hidden border shadow-xs"
                layoutId={
                  shouldReduceMotion
                    ? undefined
                    : `leadershipItem-${activeItem.id}`
                }
                ref={ref}
                style={{
                  background: "#0d0d14",
                  borderColor: "rgba(0, 230, 122, 0.2)",
                  borderRadius: 10,
                  willChange: shouldReduceMotion ? "auto" : "transform",
                }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        type: "spring" as const,
                        duration: 0.25,
                        bounce: 0.1,
                        layout: {
                          duration: 0.25,
                          ease: [0.645, 0.045, 0.355, 1],
                        },
                      }
                }
              >
                <CmdBar cmd={`cat ~/leadership/${activeItem.id}.log`} />
                <div className="flex w-full flex-col items-start gap-3 p-4">
                <div className="relative flex w-full items-center gap-3">
                  <motion.div
                    layoutId={
                      shouldReduceMotion
                        ? undefined
                        : `leadershipLogo-${activeItem.id}`
                    }
                    style={{
                      willChange: shouldReduceMotion ? "auto" : "transform",
                      flexShrink: 0,
                      color: "#00e67a",
                    }}
                  >
                    {activeItem.logo}
                  </motion.div>
                  <div className="flex min-w-0 grow flex-col gap-0.5">
                    <div className="font-medium text-[rgba(255,255,255,0.9)] text-sm">
                      {activeItem.organization}
                    </div>
                    <p className="text-[rgba(255,255,255,0.5)] text-xs">
                      {activeItem.position}
                    </p>
                    <p className="text-[#00e67a] text-[0.65rem] tracking-wider">
                      {formattedPeriod(activeItem)}
                    </p>
                  </div>
                </div>
                <motion.ul
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
                  className="flex w-full flex-col gap-1.5 pl-0 text-xs text-[rgba(255,255,255,0.55)]"
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0, transition: { duration: 0 } }
                      : { opacity: 0 }
                  }
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  style={{ listStyle: "none", margin: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.2,
                          ease: [0.215, 0.61, 0.355, 1],
                          delay: 0.05,
                        }
                  }
                >
                  {activeItem.responsibilities.map((resp, i) => (
                    <li key={i} className="relative pl-3 leading-relaxed">
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "0.45em",
                          width: 3,
                          height: 3,
                          background: "#00e67a",
                          borderRadius: "50%",
                          opacity: 0.5,
                        }}
                      />
                      {resp}
                    </li>
                  ))}
                </motion.ul>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        {/* ─── Card Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map((role) => (
            <motion.div
              className="group relative flex w-full cursor-pointer select-none flex-col overflow-hidden border shadow-xs"
              key={role.id}
              layoutId={
                shouldReduceMotion ? undefined : `leadershipItem-${role.id}`
              }
              onClick={() => setActiveItem(role)}
              style={{
                background: "rgba(0, 0, 0, 0.55)",
                borderColor: "rgba(0, 230, 122, 0.15)",
                borderRadius: 8,
                willChange: shouldReduceMotion ? "auto" : "transform",
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      type: "spring" as const,
                      duration: 0.25,
                      bounce: 0.1,
                      layout: {
                        duration: 0.25,
                        ease: [0.645, 0.045, 0.355, 1],
                      },
                    }
              }
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            >
              <CmdBar cmd={`cat ~/leadership/${role.id}.log`} />
              <div className="flex w-full flex-row items-center gap-3 p-3">
              <motion.div
                layoutId={
                  shouldReduceMotion
                    ? undefined
                    : `leadershipLogo-${role.id}`
                }
                style={{
                  willChange: shouldReduceMotion ? "auto" : "transform",
                  flexShrink: 0,
                  color: "#00e67a",
                }}
              >
                {role.logo}
              </motion.div>
              <div className="flex w-full flex-col items-start justify-between gap-0.5">
                <div className="font-medium text-[rgba(255,255,255,0.9)] text-sm leading-tight">
                  {role.organization}
                </div>
                <div className="text-[rgba(255,255,255,0.45)] text-[0.65rem]">
                  {role.position}
                </div>
                <div className="text-[#00e67a] text-[0.6rem] tracking-wider">
                  {formattedPeriod(role)}
                </div>
              </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              >
                {role.responsibilities.join(" ")}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
