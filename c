<!DOCTYPE html>
<html class="light" lang="fr">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ESTIM - Profil</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="style.css"/>
<link rel="stylesheet" href="style.css"/>
<link rel="stylesheet" href="style.css"/>
<link rel="stylesheet" href="style.css"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "primary": "#705d00",
                    "on-error": "#ffffff",
                    "inverse-primary": "#e9c400",
                    "surface-container-low": "#f3f3f8",
                    "surface-container": "#ededf2",
                    "surface-bright": "#f9f9fe",
                    "on-secondary-container": "#646464",
                    "primary-fixed-dim": "#e9c400",
                    "on-primary-fixed-variant": "#544600",
                    "error": "#ba1a1a",
                    "outline": "#7e775f",
                    "surface-dim": "#d9dade",
                    "surface-variant": "#e2e2e7",
                    "tertiary-fixed-dim": "#00dbe8",
                    "secondary-container": "#e2e2e2",
                    "on-secondary-fixed": "#1b1b1b",
                    "background": "#f9f9fe",
                    "on-tertiary": "#ffffff",
                    "on-secondary": "#ffffff",
                    "secondary-fixed": "#e2e2e2",
                    "surface-container-high": "#e8e8ed",
                    "secondary": "#5e5e5e",
                    "surface-container-lowest": "#ffffff",
                    "on-primary-container": "#705e00",
                    "on-surface": "#1a1c1f",
                    "primary-container": "#ffd700",
                    "on-error-container": "#93000a",
                    "on-primary-fixed": "#221b00",
                    "inverse-surface": "#2e3034",
                    "on-surface-variant": "#4d4732",
                    "secondary-fixed-dim": "#c6c6c6",
                    "inverse-on-surface": "#f0f0f5",
                    "primary-fixed": "#ffe16d",
                    "tertiary-container": "#00f1ff",
                    "tertiary": "#00696f",
                    "outline-variant": "#d0c6ab",
                    "surface-tint": "#705d00",
                    "on-tertiary-fixed-variant": "#004f54",
                    "on-background": "#1a1c1f",
                    "on-secondary-fixed-variant": "#474747",
                    "surface-container-highest": "#e2e2e7",
                    "tertiary-fixed": "#79f5ff",
                    "error-container": "#ffdad6",
                    "surface": "#f9f9fe",
                    "on-tertiary-container": "#006a70",
                    "on-tertiary-fixed": "#002022",
                    "on-primary": "#ffffff"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "xs": "8px",
                    "lg": "24px",
                    "xl": "32px",
                    "md": "16px",
                    "base": "4px",
                    "margin-page": "20px",
                    "gutter-list": "1px",
                    "sm": "12px"
            },
            "fontFamily": {
                    "body-lg": ["Inter"],
                    "headline-lg": ["Inter"],
                    "body-sm": ["Inter"],
                    "label-bold": ["Inter"],
                    "display": ["Inter"],
                    "label-sm": ["Inter"],
                    "headline-md": ["Inter"]
            },
            "fontSize": {
                    "body-lg": ["15px", {"lineHeight": "1.5", "fontWeight": "400"}],
                    "headline-lg": ["24px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "700"}],
                    "body-sm": ["14px", {"lineHeight": "1.4", "fontWeight": "400"}],
                    "label-bold": ["12px", {"lineHeight": "1.0", "fontWeight": "600"}],
                    "display": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                    "label-sm": ["12px", {"lineHeight": "1.0", "fontWeight": "400"}],
                    "headline-md": ["17px", {"lineHeight": "1.4", "fontWeight": "600"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body { font-family: 'Inter', sans-serif; }
        @media (max-width: 980px) {
            .sidebar-nav { display: none; }
        }
    </style>
</head>
<body class="bg-background text-on-background" data-page="profile">
<!-- TopAppBar -->
<header class="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b border-zinc-100 flex items-center justify-between px-6 w-full">
<div class="flex items-center gap-4">
<span class="text-2xl font-black tracking-tighter text-black">ESTIM</span>
</div>
<div class="flex items-center gap-4">
<button class="p-2 hover:bg-zinc-50 rounded-full transition-all">
<span class="material-symbols-outlined text-zinc-500">notifications</span>
</button>
<button class="p-2 hover:bg-zinc-50 rounded-full transition-all">
<span class="material-symbols-outlined text-zinc-500">help</span>
</button>
<img alt="Profil" class="w-8 h-8 rounded-full border border-zinc-200" id="current-user-avatar-top" src="https://ui-avatars.com/api/?name=User&background=FFD700&color=0f0f0f"/>
</div>
</header>
<div class="flex h-screen pt-16 overflow-hidden">
<!-- SideNavBar -->
<aside class="sidebar-nav hidden md:flex flex-col gap-1 w-64 h-full fixed left-0 top-0 pt-20 border-r border-zinc-100 bg-white text-sm font-medium">
<div class="px-6 mb-8">
<div class="flex items-center gap-3 mb-1">
<div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-lg">E</div>
<div>
<h2 class="text-xl font-bold text-black leading-tight">ESTIM Chat</h2>
<p class="text-zinc-500 text-[10px] uppercase tracking-wider">Messagerie</p>
</div>
</div>
<nav class="flex-grow space-y-1">
<a href="inbox.html" class="flex items-center gap-3 px-4 py-3 text-zinc-600 hover:bg-zinc-50 rounded-lg mx-2 cursor-pointer transition-colors no-underline">
<span class="material-symbols-outlined">chat</span>
<span>Messages</span>
</a>
<a href="profile.html" class="flex items-center gap-3 px-4 py-3 bg-yellow-400 text-black rounded-lg mx-2 cursor-pointer transition-colors no-underline">
<span class="material-symbols-outlined">person</span>
<span>Profil</span>
</a>
</nav>
<div class="p-4">
<a href="inbox.html" class="w-full py-3 bg-yellow-400 text-black font-bold rounded-full flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors no-underline">
<span class="material-symbols-outlined">add</span>
Nouveau message
</a>
</div>
</aside>
<!-- Main Content -->
<main class="ml-0 md:ml-64 flex-1 p-8 bg-surface-bright overflow-y-auto">
<div class="max-w-6xl mx-auto">
<!-- Profile Header Card -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
<div class="md:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-zinc-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
<div class="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16"></div>
<div class="relative">
<img id="profile-avatar-display" alt="Avatar" class="w-32 h-32 rounded-full border-4 border-yellow-400 object-cover" src="https://ui-avatars.com/api/?name=User&background=FFD700&color=0f0f0f"/>
<div id="profile-status-dot" class="absolute bottom-1 right-1 w-6 h-6 bg-gray-400 border-2 border-white rounded-full"></div>
<div class="flex-1 text-center md:text-left">
<h1 id="profile-username-display" class="font-display text-display text-on-surface mb-1">...</h1>
<p id="profile-email-display" class="font-headline-md text-secondary mb-4">...</p>
<div class="flex flex-wrap gap-2 justify-center md:justify-start">
<span id="profile-status-badge" class="px-3 py-1 bg-surface-container rounded-full text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">Chargement...</span>
</div>
</div>
<div class="md:col-span-4 bg-primary-container p-8 rounded-xl flex flex-col justify-between relative overflow-hidden">
<div class="z-10">
<h3 class="font-headline-md text-on-primary-container mb-2">Informations</h3>
<p id="profile-info-text" class="text-sm text-primary font-medium">Chargement des informations...</p>
</div>
<div class="z-10 mt-6">
<a id="profile-chat-link" href="inbox.html" class="w-full py-3 bg-black text-white rounded-full font-label-bold active:scale-95 transition-transform flex items-center justify-center gap-2 no-underline">
<span class="material-symbols-outlined text-sm">chat</span>
Envoyer un message
</a>
</div>
<span class="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 text-primary">person</span>
</div>
<!-- Editable Section (own profile) -->
<div id="profile-edit-section" class="hidden">
<div class="bg-white p-8 rounded-xl border border-zinc-100 shadow-sm mb-8">
<h3 class="font-headline-lg text-on-surface mb-6">Modifier le profil</h3>
<form id="profile-form" class="space-y-6 max-w-xl">
<div class="space-y-2">
<label class="block font-label-bold text-label-bold text-on-surface">Nom d'utilisateur</label>
<input type="text" id="profile-username" name="username" required class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container outline-none transition-all"/>
</div>
<div class="space-y-2">
<label class="block font-label-bold text-label-bold text-on-surface">Email</label>
<input type="email" id="profile-email" name="email" disabled class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl opacity-60 cursor-not-allowed"/>
</div>
<div class="space-y-2">
<label class="block font-label-bold text-label-bold text-on-surface">URL de la photo</label>
<input type="url" id="profile-avatar" name="avatar" placeholder="https://..." class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container outline-none transition-all"/>
</div>
<div class="space-y-2">
<label class="block font-label-bold text-label-bold text-on-surface">Importer un avatar</label>
<input type="file" id="profile-avatar-file" accept="image/*" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary-container file:text-primary file:font-bold hover:file:brightness-105 transition-all"/>
</div>
<div class="flex gap-4 pt-4">
<button type="submit" class="flex-1 py-3 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-500 transition-colors active:scale-95">Mettre à jour</button>
<button type="button" id="logout-button" class="flex-1 py-3 bg-surface-container text-on-surface font-bold rounded-full hover:bg-surface-container-high transition-colors active:scale-95">Déconnexion</button>
</div>
</form>
<p id="profile-message" class="message-box mt-6 text-center text-sm" aria-live="polite"></p>
</div>
<!-- Read-only Info Section (other profile) -->
<div id="profile-readonly-section" class="hidden">
<div class="bg-white p-8 rounded-xl border border-zinc-100 shadow-sm mb-8">
<h3 class="font-headline-lg text-on-surface mb-6">À propos</h3>
<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
<div class="p-4 bg-surface-container-low rounded-lg">
<p class="text-label-sm text-secondary uppercase tracking-wider mb-1">ID Étudiant</p>
<p id="profile-student-id" class="font-headline-md text-on-surface">...</p>
</div>
<div class="p-4 bg-surface-container-low rounded-lg">
<p class="text-label-sm text-secondary uppercase tracking-wider mb-1">Membre depuis</p>
<p id="profile-created-at" class="font-headline-md text-on-surface">...</p>
</div>
<div class="p-4 bg-surface-container-low rounded-lg">
<p class="text-label-sm text-secondary uppercase tracking-wider mb-1">Statut</p>
<p id="profile-online-status" class="font-headline-md text-on-surface">...</p>
</div>
<div class="p-4 bg-surface-container-low rounded-lg">
<p class="text-label-sm text-secondary uppercase tracking-wider mb-1">Type de compte</p>
<p id="profile-provider" class="font-headline-md text-on-surface">...</p>
</div>
</div>
</div>
</main>
</div>
<script src="/socket.io/socket.io.js"></script>
<script src="script.js"></script>
</body>
</html>
