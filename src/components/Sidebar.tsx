"use client";

import React, { useEffect, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { LucideProps } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type IconType = React.ElementType<LucideProps>;

export interface SidebarItemAction {
  label: string;
  icon: IconType;
  onClick: () => void;
  destructive?: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: IconType;
  count?: number;
  active?: boolean;
  actions?: SidebarItemAction[];
}

export interface SidebarCategory {
  category: string;
  icon: IconType;
  collapsible?: boolean;
  action?: SidebarItemAction;
  emptyHint?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  navItems: SidebarCategory[];
  activeComponent?: string;
  setActiveComponent: (component: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  portalName: string;
  portalSubtitle?: string;
  portalIcon?: IconType;
  footerItems?: SidebarItem[];
}

const NavButton: React.FC<{
  item: SidebarItem;
  showIconOnly: boolean;
  onNavigate: (id: string) => void;
}> = ({ item, showIconOnly, onNavigate }) => {
  const Icon = item.icon;
  const hasActions = !showIconOnly && !!item.actions?.length;
  return (
    <div className="group/nav relative">
      <button
        type="button"
        title={showIconOnly ? item.label : undefined}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors duration-300",
          showIconOnly && "justify-center px-0 py-3",
          hasActions && "pr-14",
          item.active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={() => onNavigate(item.id)}
      >
        <Icon size={showIconOnly ? 22 : 18} className="shrink-0" />
        {!showIconOnly && (
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left",
              item.active && "font-semibold",
            )}
          >
            {item.label}
          </span>
        )}
        {!showIconOnly && item.count !== undefined && item.count > 0 && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-semibold text-white">
            {item.count}
          </span>
        )}
      </button>
      {hasActions && (
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover/nav:opacity-100 md:group-focus-within/nav:opacity-100">
          {item.actions!.map((action) => (
            <button
              key={action.label}
              type="button"
              title={action.label}
              className={cn(
                "flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors",
                item.active
                  ? "text-primary-foreground/70 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  : action.destructive
                    ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              <action.icon size={13} />
              <span className="sr-only">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activeComponent,
  setActiveComponent,
  isOpen,
  setIsOpen,
  portalName,
  portalSubtitle,
  portalIcon: PortalIcon,
  footerItems = [],
}) => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  // What the panel currently renders (desktop): rail = icons only. Swapped
  // mid-transition so content crossfades instead of blanking out.
  const [railMode, setRailMode] = useState(!isOpen);
  const [contentVisible, setContentVisible] = useState(true);
  const [openCategories, setOpenCategories] = useState<string[]>(() =>
    navItems
      .filter((group) => group.collapsible)
      .map((group) => group.category),
  );

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setRailMode(false);
      setContentVisible(true);
      return;
    }
    if (railMode === !isOpen) {
      setContentVisible(true);
      return;
    }
    setContentVisible(false);
    const timeout = setTimeout(() => {
      setRailMode(!isOpen);
      // let the swapped tree mount at opacity-0 before fading it in
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setContentVisible(true)),
      );
    }, 150);
    return () => clearTimeout(timeout);
  }, [isOpen, isMobile, railMode]);

  const handleNavigation = (component: string) => {
    setActiveComponent(component);
    if (isMobile) setIsOpen(false);
  };

  const iconOnly = railMode && !isMobile;

  const withActive = (item: SidebarItem): SidebarItem => ({
    ...item,
    active: item.active ?? activeComponent === item.id,
  });

  const renderNav = () => (
    <nav>
      <ul className="space-y-1">
        {navItems.map((group) => {
          if (!group.collapsible) {
            return group.items.map((item) => (
              <li key={item.id}>
                <NavButton
                  item={withActive(item)}
                  showIconOnly={iconOnly}
                  onNavigate={handleNavigation}
                />
              </li>
            ));
          }
          const GroupIcon = group.icon;
          return (
            <li key={group.category} className="pt-2">
              <Accordion
                type="multiple"
                value={openCategories}
                onValueChange={setOpenCategories}
                className="w-full"
              >
                <AccordionItem value={group.category} className="border-none">
                  <div className="relative">
                    <AccordionTrigger
                      className={cn(
                        "cursor-pointer rounded-lg p-3 py-2.5 text-muted-foreground transition-colors duration-300 hover:bg-accent hover:text-accent-foreground",
                        iconOnly &&
                          "justify-center gap-0 py-3 [&>svg:last-child]:hidden",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <GroupIcon
                          size={iconOnly ? 22 : 18}
                          className="shrink-0"
                        />
                        {!iconOnly && (
                          <span className="truncate text-sm font-medium">
                            {group.category}
                          </span>
                        )}
                      </span>
                    </AccordionTrigger>
                    {!iconOnly && group.action && (
                      <button
                        type="button"
                        title={group.action.label}
                        className="absolute top-1/2 right-8 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          group.action!.onClick();
                        }}
                      >
                        <group.action.icon size={14} />
                        <span className="sr-only">{group.action.label}</span>
                      </button>
                    )}
                  </div>
                  <AccordionContent className={cn("pb-0", !iconOnly && "pl-3")}>
                    <ul
                      className={cn(
                        iconOnly
                          ? "space-y-1 rounded-lg rounded-t-none border border-t-0 border-sidebar-border p-1"
                          : "space-y-0.5 border-l border-sidebar-border pl-2",
                      )}
                    >
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <NavButton
                            item={withActive(item)}
                            showIconOnly={iconOnly}
                            onNavigate={handleNavigation}
                          />
                        </li>
                      ))}
                      {group.items.length === 0 &&
                        !iconOnly &&
                        group.emptyHint && (
                          <li className="px-2 py-1.5 text-xs text-muted-foreground">
                            {group.emptyHint}
                          </li>
                        )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile-only opener: the drawer is fully off-screen when closed, so a
          floating button is the only way to bring it back. */}
      {isMobile && !isOpen && (
        <button
          type="button"
          className="fixed top-3 left-3 z-40 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 print:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
      )}

      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-20 bg-black/60 transition-opacity duration-300",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 z-30 flex h-dvh flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-[width,transform] duration-300 ease-in-out print:hidden",
          isMobile
            ? cn("w-72", isOpen ? "translate-x-0" : "-translate-x-full")
            : isOpen
              ? "w-72"
              : "w-18",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col transition-opacity duration-150",
            contentVisible ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {iconOnly ? (
            <div className="flex min-h-0 w-18 flex-1 flex-col">
              <div className="flex shrink-0 justify-center border-b border-sidebar-border py-3">
                <button
                  type="button"
                  className="group/toggle flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/85"
                  onClick={() => setIsOpen(true)}
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                >
                  {PortalIcon ? (
                    <>
                      <span className="group-hover/toggle:hidden">
                        <PortalIcon size={16} />
                      </span>
                      <span className="hidden group-hover/toggle:block">
                        <PanelLeftOpen size={16} />
                      </span>
                    </>
                  ) : (
                    <PanelLeftOpen size={16} />
                  )}
                </button>
              </div>
              <div className="scrollbar-hide min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2">
                {renderNav()}
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 w-72 flex-1 flex-col">
              <div className="flex shrink-0 items-center gap-2.5 border-b border-sidebar-border p-4 py-3">
                <button
                  type="button"
                  className="group/toggle flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/85"
                  onClick={() => setIsOpen(false)}
                  aria-label={isMobile ? "Close sidebar" : "Collapse sidebar"}
                  title={isMobile ? "Close sidebar" : "Collapse sidebar"}
                >
                  {PortalIcon ? (
                    <>
                      <span className="group-hover/toggle:hidden">
                        <PortalIcon size={16} />
                      </span>
                      <span className="hidden group-hover/toggle:block">
                        {isMobile ? <X size={16} /> : <PanelLeftClose size={16} />}
                      </span>
                    </>
                  ) : isMobile ? (
                    <X size={16} />
                  ) : (
                    <PanelLeftClose size={16} />
                  )}
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="truncate font-serif text-base font-semibold leading-tight tracking-tight">
                    {portalName}
                  </h2>
                  {portalSubtitle && (
                    <p className="truncate text-xs text-muted-foreground">
                      {portalSubtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="scrollbar-hide min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
                {renderNav()}
              </div>
            </div>
          )}

          {footerItems.length > 0 && (
            <div
              className={cn(
                "shrink-0 border-t border-sidebar-border p-2",
                iconOnly ? "w-18" : "w-72",
              )}
            >
              {footerItems.map((item) => (
                <NavButton
                  key={item.id}
                  item={withActive(item)}
                  showIconOnly={iconOnly}
                  onNavigate={handleNavigation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
