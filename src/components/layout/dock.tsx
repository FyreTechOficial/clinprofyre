"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { Children, cloneElement, useRef, useState, useEffect, useMemo, type ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { navItems, adminNavItems } from "@/constants/nav-items";
import { createClient } from "@/lib/supabase/client";
import "./dock.css";

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mouseX: any;
  spring: any;
  distance: number;
  magnification: number;
  baseItemSize: number;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={cn("dock-item", active && "dock-item--active", className)}
      tabIndex={0}
      role="button"
      onMouseDown={(e) => e.preventDefault()}
    >
      {Children.map(children, (child) =>
        cloneElement(child as ReactElement<any>, { isHovered })
      )}
    </motion.div>
  );
}

function DockLabel({ children, ...rest }: { children: React.ReactNode; isHovered?: any }) {
  const { isHovered } = rest as any;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.15 }}
          className="dock-label"
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children }: { children: React.ReactNode; isHovered?: any }) {
  return <div className="dock-icon">{children}</div>;
}

interface DockNavProps {
  isAdmin?: boolean;
}

export default function DockNav({ isAdmin = false }: DockNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const baseItemSize = 46;
  const magnification = 64;
  const distance = 140;
  const panelHeight = 58;

  const maxHeight = useMemo(
    () => Math.max(256, magnification + magnification / 2 + 4),
    [magnification]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const allItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <motion.div style={{ height, scrollbarWidth: "none" }} className="dock-outer">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className="dock-panel"
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Navigation dock"
      >
        {allItems.map((item) => {
          const Icon = item.icon;
          return (
            <DockItem
              key={item.href}
              onClick={() => router.push(item.href)}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              active={isActive(item.href)}
            >
              <DockIcon><Icon className="w-[44%] h-[44%]" /></DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          );
        })}

        <div className="dock-separator" />

        <DockItem
          onClick={handleLogout}
          mouseX={mouseX}
          spring={spring}
          distance={distance}
          magnification={magnification}
          baseItemSize={baseItemSize}
        >
          <DockIcon><LogOut className="w-[44%] h-[44%]" /></DockIcon>
          <DockLabel>Sair</DockLabel>
        </DockItem>
      </motion.div>
    </motion.div>
  );
}
