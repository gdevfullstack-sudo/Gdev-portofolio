const STORAGE_KEY = "estimChatAuth";
const DEFAULT_BACKEND_ORIGIN = window.location.origin;
const BACKEND_ORIGIN = window.ESTIM_CHAT_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN;
const API_BASE = `${BACKEND_ORIGIN}/api`;

const state = {
  auth: loadAuth(),
  socket: null,
  activeUserId: null,
  typingTimeout: null,
  currentChatUser: null
};

function loadAuth() {
  try {
    const sessionValue = sessionStorage.getItem(STORAGE_KEY);
    if (sessionValue) {
      return JSON.parse(sessionValue);
    }

    const legacyValue = localStorage.getItem(STORAGE_KEY);
    if (!legacyValue) {
      return null;
    }

    sessionStorage.setItem(STORAGE_KEY, legacyValue);
    localStorage.removeItem(STORAGE_KEY);
    return JSON.parse(legacyValue);
  } catch (error) {
    return null;
  }
}

function saveAuth(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.removeItem(STORAGE_KEY);
  state.auth = data;
}

function clearAuth() {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  state.auth = null;
}

function getPage() {
  return document.body.dataset.page;
}

function showMessage(elementId, message, type = "") {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.remove("is-error", "is-success");
  if (type) {
    el.classList.add(type === "error" ? "is-error" : "is-success");
  }
}

function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (state.auth?.token) {
    headers.Authorization = `Bearer ${state.auth.token}`;
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
}

async function readResponseData(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { message: text.trim() };
  }
}

function getResponseMessage(response, data, fallbackMessage) {
  if (data?.message) {
    return data.message;
  }

  if (response.status === 404) {
    return "API introuvable. Verifie que le serveur Express tourne bien sur ce localhost.";
  }

  if (response.status >= 500) {
    return fallbackMessage || "Erreur serveur. Regarde aussi la console du backend.";
  }

  if (!response.ok) {
    return fallbackMessage || `Requete echouee (${response.status}).`;
  }

  return fallbackMessage || "Reponse serveur invalide.";
}

function redirectIfAuthenticated() {
  if (state.auth?.token) {
    window.location.href = "inbox.html";
  }
}

