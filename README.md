# mcp-svg-studio

> **Universal MCP Server** penyedia **3.000+ Logo Brand Resmi** (Simple Icons) & **1.500+ UI Icons Modern** (Lucide Icons) untuk AI Coding Assistant (Claude Desktop, Cursor IDE, Windsurf, VS Code).

---

## 🚀 Fitur Utama

- **3.000+ Brand Logo Resmi** (Simple Icons): Google, React, GitHub, Tailwind, PostgreSQL, Docker, Starbucks, dll.
- **1.500+ UI Icons Modern** (Lucide Icons): search, user, settings, bell, chevron, check, trash, mail, dll.
- **100% Offline & Lokal**: Bebas latensi jaringan.
- **Tool Terpisah & Presisi**:
  - `get_brand_svg`: Ambil logo brand resmi (fill-based).
  - `get_ui_icon`: Ambil ikon UI generik (stroke-based).
- **Customizable**: Dukungan atribut `color`, `size`, dan `stroke_width`.

---

## 📦 Instalasi Global

```bash
npm install -g mcp-svg-studio
```

---

## ⚙️ Konfigurasi MCP Client

### 1. Claude Desktop
Tambahkan ke file `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "svg-studio": {
      "command": "mcp-svg-studio"
    }
  }
}
```

### 2. Cursor IDE
Buka **Settings** → **Features** → **MCP**, klik **Add New MCP Server**:
- **Name**: `svg-studio`
- **Type**: `command`
- **Command**: `mcp-svg-studio`

---

## 🛠️ Tools Available

### 1. `get_brand_svg`
```typescript
{
  brand_name: "github", // Wajib: 'react', 'google', 'tailwind', dll
  color: "#181717",     // Opsional: Hex warna atau 'currentColor'
  size: 24              // Opsional: Dimensi px
}
```

### 2. `get_ui_icon`
```typescript
{
  icon_name: "search",  // Wajib: 'user', 'settings', 'bell', 'check', dll
  color: "#10b981",     // Opsional: Hex/CSS stroke color
  size: 24,             // Opsional: Dimensi px
  stroke_width: 2       // Opsional: Ketebalan garis
}
```

---

## 📄 Lisensi

MIT License © 2026.
