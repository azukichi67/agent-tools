import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { deleteTodo, getTodo, updateTodo } from "../server/todos";

export const Route = createFileRoute("/todos/$todoId")({
	component: TodoDetailPage,
	loader: async ({ params }) => {
		return getTodo({ data: { id: Number(params.todoId) } });
	},
});

function TodoDetailPage() {
	const { todoId } = Route.useParams();
	const initialData = Route.useLoaderData();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: todo } = useQuery({
		queryKey: ["todo", todoId],
		queryFn: () => getTodo({ data: { id: Number(todoId) } }),
		initialData,
	});

	const [title, setTitle] = useState(todo?.title ?? "");
	const [description, setDescription] = useState(todo?.description ?? "");
	const [isEditing, setIsEditing] = useState(false);

	const updateMutation = useMutation({
		mutationFn: (data: {
			title?: string;
			description?: string | null;
			completed?: boolean;
		}) => updateTodo({ data: { id: Number(todoId), ...data } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
			setIsEditing(false);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteTodo({ data: { id: Number(todoId) } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			navigate({ to: "/" });
		},
	});

	if (!todo) {
		return (
			<main className="page-wrap mx-auto max-w-2xl px-4 pb-8 pt-14">
				<p className="text-center text-(--sea-ink-soft)">
					Todo not found.
				</p>
				<Link
					to="/"
					className="mt-4 block text-center text-sm text-(--lagoon)"
				>
					Back to list
				</Link>
			</main>
		);
	}

	return (
		<main className="page-wrap mx-auto max-w-2xl px-4 pb-8 pt-14">
			<Link
				to="/"
				className="mb-6 inline-flex items-center gap-1 text-sm text-(--lagoon) no-underline hover:underline"
			>
				&larr; Back to list
			</Link>

			<section className="island-shell rise-in rounded-2xl px-6 py-8 sm:px-10">
				{isEditing ? (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							updateMutation.mutate({
								title: title.trim(),
								description: description.trim() || null,
							});
						}}
						className="flex flex-col gap-4"
					>
						<div>
							<label
								htmlFor="title"
								className="mb-1 block text-xs font-medium text-(--sea-ink-soft)"
							>
								Title
							</label>
							<input
								id="title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full rounded-lg border border-(--line) bg-(--surface) px-4 py-2.5 text-sm text-(--sea-ink) focus:border-(--lagoon) focus:outline-none"
							/>
						</div>
						<div>
							<label
								htmlFor="description"
								className="mb-1 block text-xs font-medium text-(--sea-ink-soft)"
							>
								Description
							</label>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={4}
								className="w-full rounded-lg border border-(--line) bg-(--surface) px-4 py-2.5 text-sm text-(--sea-ink) focus:border-(--lagoon) focus:outline-none"
							/>
						</div>
						<div className="flex gap-2">
							<button
								type="submit"
								disabled={!title.trim()}
								className="rounded-lg bg-(--lagoon) px-5 py-2 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep) disabled:opacity-40"
							>
								Save
							</button>
							<button
								type="button"
								onClick={() => {
									setTitle(todo.title);
									setDescription(todo.description ?? "");
									setIsEditing(false);
								}}
								className="rounded-lg border border-(--line) px-5 py-2 text-sm text-(--sea-ink-soft) transition hover:bg-(--surface-strong)"
							>
								Cancel
							</button>
						</div>
					</form>
				) : (
					<div>
						<div className="mb-4 flex items-start justify-between gap-4">
							<h1
								className={`text-2xl font-bold tracking-tight ${
									todo.completed
										? "text-(--sea-ink-soft) line-through"
										: "text-(--sea-ink)"
								}`}
							>
								{todo.title}
							</h1>
							<span
								className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
									todo.completed
										? "bg-(--lagoon)/15 text-(--lagoon-deep)"
										: "bg-(--surface-strong) text-(--sea-ink-soft)"
								}`}
							>
								{todo.completed ? "Completed" : "Active"}
							</span>
						</div>

						{todo.description && (
							<p className="mb-6 text-sm text-(--sea-ink-soft)">
								{todo.description}
							</p>
						)}

						<p className="mb-6 text-xs text-(--sea-ink-soft)/60">
							Created {new Date(todo.createdAt).toLocaleDateString("ja-JP")}
						</p>

						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() =>
									updateMutation.mutate({
										completed: !todo.completed,
									})
								}
								className="rounded-lg border border-(--line) px-4 py-2 text-sm transition hover:bg-(--surface-strong)"
							>
								{todo.completed ? "Mark as active" : "Mark as completed"}
							</button>
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								className="rounded-lg border border-(--line) px-4 py-2 text-sm transition hover:bg-(--surface-strong)"
							>
								Edit
							</button>
							<button
								type="button"
								onClick={() => deleteMutation.mutate()}
								className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
							>
								Delete
							</button>
						</div>
					</div>
				)}
			</section>
		</main>
	);
}
