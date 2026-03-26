"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Wrench,
  Wifi,
  Droplets,
  Zap,
  Pencil,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/stores/use-task-store";
import { useModalStore } from "@/stores/use-modal-store";
import { useAppStore } from "@/stores/use-app-store";
import { useFlatStore } from "@/stores/use-flat-store";
import { TasksPageSkeleton } from "@/components/shared/Skeletons";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-on-surface-variant" />,
  completed: <CheckCircle2 className="h-4 w-4 text-primary" />,
};

const priorityBadge: Record<string, string> = {
  low: "bg-surface-container-high text-on-surface-variant",
  normal: "bg-primary-fixed text-primary",
  high: "bg-tertiary-container text-on-tertiary-container",
  urgent: "bg-error-container text-on-error-container",
};

const resourceIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  water: <Droplets className="h-4 w-4" />,
  electricity: <Zap className="h-4 w-4" />,
};

const resourceStatusColor: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  needs_attention: "bg-tertiary-container text-on-tertiary-container",
  inactive: "bg-surface-container-high text-on-surface-variant",
};

export default function TasksPage() {
  const isAppReady = useAppStore((s) => s.isAppReady);
  const tasks = useTaskStore((s) => s.tasks);
  const resources = useTaskStore((s) => s.resources);
  const updateTask = useTaskStore((s) => s.updateTask);
  const openNewEntry = useModalStore((s) => s.openNewEntry);
  const openEditEntry = useModalStore((s) => s.openEditEntry);
  const members = useFlatStore((s) => s.members);

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  if (!isAppReady) return <TasksPageSkeleton />;

  const toggleTaskComplete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    updateTask(taskId, {
      status: task.status === "completed" ? "pending" : "completed",
      completed_at:
        task.status === "completed" ? null : new Date().toISOString(),
    });
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Tasks & Logistics
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Household chores, repairs & resources
          </p>
        </div>
        <button
          onClick={() => openNewEntry("task")}
          className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-linear-to-r from-primary to-primary-dim text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
      </motion.div>

      {/* Resource Cards */}
      {resources.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium mb-3">
            Household Resources
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-surface-container-lowest rounded-[12px] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-on-surface">
                    {resourceIcons[resource.name.toLowerCase()] || (
                      <Wrench className="h-4 w-4" />
                    )}
                    <p className="text-sm font-medium">{resource.name}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      resourceStatusColor[resource.status] ||
                      "bg-surface-container"
                    }`}
                  >
                    {resource.status.replace("_", " ")}
                  </span>
                </div>
                {resource.details && (
                  <p className="text-xs text-on-surface-variant">
                    {resource.details}
                  </p>
                )}
                {resource.next_action_date && (
                  <p className="text-[10px] text-on-surface-variant">
                    Next:{" "}
                    {format(new Date(resource.next_action_date), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Task Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="bg-surface-container rounded-[12px] p-1 h-auto">
            <TabsTrigger
              value="pending"
              className="rounded-[8px] text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:text-on-surface px-3 py-3"
            >
              Pending
              <Badge
                variant="secondary"
                className="ml-1.5 bg-primary-fixed text-primary text-[10px] h-5"
              >
                {pendingTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-[8px] text-sm data-[state=active]:bg-surface-container-lowest data-[state=active]:text-on-surface px-3 py-3"
            >
              Done
              <Badge
                variant="secondary"
                className="ml-1.5 bg-surface-container-high text-on-surface-variant text-[10px] h-5"
              >
                {completedTasks.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Pending Tasks */}
          <TabsContent value="pending" className="space-y-2">
            <AnimatePresence>
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    onToggle={toggleTaskComplete}
                    onEdit={() => openEditEntry({ type: "task", data: task })}
                    members={members}
                  />
                ))
              ) : (
                <EmptyState message="All caught up! No pending tasks." />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed" className="space-y-2">
            <AnimatePresence>
              {completedTasks.length > 0 ? (
                completedTasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    onToggle={toggleTaskComplete}
                    onEdit={() => openEditEntry({ type: "task", data: task })}
                    members={members}
                  />
                ))
              ) : (
                <EmptyState message="No completed tasks yet." />
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    assigned_to: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    completed_at: string | null;
  };
  index: number;
  onToggle: (id: string) => void;
  onEdit: () => void;
  members: { id: string; display_name: string }[];
}

function TaskCard({ task, index, onToggle, onEdit, members }: TaskCardProps) {
  const isCompleted = task.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-surface-container-lowest rounded-[12px] p-4 flex items-start gap-3 group cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all ${
        isCompleted ? "opacity-60" : ""
      }`}
      onClick={onEdit}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className="mt-0.5 shrink-0"
      >
        {statusIcon[task.status] || (
          <Circle className="h-4 w-4 text-on-surface-variant" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium ${
              isCompleted
                ? "text-on-surface-variant line-through"
                : "text-on-surface"
            }`}
          >
            {task.title}
          </p>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
              priorityBadge[task.priority] || priorityBadge.normal
            }`}
          >
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        {task.due_date && (
          <p className="text-[10px] text-on-surface-variant mt-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Due {format(new Date(task.due_date), "MMM d, yyyy")}
          </p>
        )}

        {task.completed_at && (
          <p className="text-[10px] text-primary mt-1">
            Completed {format(new Date(task.completed_at), "MMM d")}
          </p>
        )}

        {task.assigned_to &&
          (() => {
            const member = members.find((m) => m.id === task.assigned_to);
            return member ? (
              <p className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1">
                <span className="text-primary">@</span> {member.display_name}
              </p>
            ) : null;
          })()}
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-surface-container rounded-[12px] p-8 text-center"
    >
      <ClipboardList className="h-8 w-8 text-on-surface-variant/30 mx-auto mb-2" />
      <p className="text-sm text-on-surface-variant">{message}</p>
    </motion.div>
  );
}
