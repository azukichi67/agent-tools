import type { Todo } from "../generated/prisma/client.js";
import TodoItem from "./TodoItem";

interface TodoListProps {
	todos: Todo[];
	filter: "all" | "active" | "completed";
	onFilterChange: (filter: "all" | "active" | "completed") => void;
	onToggle: (id: number) => void;
	onDelete: (id: number) => void;
}

const FILTERS = [
	{ key: "all", label: "すべて" },
	{ key: "active", label: "未完了" },
	{ key: "completed", label: "完了済み" },
] as const;

export default function TodoList({
	todos,
	filter,
	onFilterChange,
	onToggle,
	onDelete,
}: TodoListProps) {
	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<p className="text-sm text-(--sea-ink-soft)">
					{todos.length}件
				</p>
				<div className="flex gap-1 rounded-lg bg-(--surface-strong) p-1">
					{FILTERS.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							onClick={() => onFilterChange(key)}
							className={`rounded-md px-3 py-1 text-xs font-medium transition ${
								filter === key
									? "bg-(--lagoon) text-white"
									: "text-(--sea-ink-soft) hover:text-(--sea-ink)"
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{todos.length === 0 ? (
				<p className="py-8 text-center text-sm text-(--sea-ink-soft)">
					{filter === "all"
						? "アイテムはありません"
						: filter === "active"
							? "未完了のTODOはありません"
							: "完了済みのTODOはありません"}
				</p>
			) : (
				<ul className="flex flex-col gap-2">
					{todos.map((todo) => (
						<TodoItem
							key={todo.id}
							id={todo.id}
							title={todo.title}
							completed={todo.completed}
							onToggle={onToggle}
							onDelete={onDelete}
						/>
					))}
				</ul>
			)}
		</div>
	);
}
