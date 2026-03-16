import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { createTodo, deleteTodo, getTodos, toggleTodo } from "../server/todos";

export const Route = createFileRoute("/")({
	component: TodoPage,
	loader: async () => {
		return getTodos({ data: { filter: "all" } });
	},
});

function TodoPage() {
	const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
	const queryClient = useQueryClient();
	const initialData = Route.useLoaderData();

	const { data: todos = [] } = useQuery({
		queryKey: ["todos", filter],
		queryFn: () => getTodos({ data: { filter } }),
		initialData: filter === "all" ? initialData : undefined,
	});

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ["todos"] });

	const addMutation = useMutation({
		mutationFn: (title: string) => createTodo({ data: { title } }),
		onSuccess: invalidate,
	});

	const toggleMutation = useMutation({
		mutationFn: (id: number) => toggleTodo({ data: { id } }),
		onSuccess: invalidate,
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => deleteTodo({ data: { id } }),
		onSuccess: invalidate,
	});

	return (
		<main className="page-wrap mx-auto max-w-2xl px-4 pb-8 pt-14">
			<section className="island-shell rise-in rounded-4xl px-6 py-10 sm:px-10 sm:py-14">
				<p className="island-kicker mb-3">Todo App</p>
				<h1 className="display-title mb-6 text-3xl font-bold tracking-tight text-(--sea-ink)">
					What's on your list?
				</h1>

				<TodoForm onSubmit={(title) => addMutation.mutate(title)} />

				<div className="mt-6">
					<TodoList
						todos={todos}
						filter={filter}
						onFilterChange={setFilter}
						onToggle={(id) => toggleMutation.mutate(id)}
						onDelete={(id) => deleteMutation.mutate(id)}
					/>
				</div>
			</section>
		</main>
	);
}
