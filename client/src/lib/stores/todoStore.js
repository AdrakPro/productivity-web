import { writable, derived, get } from "svelte/store";
import { todosApi, subtasksApi } from "../services/api.js";
import { viewMode, selectedDate } from "./viewStore.js";
import { success, error as errorToast } from "./toastStore.js";

export const todos = writable([]);
export const archivedTodos = writable([]);
export const isLoading = writable(false);

function getLocalYMD(dateStr) {
    if (!dateStr) return "";

    const dt = new Date(dateStr);

    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export const filteredTodos = derived(
    [todos, viewMode, selectedDate],
    ([$todos, $viewMode, $selectedDate]) => {
        if (!$todos || !Array.isArray($todos)) return [];
        if ($viewMode === "global") {
            return $todos.filter((t) => t.is_global && !t.is_archived);
        } else {
            return $todos.filter((t) => {
                if (t.is_archived || t.is_global) return false;
                return getLocalYMD(t.due_date) === $selectedDate;
            });
        }
    }
);

export const pendingCount = derived(filteredTodos, ($filteredTodos) => {
    if (!$filteredTodos || !Array.isArray($filteredTodos)) return 0;
    return $filteredTodos.filter((t) => !t.is_completed).length;
});

export async function loadTodos() {
    isLoading.set(true);

    try {
        const mode = get(viewMode);
        const date = get(selectedDate);

        console.log("Loading todos:", { mode, date });

        let data;
        if (mode === "global") {
            data = await todosApi.getGlobal();
        } else {
            data = await todosApi.getByDate(date);
        }

        console.log("Loaded todos:", data);

        const todoList = Array.isArray(data) ? data : [];

        todos.set(todoList);
    } catch (err) {
        console.error("Failed to load todos:", err);
        todos.set([]);
    } finally {
        isLoading.set(false);
    }
}

export async function loadArchivedTodos() {
    try {
        const data = await todosApi.getArchived();
        archivedTodos.set(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("Failed to load archived todos:", err);
        archivedTodos.set([]);
    }
}

export async function addTodo(todoData) {
    try {
        console.log("Adding todo:", todoData);

        const newTodo = await todosApi.create(todoData);

        console.log("Created todo:", newTodo);

        if (newTodo) {
            todos.update((currentTodos) => {
                const updated = [newTodo, ...currentTodos];
                console.log("Updated todos store:", updated.length, "todos");
                return updated;
            });

            success("Task created");
        }

        return newTodo;
    } catch (err) {
        console.error("Failed to add todo:", err);
        errorToast(err.message || "Failed to create task");
        throw err;
    }
}

export async function updateTodo(id, updates) {
    try {
        const updatedTodo = await todosApi.update(id, updates);

        if (updatedTodo) {
            todos.update((currentTodos) =>
                currentTodos.map((t) => (t.id === id ? updatedTodo : t))
            );
        }

        return updatedTodo;
    } catch (err) {
        console.error("Failed to update todo:", err);
        errorToast("Failed to update task");
        throw err;
    }
}

export async function toggleTodoComplete(id) {
    const currentTodos = get(todos);
    const todo = currentTodos.find((t) => t.id === id);

    if (!todo) return;

    const isCompleted = !todo.is_completed;

    try {
        const updatedTodo = await todosApi.update(id, {
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
        });

        if (updatedTodo) {
            todos.update((currentTodos) =>
                currentTodos.map((t) => (t.id === id ? updatedTodo : t))
            );

            if (isCompleted) {
                success("Task completed! 🎉");
            }
        }
    } catch (err) {
        console.error("Failed to toggle todo:", err);
        errorToast("Failed to update task");
    }
}

export async function deleteTodo(id) {
    try {
        await todosApi.delete(id);

        todos.update((currentTodos) => currentTodos.filter((t) => t.id !== id));
        archivedTodos.update((currentTodos) =>
            currentTodos.filter((t) => t.id !== id)
        );

        success("Task deleted");
    } catch (err) {
        console.error("Failed to delete todo:", err);
        errorToast("Failed to delete task");
        throw err;
    }
}

export async function archiveTodo(id) {
    try {
        const archivedTodo = await todosApi.archive(id);

        if (archivedTodo) {
            todos.update((currentTodos) =>
                currentTodos.filter((t) => t.id !== id)
            );
            success("Task archived");
        }
    } catch (err) {
        console.error("Failed to archive todo:", err);
        errorToast("Failed to archive task");
        throw err;
    }
}

export async function addSubtask(todoId, title) {
    try {
        const subtask = await subtasksApi.create(todoId, title);

        if (subtask) {
            todos.update((currentTodos) =>
                currentTodos.map((t) => {
                    if (t.id === todoId) {
                        return {
                            ...t,
                            subtasks: [...(t.subtasks || []), subtask],
                        };
                    }
                    return t;
                })
            );
        }

        return subtask;
    } catch (err) {
        console.error("Failed to add subtask:", err);
        errorToast("Failed to add subtask");
        throw err;
    }
}

export async function updateSubtask(todoId, subtaskId, updates) {
    try {
        const updatedSubtask = await subtasksApi.update(subtaskId, updates);

        if (updatedSubtask) {
            todos.update((currentTodos) =>
                currentTodos.map((t) => {
                    if (t.id === todoId) {
                        return {
                            ...t,
                            subtasks: (t.subtasks || []).map((s) =>
                                s.id === subtaskId ? updatedSubtask : s
                            ),
                        };
                    }
                    return t;
                })
            );
        }

        return updatedSubtask;
    } catch (err) {
        console.error("Failed to update subtask:", err);
        errorToast("Failed to update subtask");
        throw err;
    }
}

export async function deleteSubtask(todoId, subtaskId) {
    try {
        await subtasksApi.delete(subtaskId);

        todos.update((currentTodos) =>
            currentTodos.map((t) => {
                if (t.id === todoId) {
                    return {
                        ...t,
                        subtasks: (t.subtasks || []).filter(
                            (s) => s.id !== subtaskId
                        ),
                    };
                }
                return t;
            })
        );
    } catch (err) {
        console.error("Failed to delete subtask:", err);
        errorToast("Failed to delete subtask");
        throw err;
    }
}

export function exportTodos() {
    const data = get(todos);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity-tasks-${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    success("Tasks exported");
}

export async function importTodos(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
            throw new Error("Invalid file format");
        }

        for (const todo of data) {
            await todosApi.create({
                title: todo.title,
                description: todo.description,
                due_date: todo.due_date,
                is_global: todo.is_global,
                priority: todo.priority,
            });
        }

        await loadTodos();
        success(`Imported ${data.length} tasks`);
    } catch (err) {
        console.error("Failed to import todos:", err);
        errorToast("Failed to import tasks");
    }
}

viewMode.subscribe(() => {
    loadTodos();
});

selectedDate.subscribe(() => {
    if (get(viewMode) === "daily") {
        loadTodos();
    }
});
