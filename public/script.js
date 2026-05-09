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
    return "API introuvable. Ouvre l'application via le serveur Express sur http://localhost:5000.";
  }

  if (response.status >= 500) {
    return fallbackMessage || `Erreur serveur (${response.status}). Regarde aussi la console du backend.`;
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

async function checkOAuthStatus() {
  try {
    const response = await api("/auth/status");
    const data = await readResponseData(response);
    const googleBtn = document.getElementById("google-oauth-btn");
    if (googleBtn && data && !data.google) {
      googleBtn.style.display = "none";
    }
  } catch (error) {
    console.warn("Impossible de verifier le statut OAuth:", error);
  }
}

function handleOAuthPayload() {
  const params = new URLSearchParams(window.location.search);
  const oauth = params.get("oauth");

  if (oauth === "failed") {
    showMessage(
      "auth-message",
      "La connexion OAuth a echoue. Verifiez que les identifiants Google sont bien configures cote serveur (fichier .env).",
      "error"
    );
  }
}

async function initLogin() {
  redirectIfAuthenticated();
  handleOAuthPayload();
  await checkOAuthStatus();

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
      showMessage(
        "auth-message",
        error.message === "Failed to fetch"
          ? "Impossible de joindre l'API. Verifie que le serveur Express tourne sur http://localhost:5000."
          : error.message,
        "error"
      );
    }
  });
}

async function initRegister() {
  redirectIfAuthenticated();
  await checkOAuthStatus();

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
      showMessage(
        "auth-message",
        error.message === "Failed to fetch"
          ? "Impossible de joindre l'API. Verifie que le serveur Express tourne sur http://localhost:5000."
          : error.message,
        "error"
      );
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

function getMessagePreviewLabel(message) {
  if (message.videoUrl) {
    return message.message || "Video envoyee";
  }

  if (message.imageUrl) {
    return message.message || "Photo envoyee";
  }

  return message.message || "";
}

async function loadInbox() {
  if (!requireAuth()) return;
  setupSocket();

  const [conversationsRes, unreadRes] = await Promise.all([
    api("/users/conversations"),
    api("/users/unread-count")
  ]);

  const [conversationsData, unreadData] = await Promise.all([
    readResponseData(conversationsRes),
    readResponseData(unreadRes)
  ]);

  if (!conversationsRes.ok) {
    throw new Error(
      getResponseMessage(conversationsRes, conversationsData, "Chargement des conversations impossible.")
    );
  }

  if (!unreadRes.ok) {
    throw new Error(getResponseMessage(unreadRes, unreadData, "Chargement des messages non lus impossible."));
  }

  const conversationList = document.getElementById("conversation-list");
  const unreadBadge = document.getElementById("global-unread-badge");

  if (conversationList) conversationList.innerHTML = "";
  if (unreadBadge) {
    unreadBadge.textContent = unreadData.unreadCount ? String(unreadData.unreadCount) : "";
  }

  conversationsData.conversations.forEach((conversation) => {
    if (conversationList) conversationList.appendChild(
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

  if (conversationList && !conversationList.children.length) {
    conversationList.innerHTML = '<p class="message-box">Aucune conversation pour le moment.</p>';
  }
}

async function searchContact(studentId) {
  const contactList = document.getElementById("contact-list");
  if (!contactList) return;
  contactList.innerHTML = '<p class="message-box">Recherche en cours...</p>';

  try {
    const res = await api(`/users/contacts?search=${encodeURIComponent(studentId)}`);
    const data = await readResponseData(res);
    
    contactList.innerHTML = "";
    if (!res.ok) throw new Error(getResponseMessage(res, data, "Erreur de recherche."));

    if (data.users && data.users.length > 0) {
      data.users.forEach(user => {
        contactList.appendChild(contactItemTemplate(user));
      });
    } else {
      contactList.innerHTML = '<p class="message-box is-error">Identifiant introuvable.</p>';
    }
  } catch(error) {
    contactList.innerHTML = `<p class="message-box is-error">${error.message}</p>`;
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

  const searchForm = document.getElementById("contact-search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("contact-search-input");
      if (input && input.value.trim()) {
        searchContact(input.value.trim());
      }
    });
  }
}

async function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', quality);
      };
    };
  });
}

