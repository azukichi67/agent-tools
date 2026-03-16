import { Link } from "@tanstack/react-router";

interface TodoItemProps {
	id: number;
	title: string;
	completed: boolean;
	onToggle: (id: number) => void;
	onDelete: (id: number) => void;
}

export default function TodoItem({
	id,
	title,
	completed,
	onToggle,
	onDelete,
}: TodoItemProps) {
	return (
		<li className="flex items-center gap-3 rounded-xl border border-(--line) bg-(--surface) px-4 py-3 transition hover:border-(--lagoon)/30">
			<button
				type="button"
				onClick={() => onToggle(id)}
				className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
					completed
						? "border-(--lagoon) bg-(--lagoon) text-white"
						: "border-(--line) hover:border-(--lagoon)"
				}`}
				aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
			>
				{completed && (
					<svg
						className="h-3 w-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={3}
						aria-hidden="true"
						role="img"
					>
						<title>Checkmark</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				)}
			</button>

			<Link
				to="/todos/$todoId"
				params={{ todoId: String(id) }}
				className={`flex-1 text-sm no-underline transition ${
					completed
						? "text-(--sea-ink-soft) line-through"
						: "text-(--sea-ink)"
				}`}
			>
				{title}
			</Link>

			<button
				type="button"
				onClick={() => onDelete(id)}
				className="shrink-0 rounded-md p-1 text-(--sea-ink-soft)/50 transition hover:bg-red-100 hover:text-red-500"
				aria-label="Delete todo"
			>
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
					aria-hidden="true"
					role="img"
				>
					<title>Delete</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</li>
	);
}
