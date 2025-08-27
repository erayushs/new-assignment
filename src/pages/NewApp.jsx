import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Task Management System — Single-file React App
 * - All UI is inside <App/> (inner components declared inside the function).
 * - Tailwind CSS for styling.
 * - Mock REST API with token/session in localStorage (swap to real API by replacing calls in `api`).
 * - RBAC: admin, manager, member.
 *    - admin: full access (users & tasks).
 *    - manager: task create/update/delete, assign tasks to anyone, list users.
 *    - member: can create tasks, update/delete ONLY own tasks, cannot assign/reassign (except themselves on create).
 * - Users: create + list (admin only can create users).
 * - Auth: email/password, token stored in localStorage.
 * - Pagination: tasks list with page controls.
 * - Responsive layout.
 */

export default function App() {
  // ------------------------------
  // Mock REST API (localStorage-backed)
  // ------------------------------
  const api = useMemo(() => {
    const LS_USERS = "tms_users";
    const LS_TASKS = "tms_tasks";
    const LS_SESSION = "tms_session";

    // Helpers
    const readJSON = (k, fallback) => {
      try {
        const raw = localStorage.getItem(k);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };
    const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const uid = () => Math.random().toString(36).slice(2, 10);
    const nowISO = () => new Date().toISOString();

    const seedIfEmpty = () => {
      const users = readJSON(LS_USERS, []);
      if (!users || users.length === 0) {
        const seeded = [
          {
            id: uid(),
            name: "Alice Admin",
            email: "admin@demo.com",
            role: "admin",
            password: "admin",
            createdAt: nowISO(),
          },
          {
            id: uid(),
            name: "Mark Manager",
            email: "manager@demo.com",
            role: "manager",
            password: "manager",
            createdAt: nowISO(),
          },
          {
            id: uid(),
            name: "Mia Member",
            email: "member@demo.com",
            role: "member",
            password: "member",
            createdAt: nowISO(),
          },
        ];
        writeJSON(LS_USERS, seeded);
      }
      const tasks = readJSON(LS_TASKS, []);
      if (!tasks || tasks.length === 0) {
        const usersRef = readJSON(LS_USERS, []);
        const adminId = usersRef.find((u) => u.role === "admin")?.id;
        const memberId = usersRef.find((u) => u.role === "member")?.id;
        const seededTasks = [
          {
            id: uid(),
            title: "Kickoff meeting",
            description: "Project intro and scope alignment.",
            status: "todo",
            priority: "medium",
            createdAt: nowISO(),
            updatedAt: nowISO(),
            createdBy: adminId,
            assignedTo: memberId,
            dueDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
          },
          {
            id: uid(),
            title: "Create wireframes",
            description: "Low-fidelity screens for core flows.",
            status: "in-progress",
            priority: "high",
            createdAt: nowISO(),
            updatedAt: nowISO(),
            createdBy: adminId,
            assignedTo: adminId,
            dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          },
        ];
        writeJSON(LS_TASKS, seededTasks);
      }
    };

    seedIfEmpty();

    const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms));

    // Simple token/session utilities
    const createToken = (user) => `mock-token-${user.id}`;
    const getUserFromToken = (token) => {
      if (!token || !token.startsWith("mock-token-")) return null;
      const id = token.replace("mock-token-", "");
      const users = readJSON(LS_USERS, []);
      return users.find((u) => u.id === id) || null;
    };

    // RBAC checks
    const canManageUsers = (user) => user?.role === "admin";
    const canAssignTasks = (user) =>
      user && (user.role === "admin" || user.role === "manager");
    const canDeleteTask = (user, task) =>
      user &&
      (user.role === "admin" ||
        user.role === "manager" ||
        (user.role === "member" && task.createdBy === user.id));
    const canUpdateTask = (user, task) =>
      user &&
      (user.role === "admin" ||
        user.role === "manager" ||
        (user.role === "member" && task.createdBy === user.id));

    // API shape
    return {
      auth: {
        login: async ({ email, password }) => {
          await delay();
          const users = readJSON(LS_USERS, []);
          const user = users.find(
            (u) => u.email === email && u.password === password
          );
          if (!user) {
            const err = new Error("Invalid email or password.");
            err.status = 401;
            throw err;
          }
          const token = createToken(user);
          writeJSON(LS_SESSION, { token, userId: user.id, at: nowISO() });
          return { token, user };
        },
        logout: async () => {
          await delay(100);
          localStorage.removeItem(LS_SESSION);
          return { ok: true };
        },
        me: async () => {
          await delay(100);
          const session = readJSON(LS_SESSION, null);
          if (!session?.token) return null;
          const user = getUserFromToken(session.token);
          if (!user) return null;
          return { token: session.token, user };
        },
      },
      users: {
        list: async ({ token }) => {
          await delay();
          const me = getUserFromToken(token);
          if (!me) throw new Error("Unauthorized");
          const users = readJSON(LS_USERS, []);
          // Everyone can list users in this mock (you can limit to admin/manager if you prefer)
          return users.map(({ password, ...rest }) => rest);
        },
        create: async ({ token, payload }) => {
          await delay();
          const me = getUserFromToken(token);
          if (!me || !canManageUsers(me)) {
            const err = new Error("Forbidden: only admin can create users.");
            err.status = 403;
            throw err;
          }
          const users = readJSON(LS_USERS, []);
          if (users.some((u) => u.email === payload.email)) {
            const err = new Error("Email already exists.");
            err.status = 409;
            throw err;
          }
          const newUser = {
            id: uid(),
            name: payload.name,
            email: payload.email,
            role: payload.role,
            password: payload.password || "password",
            createdAt: nowISO(),
          };
          users.push(newUser);
          writeJSON(LS_USERS, users);
          const { password, ...sanitized } = newUser;
          return sanitized;
        },
      },
      tasks: {
        list: async ({ token, page = 1, pageSize = 5, status, search }) => {
          await delay();
          const me = getUserFromToken(token);
          if (!me) throw new Error("Unauthorized");

          let tasks = readJSON(LS_TASKS, []);
          // Basic filtering
          if (status && status !== "all")
            tasks = tasks.filter((t) => t.status === status);
          if (search) {
            const s = search.toLowerCase();
            tasks = tasks.filter(
              (t) =>
                t.title.toLowerCase().includes(s) ||
                (t.description || "").toLowerCase().includes(s)
            );
          }
          // Order by createdAt desc
          tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          const total = tasks.length;
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          const items = tasks.slice(start, end);
          return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          };
        },
        create: async ({ token, payload }) => {
          await delay();
          const me = getUserFromToken(token);
          if (!me) throw new Error("Unauthorized");

          // members cannot assign to others; force assignedTo to self if they try
          let assignedTo = payload.assignedTo || me.id;
          if (me.role === "member" && assignedTo !== me.id) {
            assignedTo = me.id;
          }

          const tasks = readJSON(LS_TASKS, []);
          const newTask = {
            id: uid(),
            title: payload.title,
            description: payload.description || "",
            status: payload.status || "todo",
            priority: payload.priority || "medium",
            createdAt: nowISO(),
            updatedAt: nowISO(),
            createdBy: me.id,
            assignedTo,
            dueDate: payload.dueDate || null,
          };
          tasks.push(newTask);
          writeJSON(LS_TASKS, tasks);
          return newTask;
        },
        update: async ({ token, id, payload }) => {
          await delay();
          const me = getUserFromToken(token);
          if (!me) throw new Error("Unauthorized");
          const tasks = readJSON(LS_TASKS, []);
          const idx = tasks.findIndex((t) => t.id === id);
          if (idx < 0) throw new Error("Not found");

          const t = tasks[idx];
          if (!canUpdateTask(me, t)) {
            const err = new Error("Forbidden: you cannot update this task.");
            err.status = 403;
            throw err;
          }

          // assignment rules
          let assignedTo = payload.assignedTo ?? t.assignedTo;
          if (payload.assignedTo !== undefined && !canAssignTasks(me)) {
            // members cannot change assignment
            assignedTo = t.assignedTo;
          }

          tasks[idx] = {
            ...t,
            ...payload,
            assignedTo,
            updatedAt: nowISO(),
          };
          writeJSON(LS_TASKS, tasks);
          return tasks[idx];
        },
        remove: async ({ token, id }) => {
          await delay();
          const me = getUserFromToken(token);
          if (!me) throw new Error("Unauthorized");
          const tasks = readJSON(LS_TASKS, []);
          const t = tasks.find((x) => x.id === id);
          if (!t) throw new Error("Not found");
          if (!canDeleteTask(me, t)) {
            const err = new Error("Forbidden: you cannot delete this task.");
            err.status = 403;
            throw err;
          }
          const next = tasks.filter((x) => x.id !== id);
          writeJSON(LS_TASKS, next);
          return { ok: true };
        },
      },
      // expose for debugging
      _debug: { LS_USERS, LS_TASKS, LS_SESSION },
    };
  }, []);

  // ------------------------------
  // Auth State
  // ------------------------------
  const [auth, setAuth] = useState({
    token: null,
    user: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    let mounted = true;
    api.auth
      .me()
      .then((res) => {
        if (!mounted) return;
        if (res)
          setAuth({
            token: res.token,
            user: res.user,
            loading: false,
            error: "",
          });
        else setAuth({ token: null, user: null, loading: false, error: "" });
      })
      .catch(() => {
        if (!mounted) return;
        setAuth({ token: null, user: null, loading: false, error: "" });
      });
    return () => {
      mounted = false;
    };
  }, [api]);

  const isAdmin = auth.user?.role === "admin";
  const isManager = auth.user?.role === "manager";
  const isMember = auth.user?.role === "member";

  // ------------------------------
  // UI Helpers
  // ------------------------------
  const [activeTab, setActiveTab] = useState("tasks"); // tasks | users | profile
  const [toast, setToast] = useState({ type: "", msg: "" });
  const notify = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: "", msg: "" }), 2200);
  };

  // ------------------------------
  // Users (Admin)
  // ------------------------------
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "member",
    password: "",
  });
  const [userError, setUserError] = useState("");

  const fetchUsers = async () => {
    if (!auth.token) return;
    try {
      const data = await api.users.list({ token: auth.token });
      setUsers(data);
    } catch (e) {
      notify("error", e.message || "Failed to load users.");
    }
  };

  useEffect(() => {
    if (auth.token) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError("");
    if (!userForm.name || !userForm.email || !userForm.password) {
      setUserError("All fields are required.");
      return;
    }
    try {
      await api.users.create({ token: auth.token, payload: userForm });
      setUserForm({ name: "", email: "", role: "member", password: "" });
      fetchUsers();
      notify("success", "User created.");
    } catch (e) {
      setUserError(e.message || "Failed to create user.");
    }
  };

  // ------------------------------
  // Tasks
  // ------------------------------
  const [tasks, setTasks] = useState([]);
  const [taskTotal, setTaskTotal] = useState(0);
  const [taskQuery, setTaskQuery] = useState({
    page: 1,
    pageSize: 5,
    status: "all",
    search: "",
  });
  const [taskLoading, setTaskLoading] = useState(false);

  const emptyTask = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  };
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [taskError, setTaskError] = useState("");
  const titleInputRef = useRef(null);

  const fetchTasks = async () => {
    if (!auth.token) return;
    setTaskLoading(true);
    try {
      const { items, total } = await api.tasks.list({
        token: auth.token,
        page: taskQuery.page,
        pageSize: taskQuery.pageSize,
        status: taskQuery.status,
        search: taskQuery.search.trim(),
      });
      setTasks(items);
      setTaskTotal(total);
    } catch (e) {
      notify("error", e.message || "Failed to load tasks.");
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    auth.token,
    taskQuery.page,
    taskQuery.pageSize,
    taskQuery.status,
    taskQuery.search,
  ]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError("");
    if (!taskForm.title) {
      setTaskError("Title is required.");
      titleInputRef.current?.focus();
      return;
    }
    try {
      // default assignment: member cannot assign to others
      const payload = {
        ...taskForm,
        assignedTo: taskForm.assignedTo || auth.user?.id,
        dueDate: taskForm.dueDate || null,
      };
      await api.tasks.create({ token: auth.token, payload });
      setTaskForm(emptyTask);
      setTaskQuery((q) => ({ ...q, page: 1 })); // jump to first page to see newest
      fetchTasks();
      notify("success", "Task created.");
    } catch (e) {
      setTaskError(e.message || "Failed to create task.");
    }
  };

  const handleUpdateTask = async (id, patch) => {
    try {
      await api.tasks.update({ token: auth.token, id, payload: patch });
      fetchTasks();
      notify("success", "Task updated.");
    } catch (e) {
      notify("error", e.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.tasks.remove({ token: auth.token, id });
      fetchTasks();
      notify("success", "Task deleted.");
    } catch (e) {
      notify("error", e.message || "Failed to delete task.");
    }
  };

  // ------------------------------
  // Auth UI
  // ------------------------------
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const doLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await api.auth.login(loginForm);
      setAuth({ token: res.token, user: res.user, loading: false, error: "" });
      setActiveTab("tasks");
      notify("success", `Welcome back, ${res.user.name.split(" ")[0]}!`);
    } catch (e) {
      setLoginError(e.message || "Login failed.");
    }
  };

  const doLogout = async () => {
    await api.auth.logout();
    setAuth({ token: null, user: null, loading: false, error: "" });
    setTasks([]);
    setUsers([]);
    setActiveTab("tasks");
    notify("success", "Logged out.");
  };

  // ------------------------------
  // Inner Components (kept inside <App/>)
  // ------------------------------
  const Shell = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-300">
              🗂️
            </span>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Task Management System
            </h1>
          </div>
          {auth.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-600">
                {auth.user.name} <span className="text-slate-400">·</span>{" "}
                <span className="uppercase text-xs bg-slate-100 px-2 py-0.5 rounded">
                  {auth.user.role}
                </span>
              </span>
              <button
                onClick={doLogout}
                className="text-sm px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
        {toast.msg ? (
          <div
            className={`mx-4 md:mx-auto md:max-w-6xl my-2 rounded-xl px-4 py-2 text-sm ${
              toast.type === "error"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {toast.msg}
          </div>
        ) : null}
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4">{children}</main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto p-4 text-xs text-slate-500">
        Demo creds: admin@demo.com / admin · manager@demo.com / manager ·
        member@demo.com / member
      </footer>
    </div>
  );

  const AuthView = () => (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-1">Login</h2>
        <p className="text-sm text-slate-600 mb-4">
          Sign in with the demo credentials or your own.
        </p>
        <form className="space-y-3" onSubmit={doLogin}>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, email: e.target.value }))
              }
              type="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, password: e.target.value }))
              }
              type="password"
              placeholder="••••••••"
            />
          </div>
          {loginError ? (
            <p className="text-sm text-rose-600">{loginError}</p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 text-white py-2 hover:bg-slate-800"
          >
            Sign In
          </button>
          <div className="text-xs text-slate-500">
            Tip: Try <span className="font-mono">admin@demo.com / admin</span>
          </div>
        </form>
      </div>
    </div>
  );

  const Tabs = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setActiveTab("tasks")}
        className={`px-3 py-1.5 rounded-xl border ${
          activeTab === "tasks"
            ? "bg-slate-900 text-white border-slate-900"
            : "border-slate-300 hover:bg-white"
        }`}
      >
        Tasks
      </button>
      {(isAdmin || isManager) && (
        <button
          onClick={() => setActiveTab("users")}
          className={`px-3 py-1.5 rounded-xl border ${
            activeTab === "users"
              ? "bg-slate-900 text-white border-slate-900"
              : "border-slate-300 hover:bg-white"
          }`}
        >
          Users
        </button>
      )}
      <button
        onClick={() => setActiveTab("profile")}
        className={`px-3 py-1.5 rounded-xl border ${
          activeTab === "profile"
            ? "bg-slate-900 text-white border-slate-900"
            : "border-slate-300 hover:bg-white"
        }`}
      >
        Profile
      </button>
    </div>
  );

  const UsersView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Create User (admin only) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="text-lg font-semibold mb-2">Create User</h3>
        {!isAdmin ? (
          <p className="text-sm text-slate-500">
            Only admins can create users.
          </p>
        ) : (
          <form className="grid gap-3" onSubmit={handleCreateUser}>
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="member">member</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, password: e.target.value }))
                  }
                  type="password"
                />
              </div>
            </div>
            {userError ? (
              <p className="text-sm text-rose-600">{userError}</p>
            ) : null}
            <button className="rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800">
              Create
            </button>
          </form>
        )}
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Users</h3>
          <button
            className="text-sm px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50"
            onClick={fetchUsers}
          >
            Refresh
          </button>
        </div>
        <div className="divide-y text-sm">
          {users.map((u) => (
            <div key={u.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-slate-500">{u.email}</div>
              </div>
              <span className="text-xs uppercase bg-slate-100 px-2 py-0.5 rounded">
                {u.role}
              </span>
            </div>
          ))}
          {users.length === 0 && (
            <div className="py-6 text-slate-500">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );

  const TaskFormCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <h3 className="text-lg font-semibold mb-2">Create Task</h3>
      <form className="grid gap-3" onSubmit={handleCreateTask}>
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            ref={titleInputRef}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm((f) => ({ ...f, title: e.target.value }))
            }
            placeholder="Short title"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
            placeholder="Details..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={taskForm.status}
              onChange={(e) =>
                setTaskForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="todo">todo</option>
              <option value="in-progress">in-progress</option>
              <option value="done">done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={taskForm.priority}
              onChange={(e) =>
                setTaskForm((f) => ({ ...f, priority: e.target.value }))
              }
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Due date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={taskForm.dueDate ? taskForm.dueDate.slice(0, 10) : ""}
              onChange={(e) =>
                setTaskForm((f) => ({ ...f, dueDate: e.target.value }))
              }
            />
          </div>
        </div>

        {(isAdmin || isManager) && (
          <div>
            <label className="block text-sm mb-1">Assign to</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={taskForm.assignedTo}
              onChange={(e) =>
                setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))
              }
            >
              <option value="">— Select user —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Members cannot assign tasks to others.
            </p>
          </div>
        )}

        {taskError ? (
          <p className="text-sm text-rose-600">{taskError}</p>
        ) : null}

        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800">
            Create
          </button>
          <button
            type="button"
            onClick={() => setTaskForm(emptyTask)}
            className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-white"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );

  const TaskFilters = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <div className="flex gap-2">
        <select
          className="rounded-xl border border-slate-300 px-3 py-2"
          value={taskQuery.status}
          onChange={(e) =>
            setTaskQuery((q) => ({ ...q, status: e.target.value, page: 1 }))
          }
        >
          <option value="all">All</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          className="rounded-xl border border-slate-300 px-3 py-2"
          value={taskQuery.pageSize}
          onChange={(e) =>
            setTaskQuery((q) => ({
              ...q,
              pageSize: Number(e.target.value),
              page: 1,
            }))
          }
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="rounded-xl border border-slate-300 px-3 py-2 w-full sm:w-64"
          placeholder="Search title/description…"
          value={taskQuery.search}
          onChange={(e) =>
            setTaskQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
          }
        />
        <button
          className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
          onClick={fetchTasks}
        >
          Refresh
        </button>
      </div>
    </div>
  );

  const TaskList = () => (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <span className="text-sm text-slate-500">{taskTotal} total</span>
      </div>
      {taskLoading ? (
        <div className="p-6 text-slate-500">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="p-6 text-slate-500">No tasks found.</div>
      ) : (
        <ul className="divide-y">
          {tasks.map((t) => (
            <li key={t.id} className="p-4">
              <TaskRow task={t} />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-sm">
        <div>
          Page {taskQuery.page} of{" "}
          {Math.max(1, Math.ceil(taskTotal / taskQuery.pageSize))}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-xl border border-slate-300 disabled:opacity-50"
            disabled={taskQuery.page <= 1}
            onClick={() => setTaskQuery((q) => ({ ...q, page: q.page - 1 }))}
          >
            Prev
          </button>
          <button
            className="px-3 py-1.5 rounded-xl border border-slate-300 disabled:opacity-50"
            disabled={
              taskQuery.page >= Math.ceil(taskTotal / taskQuery.pageSize)
            }
            onClick={() => setTaskQuery((q) => ({ ...q, page: q.page + 1 }))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const TaskRow = ({ task }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });

    const assignedUser = users.find((u) => u.id === task.assignedTo);
    const createdByUser = users.find((u) => u.id === task.createdBy);

    const canEdit =
      isAdmin || isManager || (isMember && task.createdBy === auth.user?.id);
    const canAssign = isAdmin || isManager;

    const save = async () => {
      const patch = {
        title: draft.title,
        description: draft.description,
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate || null,
      };
      if (canAssign) patch.assignedTo = draft.assignedTo;
      await handleUpdateTask(task.id, patch);
      setEditing(false);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        <div className="md:col-span-5">
          {editing ? (
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 mb-2"
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
            />
          ) : (
            <div className="font-medium">{task.title}</div>
          )}
          {editing ? (
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              rows={2}
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
          ) : (
            <div className="text-sm text-slate-600">
              {task.description || "—"}
            </div>
          )}
          <div className="mt-2 text-xs text-slate-500">
            Created by{" "}
            <span className="font-medium">
              {createdByUser?.name || "Unknown"}
            </span>{" "}
            · {new Date(task.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              {editing ? (
                <select
                  className="text-indigo-700 bg-indigo-50"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, status: e.target.value }))
                  }
                >
                  <option value="todo">todo</option>
                  <option value="in-progress">in-progress</option>
                  <option value="done">done</option>
                </select>
              ) : (
                task.status
              )}
            </span>
            <span className="text-xs uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
              {editing ? (
                <select
                  className="text-amber-700 bg-amber-50"
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, priority: e.target.value }))
                  }
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              ) : (
                task.priority
              )}
            </span>
          </div>

          <div className="mt-2 text-sm">
            <div className="text-slate-500">Assignee</div>
            {editing && (isAdmin || isManager) ? (
              <select
                className="rounded-xl border border-slate-300 px-2 py-1 text-sm"
                value={draft.assignedTo}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, assignedTo: e.target.value }))
                }
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-medium">
                {assignedUser ? assignedUser.name : "Unassigned"}
              </div>
            )}
          </div>

          <div className="mt-2 text-sm">
            <div className="text-slate-500">Due</div>
            {editing ? (
              <input
                type="date"
                className="rounded-xl border border-slate-300 px-2 py-1 text-sm"
                value={draft.dueDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, dueDate: e.target.value }))
                }
              />
            ) : (
              <div className="font-medium">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "—"}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 flex items-center md:justify-end gap-2">
          {canEdit ? (
            editing ? (
              <>
                <button
                  className="px-3 py-1.5 rounded-xl border border-slate-300"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white"
                  onClick={save}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-3 py-1.5 rounded-xl border border-slate-300"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              </>
            )
          ) : (
            <span className="text-xs text-slate-500">Read-only</span>
          )}
        </div>
      </div>
    );
  };

  const TasksView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <TaskFormCard />
      </div>
      <div className="lg:col-span-2 space-y-3">
        <TaskFilters />
        <TaskList />
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <h3 className="text-lg font-semibold mb-3">Profile</h3>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-slate-500">Name</div>
          <div className="font-medium">{auth.user?.name}</div>
        </div>
        <div>
          <div className="text-slate-500">Email</div>
          <div className="font-medium">{auth.user?.email}</div>
        </div>
        <div>
          <div className="text-slate-500">Role</div>
          <div className="font-medium">{auth.user?.role}</div>
        </div>
        <div>
          <div className="text-slate-500">User ID</div>
          <div className="font-mono text-xs">{auth.user?.id}</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-500">
        Session token is stored in localStorage for this mock. Replace `api`
        methods with real API calls to integrate with your backend.
      </div>
    </div>
  );

  // ------------------------------
  // Render
  // ------------------------------
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  return (
    <Shell>
      {!auth.user ? (
        <AuthView />
      ) : (
        <>
          <Tabs />
          {activeTab === "tasks" && <TasksView />}
          {activeTab === "users" && <UsersView />}
          {activeTab === "profile" && <ProfileView />}
        </>
      )}
    </Shell>
  );
}