function appendMessage(message, isSending = false) {
  const list = document.getElementById("message-list");
  if (!list) return;

  const existing = document.querySelector(`[data-message-id="${message._id}"]`) || 
                   (message._tempId ? document.querySelector(`[data-message-id="${message._tempId}"]`) : null);
  if (existing) {
    existing.remove();
  }

  const currentUserId = state.auth.user._id;
  const row = document.createElement("div");
  row.className = `message-row ${String(message.senderId) === String(currentUserId) ? "outgoing" : "incoming"}`;
  if (message._id) {
    row.dataset.messageId = message._id;
  }

  if (String(message.senderId) !== String(currentUserId) && state.currentChatUser) {
    const avatar = createAvatar(state.currentChatUser);
    avatar.classList.add("message-avatar");
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isSending ? 'sending' : ''}`;

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

  if (message.videoUrl) {
    const video = document.createElement("video");
    video.className = "message-video";
    video.src = message.videoUrl;
    video.controls = true;
    video.preload = "metadata";
    bubble.appendChild(video);
  }

  const isOutgoing = String(message.senderId) === String(currentUserId);
  const stateLabel = document.createElement("div");
  stateLabel.className = `message-state ${isSending ? 'sending' : ''}`;
  stateLabel.textContent = isOutgoing ? (isSending ? "Envoi en cours..." : (message.isSeen ? "Vu" : "Envoye")) : "";

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
  const mediaInput = document.getElementById("message-media");

  const emojiBtn = document.getElementById("emoji-btn");
  const emojiContainer = document.getElementById("emoji-picker-container");
  const picker = document.querySelector("emoji-picker");

  if (emojiBtn && emojiContainer && picker) {
    emojiBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      emojiContainer.classList.toggle("hidden");
    });

    picker.addEventListener("emoji-click", (event) => {
      const emoji = event.detail.unicode;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.substring(0, start) + emoji + input.value.substring(end);
      input.selectionStart = input.selectionEnd = start + emoji.length;
      input.focus();
    });

    document.addEventListener("click", (e) => {
      if (!emojiContainer.contains(e.target) && !emojiBtn.contains(e.target)) {
        emojiContainer.classList.add("hidden");
      }
    });
  }

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
    let mediaFile = mediaInput.files[0];

    if (!value && !mediaFile) return;

    input.value = "";
    mediaInput.value = "";
    showMessage("typing-indicator", "", "");
    state.socket.emit("typing:stop", { receiverId: userId });

    const tempId = 'temp-' + Date.now();
    let tempImageUrl = "";
    let tempVideoUrl = "";
    
    if (mediaFile) {
      if (mediaFile.type.startsWith('image/')) {
        tempImageUrl = URL.createObjectURL(mediaFile);
        mediaFile = await compressImage(mediaFile);
      }
      if (mediaFile.type.startsWith('video/')) {
        tempVideoUrl = URL.createObjectURL(mediaFile);
      }
    }

    appendMessage({
      _id: tempId,
      senderId: state.auth.user._id,
      receiverId: userId,
      message: value,
      imageUrl: tempImageUrl,
      videoUrl: tempVideoUrl,
      createdAt: new Date().toISOString(),
      isSeen: false
    }, true);

    const formData = new FormData();
    formData.append("receiverId", userId);
    if (value) {
      formData.append("message", value);
    }
    if (mediaFile) {
      formData.append("media", mediaFile);
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

      sendData.message._tempId = tempId;
      appendMessage(sendData.message, false);
      
      if (state.socket) {
        state.socket.emit("message:send", {
          receiverId: userId,
          messageId: sendData.message._id
        });
      }
    } catch (error) {
      const row = document.querySelector(`[data-message-id="${tempId}"]`);
      if (row) row.remove();
      showMessage("typing-indicator", error.message, "error");
    }
  });
}

function renderChatUser(user) {
  const header = document.getElementById("chat-header-user");
  const card = document.getElementById("chat-contact-card");
  header.innerHTML = "";
  card.innerHTML = "";

  const headerMeta = document.createElement("div");
  headerMeta.className = "chat-header__identity";
  const headerName = document.createElement("strong");
  headerName.textContent = user.username;
  const headerEmail = document.createElement("div");
  headerEmail.textContent = "Identite verifiee - canal securise";
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

  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user");
  const isOwnProfile = !userId || String(userId) === String(state.auth.user._id);

  try {
    let user;
    if (isOwnProfile) {
      const response = await api("/users/me");
      const data = await readResponseData(response);
      if (!response.ok) {
        clearAuth();
        window.location.href = "login.html";
        return;
      }
      user = data.user;
    } else {
      const response = await api(`/users/${userId}`);
      const data = await readResponseData(response);
      if (!response.ok) {
        window.location.href = "inbox.html";
        return;
      }
      user = data.user;
    }

    document.getElementById("profile-username-display").textContent = user.username;
    document.getElementById("profile-email-display").textContent = user.email;
    
    const studentIdDisplay = document.getElementById("profile-studentid-display");
    if (studentIdDisplay) {
      studentIdDisplay.textContent = `ID: ${user.studentId || "N/A"}`;
    }

    document.getElementById("profile-avatar-display").src = normalizeAvatar(user);
    document.getElementById("profile-avatar-display").alt = user.username;

    const statusDot = document.getElementById("profile-status-dot");
    if (statusDot) {
      statusDot.className = `status-dot ${user.isOnline ? 'online' : ''}`;
    }

    const statusBadge = document.getElementById("profile-status-badge");
    if (statusBadge) {
      statusBadge.textContent = user.isOnline ? "En ligne" : "Hors ligne";
    }

    const infoText = document.getElementById("profile-info-text");
    if (infoText) {
      infoText.textContent = isOwnProfile 
        ? "Ceci est votre profil. Vous pouvez modifier vos informations ci-dessous."
        : `Profil de ${user.username}. Vous pouvez lui envoyer un message.`;
    }

    const chatLink = document.getElementById("profile-chat-link");
    if (chatLink) {
      if (isOwnProfile) {
        chatLink.href = "inbox.html";
        chatLink.innerHTML = '<span class="material-symbols-outlined text-sm">chat</span>Voir mes messages';
      } else {
        chatLink.href = `chat.html?user=${user._id}`;
        chatLink.innerHTML = '<span class="material-symbols-outlined text-sm">chat</span>Envoyer un message';
      }
    }

    const shareLinkBtn = document.getElementById("profile-share-link");
    if (shareLinkBtn) {
      if (isOwnProfile) {
        shareLinkBtn.classList.add("hidden");
      } else {
        shareLinkBtn.classList.remove("hidden");
        shareLinkBtn.addEventListener("click", () => {
          const link = `${window.location.origin}/chat.html?user=${user._id}`;
          navigator.clipboard.writeText(link).then(() => {
            const msg = document.getElementById("profile-message");
            if (msg) {
              msg.textContent = "Lien copié dans le presse-papier !";
              msg.className = "message-box is-success mt-6";
              setTimeout(() => {
                msg.textContent = "";
                msg.className = "message-box mt-6";
              }, 3000);
            }
          });
        });
      }
    }

    const topAvatar = document.getElementById("current-user-avatar-top");
    if (topAvatar) {
      topAvatar.src = normalizeAvatar(state.auth.user);
    }

    if (isOwnProfile) {
      const editSection = document.getElementById("profile-edit-section");
      if (editSection) editSection.classList.remove("hidden");

      document.getElementById("profile-username").value = user.username;
      document.getElementById("profile-email").value = user.email;
      document.getElementById("profile-avatar").value = user.avatar || "";

      document.getElementById("profile-form")?.addEventListener("submit", async (event) => {
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
          document.getElementById("profile-username-display").textContent = saveData.user.username;
          document.getElementById("profile-avatar-display").src = normalizeAvatar(saveData.user);
          if (topAvatar) topAvatar.src = normalizeAvatar(saveData.user);
        } catch (error) {
          showMessage("profile-message", error.message, "error");
        }
      });

      document.getElementById("profile-avatar-file")?.addEventListener("change", async (event) => {
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
          document.getElementById("profile-avatar-display").src = normalizeAvatar(uploadData.user);
          if (topAvatar) topAvatar.src = normalizeAvatar(uploadData.user);
          showMessage("profile-message", "Avatar importe avec succes.", "success");
        } catch (error) {
          showMessage("profile-message", error.message, "error");
        }
      });

      document.getElementById("logout-button")?.addEventListener("click", () => {
        clearAuth();
        if (state.socket) {
          state.socket.disconnect();
        }
        window.location.href = "login.html";
      });
    } else {
      const readonlySection = document.getElementById("profile-readonly-section");
      if (readonlySection) readonlySection.classList.remove("hidden");

      const createdAt = document.getElementById("profile-created-at");
      if (createdAt && user.createdAt) {
        createdAt.textContent = new Date(user.createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });
      }

      const onlineStatus = document.getElementById("profile-online-status");
      if (onlineStatus) {
        onlineStatus.textContent = user.isOnline ? "En ligne" : "Hors ligne";
      }

      const provider = document.getElementById("profile-provider");
      if (provider) {
        const providers = { local: "Email/Mot de passe", google: "Google", apple: "Apple" };
        provider.textContent = providers[user.provider] || user.provider;
      }

      const studentId =
        document.getElementById("profile-student-id") ||
        document.getElementById("profile-student-id-bottom");
      if (studentId) {
        studentId.textContent = user.studentId || "Non attribué";
      }
    }
  } catch (error) {
    console.error("Profile error:", error);
    window.location.href = "inbox.html";
  }
}

function renderProfilePreview(user) {
  const preview = document.getElementById("profile-preview");
  if (!preview) return;
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
