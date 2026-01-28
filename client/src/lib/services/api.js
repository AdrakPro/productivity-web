const API_BASE = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
        method: options.method || "GET",
        credentials: "include", // CRITICAL: This sends cookies cross-origin
        headers: {
            ...options.headers,
        },
    };

    if (options.body && !(options.body instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
        config.body = JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
        config.body = options.body;
    }

    try {
        const response = await fetch(url, config);

        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            let errorMessage = "Request failed";
            if (contentType && contentType.includes("application/json")) {
                const error = await response.json();
                errorMessage = error.error || error.message || errorMessage;
            }
            throw new Error(errorMessage);
        }

        if (contentType && contentType.includes("application/json")) {
            return response.json();
        }

        return response.text();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
}

export const authApi = {
    register: (data) =>
        request("/auth/register", { method: "POST", body: data }),
    login: (data) => request("/auth/login", { method: "POST", body: data }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request("/auth/me"),
    changePassword: (data) =>
        request("/auth/password", { method: "PUT", body: data }),
    deleteAccount: () => request("/auth/account", { method: "DELETE" }),
};

export const todosApi = {
    getAll: () => request("/todos"),
    getByDate: (date) => request(`/todos/date/${date}`),
    getGlobal: () => request("/todos/global"),
    getArchived: () => request("/todos/archived"),
    getById: (id) => request(`/todos/${id}`),
    create: (todo) => request("/todos", { method: "POST", body: todo }),
    update: (id, updates) =>
        request(`/todos/${id}`, { method: "PUT", body: updates }),
    delete: (id) => request(`/todos/${id}`, { method: "DELETE" }),
    archive: (id) => request(`/todos/${id}/archive`, { method: "POST" }),
    archiveByDate: (date) =>
        request(`/todos/archive-by-date/${date}`, { method: "POST" }),
};

export const subtasksApi = {
    create: (todoId, title) =>
        request("/subtasks", { method: "POST", body: { todoId, title } }),
    update: (id, updates) =>
        request(`/subtasks/${id}`, { method: "PUT", body: updates }),
    delete: (id) => request(`/subtasks/${id}`, { method: "DELETE" }),
    reorder: (todoId, subtaskIds) =>
        request("/subtasks/reorder", {
            method: "POST",
            body: { todoId, subtaskIds },
        }),
};

export const filesApi = {
    getTree: () => request("/files/tree"),
    getFolder: (parentId) => {
        if (parentId === null || parentId === undefined) {
            return request("/files/folder");
        }
        return request(`/files/folder/${parentId}`);
    },
    getFile: (id) => request(`/files/${id}`),
    createFile: (data) =>
        request("/files/file", { method: "POST", body: data }),
    createFolder: (data) =>
        request("/files/folder", { method: "POST", body: data }),
    updateContent: (id, content) =>
        request(`/files/${id}/content`, { method: "PUT", body: { content } }),
    rename: (id, name) =>
        request(`/files/${id}/rename`, { method: "PUT", body: { name } }),
    move: (id, parentId) =>
        request(`/files/${id}/move`, { method: "PUT", body: { parentId } }),
    delete: (id) => request(`/files/${id}`, { method: "DELETE" }),
    search: (query) => request(`/files/search/${encodeURIComponent(query)}`),
    getUsage: () => request("/files/usage/stats"),
    upload: async (file, parentId) => {
        const formData = new FormData();
        formData.append("file", file);
        if (parentId !== null && parentId !== undefined) {
            formData.append("parentId", String(parentId));
        }
        return request("/files/upload", { method: "POST", body: formData });
    },
    getDownloadUrl: (id) => `${API_BASE}/files/${id}/download`,
};

export const statisticsApi = {
    get: () => request("/statistics"),
    update: (data) => request("/statistics", { method: "PUT", body: data }),
};

export const streaksApi = {
    getAll: () => request("/streaks"),
    getByDate: (date) => request(`/streaks/${date}`),
    recordCompletion: (date) =>
        request(`/streaks/record/${date}`, { method: "POST" }),
};

export const settingsApi = {
    getAll: () => request("/settings"),
    get: (key) => request(`/settings/${key}`).then((r) => r.value),
    set: (key, value) =>
        request(`/settings/${key}`, { method: "PUT", body: { value } }),
};
