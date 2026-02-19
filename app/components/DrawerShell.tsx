"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface DrawerShellProps {
  children: (animateClose: (callback?: () => void) => void) => ReactNode;
  onClose: () => void;
}

export default function DrawerShell({ children, onClose }: DrawerShellProps) {
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const closingRef = useRef(false);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const animateClose = useCallback(
    (callback?: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      setClosing(true);
      setTimeout(callback || onClose, 300);
    },
    [onClose]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    // Only start drag if drawer is scrolled to top
    if (drawer.scrollTop > 0) return;

    draggingRef.current = true;
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current) return;

    const delta = e.touches[0].clientY - startYRef.current;

    // Only allow downward drag
    if (delta < 0) {
      currentYRef.current = 0;
      setDragY(0);
      return;
    }

    // Prevent scroll while dragging
    e.preventDefault();
    currentYRef.current = delta;
    setDragY(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    // If dragged more than 120px down, close
    if (currentYRef.current > 120) {
      animateClose();
    }

    // Snap back
    setDragY(0);
    currentYRef.current = 0;
  }, [animateClose]);

  const isDragging = dragY > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => animateClose()}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          opacity: isDragging ? Math.max(0, 1 - dragY / 400) : undefined,
          animation:
            !isDragging
              ? closing
                ? "fadeOut 0.3s ease forwards"
                : "fadeIn 0.3s ease"
              : undefined,
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          background: "#1a1a1a",
          color: "#f4f2ec",
          borderRadius: "16px 16px 0 0",
          maxHeight: "85vh",
          overflowY: isDragging ? "hidden" : "auto",
          transform: isDragging ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? "none" : undefined,
          animation:
            !isDragging
              ? closing
                ? "slideDown 0.3s ease forwards"
                : "slideUp 0.3s ease"
              : undefined,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 0",
            position: "sticky",
            top: 0,
            background: "#1a1a1a",
            borderRadius: "16px 16px 0 0",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              background: "rgba(244,242,236,0.2)",
              borderRadius: 2,
            }}
          />
        </div>

        {children(animateClose)}
      </div>
    </div>
  );
}
