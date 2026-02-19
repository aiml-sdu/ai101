import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock } from 'lucide-react';
import { NAV_TOPICS } from '../data/nav-topics.ts';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SideNavProps {
  activeTopic: string;
  activeSection: string;
  visitedSections?: Set<string>;
}

export default function SideNav({ activeTopic, activeSection, visitedSections }: SideNavProps) {
  const navigate = useNavigate();
  const progress = useCourseProgress();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    () => new Set(activeTopic ? [activeTopic] : []),
  );

  // Keep active topic expanded
  if (activeTopic && !expandedTopics.has(activeTopic)) {
    setExpandedTopics((prev) => new Set(prev).add(activeTopic));
  }

  const toggleExpand = useCallback((topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const handleTopicClick = useCallback((topicId: string, hasSections: boolean) => {
    navigate(`/${topicId}`);
    if (hasSections) {
      toggleExpand(topicId);
    }
  }, [navigate, toggleExpand]);

  const handleSectionClick = useCallback((topicId: string, sectionId: string) => {
    navigate(`/${topicId}#${sectionId}`);
  }, [navigate]);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="font-bold text-lg text-sidebar-foreground">AI101</span>
        <span className="text-xs text-sidebar-foreground/60">Interactive AI Course</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_TOPICS.map((topic) => {
              const isActive = activeTopic === topic.id;
              const isExpanded = expandedTopics.has(topic.id);
              const hasSections = topic.sections.length > 0;

              if (topic.locked) {
                return (
                  <SidebarMenuItem key={topic.id}>
                    <SidebarMenuButton className="opacity-50 cursor-not-allowed pointer-events-none">
                      <span className="text-muted-foreground font-mono text-xs">{topic.number}.</span>
                      <span className="flex-1">{topic.title}</span>
                      <Lock className="size-3.5" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              if (!hasSections) {
                return (
                  <SidebarMenuItem key={topic.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleTopicClick(topic.id, false)}
                    >
                      {topic.number > 0 && (
                        <span className="text-muted-foreground font-mono text-xs">{topic.number}.</span>
                      )}
                      <span>{topic.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible
                  key={topic.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpand(topic.id)}
                  asChild
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => handleTopicClick(topic.id, true)}
                      >
                        {topic.number > 0 && (
                          <span className="text-muted-foreground font-mono text-xs">{topic.number}.</span>
                        )}
                        <span className="flex-1">{topic.title}</span>
                        {(() => {
                          const tp = progress.get(topic.id);
                          return tp && tp.visited > 0 ? (
                            <span className="text-[10px] text-muted-foreground tabular-nums">{tp.visited}/{tp.total}</span>
                          ) : null;
                        })()}
                        <ChevronRight className={`size-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {(() => {
                      const tp = progress.get(topic.id);
                      return tp && tp.visited > 0 ? (
                        <div className="mx-2 h-0.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${tp.pct}%` }}
                          />
                        </div>
                      ) : null;
                    })()}
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {topic.sections.map((section) => {
                          const isSectionActive = activeSection === section.id && activeTopic === topic.id;
                          const isSectionVisited = activeTopic === topic.id && visitedSections?.has(section.id);
                          return (
                            <SidebarMenuSubItem key={`${topic.id}/${section.id}`}>
                              <SidebarMenuSubButton
                                isActive={isSectionActive}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSectionClick(topic.id, section.id);
                                }}
                                href={`#/${topic.id}#${section.id}`}
                                size="sm"
                              >
                                {isSectionVisited && !isSectionActive && (
                                  <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                                )}
                                <span className="text-muted-foreground font-mono text-xs">{section.number}</span>
                                <span>{section.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
