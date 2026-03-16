import { useState } from "react";

export default function TodoForm({
	onSubmit,
}: {
	onSubmit: (title: string) => void;
}) {
	const [title, setTitle] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = title.trim();
		if (!trimmed) return;
		onSubmit(trimmed);
		setTitle("");
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="What needs to be done?"
				className="flex-1 rounded-lg border border-(--line) bg-(--surface) px-4 py-2.5 text-sm text-(--sea-ink) placeholder:text-(--sea-ink-soft)/50 focus:border-(--lagoon) focus:outline-none"
			/>
			<button
				type="submit"
				disabled={!title.trim()}
				className="rounded-lg bg-(--lagoon) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep) disabled:opacity-40 disabled:hover:bg-(--lagoon)"
			>
				Add
			</button>
		</form>
	);
}
