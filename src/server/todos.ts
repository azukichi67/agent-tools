import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../db";

export const getTodos = createServerFn({ method: "GET" })
	.inputValidator((input: { filter?: "all" | "active" | "completed" }) => input)
	.handler(async ({ data }) => {
		const where =
			data.filter === "active"
				? { completed: false }
				: data.filter === "completed"
					? { completed: true }
					: {};

		return prisma.todo.findMany({
			where,
			orderBy: { createdAt: "desc" },
		});
	});

export const getTodo = createServerFn({ method: "GET" })
	.inputValidator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		return prisma.todo.findUnique({ where: { id: data.id } });
	});

export const createTodo = createServerFn({ method: "POST" })
	.inputValidator((input: { title: string }) => input)
	.handler(async ({ data }) => {
		return prisma.todo.create({
			data: { title: data.title.trim() },
		});
	});

export const updateTodo = createServerFn({ method: "POST" })
	.inputValidator(
		(input: {
			id: number;
			title?: string;
			description?: string | null;
			completed?: boolean;
		}) => input,
	)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		return prisma.todo.update({
			where: { id },
			data: rest,
		});
	});

export const deleteTodo = createServerFn({ method: "POST" })
	.inputValidator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		return prisma.todo.delete({ where: { id: data.id } });
	});

export const toggleTodo = createServerFn({ method: "POST" })
	.inputValidator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const todo = await prisma.todo.findUniqueOrThrow({
			where: { id: data.id },
		});
		return prisma.todo.update({
			where: { id: data.id },
			data: { completed: !todo.completed },
		});
	});
