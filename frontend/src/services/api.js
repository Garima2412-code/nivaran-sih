const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/*
 * ---------------------------------------------------------
 * Storage helpers
 * ---------------------------------------------------------
 */

const TOKEN_KEY = "nivaran_token";
const USER_KEY = "nivaran_user";

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getAuthenticatedUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Unable to read stored user:", error);

    localStorage.removeItem(USER_KEY);

    return null;
  }
};

const saveAuthentication = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/*
 * ---------------------------------------------------------
 * Generic API request helper
 * ---------------------------------------------------------
 */

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the NIVARAN backend. Please make sure the backend server is running."
    );
  }

  let data = null;

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }
  } else {
    try {
      const text = await response.text();

      data = text ? { message: text } : null;
    } catch (error) {
      data = null;
    }
  }

  if (!response.ok) {
    /*
     * Backend may return errors in different shapes.
     * Handle the common formats without assuming one exact shape.
     */
    const message =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      data?.errors?.[0] ||
      `Request failed with status ${response.status}.`;

    if (response.status === 401) {
      /*
       * Only clear authentication when the backend explicitly
       * tells us that the token is unauthorized.
       */
      logout();
    }

    throw new Error(message);
  }

  return data;
};

/*
 * ---------------------------------------------------------
 * Authentication
 * ---------------------------------------------------------
 */

export const registerCitizen = async ({
  name,
  email,
  password,
}) => {
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  /*
   * Support the common backend response shapes:
   *
   * {
   *   token,
   *   user
   * }
   *
   * or
   *
   * {
   *   accessToken,
   *   user
   * }
   */
  const token =
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken;

  const user =
    data?.user ||
    data?.data?.user ||
    data?.data;

  if (token || user) {
    saveAuthentication(token, user);
  }

  return data;
};

export const loginCitizen = async ({
  email,
  password,
}) => {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const token =
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken;

  const user =
    data?.user ||
    data?.data?.user ||
    data?.data;

  if (token || user) {
    saveAuthentication(token, user);
  }

  return data;
};

/*
 * ---------------------------------------------------------
 * Grievances
 * ---------------------------------------------------------
 */

/*
 * Create a new citizen grievance.
 *
 * Expected backend fields:
 * title
 * description
 * location (optional)
 */
export const createGrievance = async ({
  title,
  description,
  location,
}) => {
  const body = {
    title,
    description,
  };

  if (location) {
    body.location = location;
  }

  return apiRequest("/api/grievances", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

/*
 * Get grievances belonging to the authenticated citizen.
 */
export const getMyGrievances = async () => {
  const data = await apiRequest("/api/grievances/my", {
    method: "GET",
  });

  /*
   * Support either:
   *
   * [...]
   *
   * or:
   *
   * { grievances: [...] }
   *
   * or:
   *
   * { data: [...] }
   */
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.grievances)) {
    return data.grievances;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

/*
 * Get one grievance by MongoDB _id.
 */
export const getGrievanceById = async (id) => {
  if (!id) {
    throw new Error("Grievance ID is required.");
  }

  const data = await apiRequest(
    `/api/grievances/${encodeURIComponent(id)}`,
    {
      method: "GET",
    }
  );

  return data?.grievance || data?.data || data;
};

/*
 * ---------------------------------------------------------
 * Optional health check
 * ---------------------------------------------------------
 */

export const checkBackendHealth = async () => {
  return apiRequest("/health", {
    method: "GET",
  });
};

export default {
  registerCitizen,
  loginCitizen,
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  getAuthenticatedUser,
  getToken,
  logout,
  checkBackendHealth,
};