function requireAuth() {
  if (!state.auth?.token) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function normalizeAvatar(user) {
  return (
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=FFD700&color=0f0f0f`
  );
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createAvatar(user) {
  const wrapper = document.createElement("div");
  wrapper.className = "avatar";

  const image = document.createElement("img");
  image.src = normalizeAvatar(user);
  image.alt = user.username;

  const dot = document.createElement("span");
  dot.className = `status-dot ${user.isOnline ? "online" : ""}`;

  wrapper.append(image, dot);
  return wrapper;
}

function setupSocket() {
  if (!state.auth?.token || state.socket) return;

  state.socket = io(BACKEND_ORIGIN, {
    auth: {
      token: state.auth.token
    }
  });

  state.socket.on("users:online", ({ userId, isOnline }) => {
    document.querySelectorAll(`[data-user-id="${userId}"] .status-dot`).forEach((dot) => {
      dot.classList.toggle("online", isOnline);
    });
  });

  state.socket.on("typing:update", ({ fromUserId, isTyping }) => {
    if (String(fromUserId) !== String(state.activeUserId)) return;
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
      indicator.textContent = isTyping ? "Ecrit un message..." : "";
    }
  });

  state.socket.on("conversation:update", ({ from, message, createdAt }) => {
    if (
      String(from._id) !== String(state.auth.user._id) &&
      document.visibilityState === "hidden" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(`Nouveau message de ${from.username}`, {
        body: message
      });
    }

    if (getPage() === "inbox") {
      loadInbox();
    }
  });

  state.socket.on("message:new", (message) => {
    if (getPage() !== "chat") return;
    const currentUserId = state.auth.user._id;
    const matchesRoom =
      [String(message.senderId), String(message.receiverId)].includes(String(currentUserId)) &&
      [String(message.senderId), String(message.receiverId)].includes(String(state.activeUserId));

    if (matchesRoom) {
      const existing = document.querySelector(`[data-message-id="${message._id}"]`);
      if (!existing) {
        appendMessage(message);
      }
    }
  });

  state.socket.on("message:seen:update", ({ byUserId }) => {
    if (getPage() !== "chat" || String(byUserId) !== String(state.activeUserId)) return;

    document.querySelectorAll(".message-row.outgoing .message-state").forEach((node) => {
      node.textContent = "Vu";
    });
  });
}

function handleOAuthPayload() {
  const params = new URLSearchParams(window.location.search);
  const oauth = params.get("oauth");

  if (oauth === "failed") {
    showMessage("auth-message", "La connexion OAuth a echoue.", "error");
  }
}

async function initLogin() {
  redirectIfAuthenticated();
  handleOAuthPayload();

  document.getElementById("login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const response = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
      });

      const data = await readResponseData(response);
      if (!response.ok) {
        throw new Error(getResponseMessage(response, data, "Connexion impossible."));
      }

      if (!data?.token || !data?.user) {
        throw new Error(
          "La reponse du serveur est vide ou invalide. Verifie que l'API Express tourne correctement."
        );
      }

      saveAuth(data);
      window.location.href = "inbox.html";
    } catch (error) {
      showMessage("auth-message", error.message, "error");
    }
  });
}

async function initRegister() {
  redirectIfAuthenticated();

  document.getElementById("register-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const response = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: formData.get("username"),
          email: formData.get("email"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword")
        })
      });

      const data = await readResponseData(response);
      if (!response.ok) {
        throw new Error(getResponseMessage(response, data, "Inscription impossible."));
      }

      if (!data?.token || !data?.user) {
        throw new Error(
          "La reponse du serveur est vide ou invalide. Verifie que l'API Express tourne correctement."
        );
      }

      saveAuth(data);
      window.location.href = "inbox.html";
    } catch (error) {
      showMessage("auth-message", error.message, "error");
    }
  });
}

function contactItemTemplate(user, subtitle = "") {
  const unreadCount =
    typeof subtitle === "object" && subtitle !== null ? subtitle.unreadCount || 0 : 0;
  const subtitleText =
    typeof subtitle === "object" && subtitle !== null ? subtitle.text || user.email : subtitle || user.email;

  const item = document.createElement("button");
  item.type = "button";
  item.className = subtitle ? "conversation-item" : "contact-item";
  item.dataset.userId = user._id;
  item.appendChild(createAvatar(user));

  const meta = document.createElement("div");
  meta.className = subtitle ? "conversation-meta" : "contact-meta";

  const title = document.createElement("strong");
  title.textContent = user.username;

  const text = document.createElement("span");
  text.textContent = subtitleText;

  meta.append(title, text);
  item.appendChild(meta);

  if (typeof subtitle === "object" && subtitle !== null) {
    const side = document.createElement("div");
    side.className = "conversation-side";

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = subtitle.time || "";

    const badge = document.createElement("span");
    badge.className = "conversation-badge";
    badge.textContent = unreadCount ? String(unreadCount) : "";

    side.append(time, badge);
    item.appendChild(side);
  }

  item.addEventListener("click", () => {
    window.location.href = `chat.html?user=${user._id}`;
  });

  return item;
}

async function loadInbox(search = "") {
  if (!requireAuth()) return;
  setupSocket();

  const [contactsRes, conversationsRes, unreadRes] = await Promise.all([
    api(`/users/contacts${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    api("/users/conversations"),
    api("/users/unread-count")
  ]);

  const [contactsData, conversationsData, unreadData] = await Promise.all([
    readResponseData(contactsRes),
    readResponseData(conversationsRes),
    readResponseData(unreadRes)
  ]);

  if (!contactsRes.ok) {
    throw new Error(getResponseMessage(contactsRes, contactsData, "Chargement des contacts impossible."));
  }

  if (!conversationsRes.ok) {
    throw new Error(
      getResponseMessage(conversationsRes, conversationsData, "Chargement des conversations impossible.")
    );
  }

  if (!unreadRes.ok) {
    throw new Error(getResponseMessage(unreadRes, unreadData, "Chargement des messages non lus impossible."));
  }

  const contactList = document.getElementById("contact-list");
  const conversationList = document.getElementById("conversation-list");
  const unreadBadge = document.getElementById("global-unread-badge");

  contactList.innerHTML = "";
  conversationList.innerHTML = "";
  if (unreadBadge) {
    unreadBadge.textContent = unreadData.unreadCount ? `${unreadData.unreadCount} non lus` : "";
  }

  contactsData.users.forEach((user) => {
    contactList.appendChild(contactItemTemplate(user));
  });

  conversationsData.conversations.forEach((conversation) => {
    conversationList.appendChild(
      contactItemTemplate(
        conversation.user,
        {
          text: conversation.lastMessage,
          time: formatDateTime(conversation.lastMessageAt),
          unreadCount: conversation.unreadCount
        }
      )
    );
  });

  if (!conversationList.children.length) {
    conversationList.innerHTML = '<p class="message-box">Aucune conversation pour le moment.</p>';
  }

  if (!contactList.children.length) {
    contactList.innerHTML = '<p class="message-box">Aucun contact correspondant.</p>';
  }
}

async function initInbox() {
  if (!requireAuth()) return;

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }

  try {
    await loadInbox();
  } catch (error) {
    const conversationList = document.getElementById("conversation-list");
    const contactList = document.getElementById("contact-list");

    if (conversationList) {
      conversationList.innerHTML = `<p class="message-box is-error">${error.message}</p>`;
    }

    if (contactList) {
      contactList.innerHTML = "";
    }
  }

  document.getElementById("contact-search")?.addEventListener("input", async (event) => {
    try {
      await loadInbox(event.target.value);
    } catch (error) {
      const conversationList = document.getElementById("conversation-list");
      if (conversationList) {
        conversationList.innerHTML = `<p class="message-box is-error">${error.message}</p>`;
      }
    }
  });
}

