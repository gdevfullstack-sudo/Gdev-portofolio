# TODO.md - Fix Bug Responsivité Mobile (Navbar Overflow)

## Plan Approuvé ✅ - Fix Navbar Mobile
**Statut**: 🚀 En cours

### Étape 1: [✅] Corriger Navbar Width/Padding (index.html)
- Width: `w-full max-w-[95vw] sm:w-[90%] sm:max-w-4xl`
- Padding: `px-2 sm:px-4` + `overflow-hidden`

### Étape 2: [✅] Media Query CSS (style.css)
- `@media (max-width: 360px)`: Safe-area + padding 0.5rem

### Étape 3: [⏳] Test & Validation
- ✅ Local: `start index.html`
- DevTools: 320px/360px OK
- Phone test: À vérifier

**Objectif**: Éliminer scroll horizontal navbar <360px.

*Progress sera updaté après chaque étape.*