function appendMessage(message) {
  const list = document.getElementById("message-list");
  if (!list) return;

  const currentUserId = state.auth.user._id;
  const row = document.createElement("div");
  row.className = `message-row ${String(message.senderId) === String(currentUserId) ? "outgoing" : "incoming"}`;
  if (message._id) {
    row.dataset.messageId = message._id;
  }

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  const content = document.createElement("div");
  if (message.message) {
    content.textContent = message.message;
  }

  const time = document.createElement("span");
  time.className = "message-time";
  time.textContent = formatTime(message.createdAt);

  if (message.imageUrl) {
    const image = document.createElement("img");
    image.className = "message-image";
    image.src = message.imageUrl;
    image.alt = "Image envoyee";
    bubble.appendChild(image);
  }

  const isOutgoing = String(message.senderId) === String(currentUserId);
  const stateLabel = document.createElement("div");
  stateLabel.className = "message-state";
  stateLabel.textContent = isOutgoing ? (message.isSeen ? "Vu" : "Envoye") : "";

  if (message.message) {
    bubble.appendChild(content);
  }
  bubble.append(time, stateLabel);
  row.appendChild(bubble);

  list.appendChild(row);
  list.scrollTop = list.scrollHeight;
}

async function initChat() {
  if (!requireAuth()) return;
  setupSocket();

  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user");

  if (!userId) {
    window.location.href = "inbox.html";
    return;
  }

  state.activeUserId = userId;
  state.socket.emit("join:conversation", { partnerId: userId });
  state.socket.emit("message:seen", { senderId: userId });

  const response = await api(`/messages/${userId}`);
  const data = await readResponseData(response);

  if (!response.ok) {
    window.location.href = "inbox.html";
    return;
  }

  renderChatUser(data.recipient);
  state.currentChatUser = data.recipient;
  document.getElementById("message-list").innerHTML = "";
  data.messages.forEach(appendMessage);

  const form = document.getElementById("message-form");
  const input = document.getElementById("message-input");
  const imageInput = document.getElementById("message-image");

  input.addEventListener("input", () => {
    state.socket.emit("typing:start", { receiverId: userId });
    clearTimeout(state.typingTimeout);
    state.typingTimeout = setTimeout(() => {
      state.socket.emit("typing:stop", { receiverId: userId });
    }, 700);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = input.value.trim();
    const imageFile = imageInput.files[0];

    if (!value && !imageFile) return;

    const formData = new FormData();
    formData.append("receiverId", userId);
    if (value) {
      formData.append("message", value);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const sendResponse = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.auth.token}`
        },
        body: formData
      });

      const sendData = await readResponseData(sendResponse);
      if (!sendResponse.ok) {
        throw new Error(getResponseMessage(sendResponse, sendData, "Envoi du message impossible."));
      }

      if (!sendData?.message) {
        throw new Error("La reponse du serveur est vide ou invalide.");
      }

      appendMessage(sendData.message);
      if (state.socket) {
        state.socket.emit("message:send", {
          receiverId: userId,
          message: sendData.message.message,
          imageUrl: sendData.message.imageUrl,
          messageId: sendData.message._id,
          createdAt: sendData.message.createdAt
        });
      }
    } catch (error) {
      showMessage("typing-indicator", error.message, "error");
      return;
    }

    showMessage("typing-indicator", "", "");
    input.value = "";
    imageInput.value = "";
    state.socket.emit("typing:stop", { receiverId: userId });
  });
}

function renderChatUser(user) {
  const header = document.getElementById("chat-header-user");
  const card = document.getElementById("chat-contact-card");
  header.innerHTML = "";
  card.innerHTML = "";

  const headerMeta = document.createElement("div");
  const headerName = document.createElement("strong");
  headerName.textContent = user.username;
  const headerEmail = document.createElement("div");
  headerEmail.textContent = user.email;
  headerMeta.append(headerName, headerEmail);

  header.append(createAvatar(user), headerMeta);

  const cardMeta = document.createElement("div");
  const cardName = document.createElement("strong");
  cardName.textContent = user.username;
  const cardStatus = document.createElement("div");
  cardStatus.textContent = user.isOnline ? "En ligne" : "Hors ligne";
  cardMeta.append(cardName, cardStatus);

  card.append(createAvatar(user), cardMeta);
}

async function initProfile() {
  if (!requireAuth()) return;

  const response = await api("/users/me");
  const data = await readResponseData(response);

  if (!response.ok) {
    clearAuth();
    window.location.href = "login.html";
    return;
  }

  const user = data.user;
  document.getElementById("profile-username").value = user.username;
  document.getElementById("profile-email").value = user.email;
  document.getElementById("profile-avatar").value = user.avatar || "";
  renderProfilePreview(user);

  document.getElementById("profile-avatar").addEventListener("input", () => {
    renderProfilePreview({
      ...user,
      username: document.getElementById("profile-username").value,
      avatar: document.getElementById("profile-avatar").value
    });
  });

  document.getElementById("profile-username").addEventListener("input", () => {
    renderProfilePreview({
      ...user,
      username: document.getElementById("profile-username").value,
      avatar: document.getElementById("profile-avatar").value
    });
  });

  document.getElementById("profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const saveResponse = await api("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          username: document.getElementById("profile-username").value,
          avatar: document.getElementById("profile-avatar").value
        })
      });

      const saveData = await readResponseData(saveResponse);
      if (!saveResponse.ok) {
        throw new Error(getResponseMessage(saveResponse, saveData, "Mise a jour du profil impossible."));
      }

      saveAuth({
        ...state.auth,
        user: saveData.user
      });
      showMessage("profile-message", saveData.message, "success");
      renderProfilePreview(saveData.user);
    } catch (error) {
      showMessage("profile-message", error.message, "error");
    }
  });

  document.getElementById("profile-avatar-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const uploadResponse = await fetch(`${API_BASE}/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.auth.token}`
        },
        body: formData
      });
      const uploadData = await readResponseData(uploadResponse);

      if (!uploadResponse.ok) {
        throw new Error(getResponseMessage(uploadResponse, uploadData, "Import de l'avatar impossible."));
      }

      document.getElementById("profile-avatar").value = uploadData.avatar;
      renderProfilePreview({
        ...state.auth.user,
        avatar: uploadData.avatar,
        username: document.getElementById("profile-username").value
      });
      showMessage("profile-message", "Avatar importe avec succes.", "success");
    } catch (error) {
      showMessage("profile-message", error.message, "error");
    }
  });

  document.getElementById("logout-button").addEventListener("click", () => {
    clearAuth();
    if (state.socket) {
      state.socket.disconnect();
    }
    window.location.href = "login.html";
  });
}

function renderProfilePreview(user) {
  const preview = document.getElementById("profile-preview");
  preview.innerHTML = "";

  const image = document.createElement("img");
  image.src = normalizeAvatar(user);
  image.alt = user.username;

  const meta = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = user.username;
  const email = document.createElement("div");
  email.textContent = user.email || "";

  meta.append(name, email);
  preview.append(image, meta);
}

async function bootstrap() {
  const page = getPage();

  if (page === "login") await initLogin();
  if (page === "register") await initRegister();
  if (page === "inbox") await initInbox();
  if (page === "chat") await initChat();
  if (page === "profile") await initProfile();
}

bootstrap();
