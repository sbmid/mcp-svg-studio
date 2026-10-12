#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import * as icons from "simple-icons";
import * as lucideIcons from "lucide-static";

// ----------------------------------------------------
// 1. BRAND ICONS (Simple Icons) Setup
// ----------------------------------------------------

interface SimpleIcon {
  slug: string;
  title: string;
  path: string;
  hex: string;
}

function isSimpleIcon(item: unknown): item is SimpleIcon {
  return (
    item !== null &&
    typeof item === "object" &&
    "slug" in item &&
    "path" in item
  );
}

function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\+/g, "plus")
    .replace(/\./g, "dot")
    .replace(/[^a-z0-9]/g, "");
}

const brandIconList = (Object.values(icons) as unknown[]).filter(isSimpleIcon);

// ----------------------------------------------------
// 2. UI ICONS (Lucide Icons) Setup
// ----------------------------------------------------

const lucideMap = new Map<string, { name: string; svg: string }>();

for (const [exportName, svgContent] of Object.entries(lucideIcons)) {
  if (typeof svgContent === "string" && svgContent.startsWith("<svg")) {
    const kebab = exportName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    const clean = exportName.toLowerCase();
    lucideMap.set(kebab, { name: kebab, svg: svgContent });
    lucideMap.set(clean, { name: kebab, svg: svgContent });
  }
}

// ----------------------------------------------------
// 3. MCP SERVER INITIALIZATION
// ----------------------------------------------------

const server = new McpServer({
  name: "mcp-svg-studio",
  version: "1.0.0",
});

// TOOL 1: get_brand_svg (Simple Icons)
server.registerTool(
  "get_brand_svg",
  {
    description:
      "Ambil kode raw SVG resmi, presisi, dan pixel-perfect untuk brand, aplikasi, bahasa pemrograman, atau platform teknologi (misal: Google, Starbucks, React, GitHub, Tailwind, PostgreSQL). Gunakan tool ini daripada mengarang path koordinat SVG sendiri.",
    inputSchema: z.object({
      brand_name: z
        .string()
        .describe(
          "Nama brand atau entitas teknologi (contoh: 'starbucks', 'google', 'react', 'nextdotjs', 'github')"
        ),
      color: z
        .string()
        .optional()
        .describe(
          "Warna fill SVG dalam hex (contoh: '#006241') atau 'currentColor'. Jika tidak diisi, gunakan warna default resmi brand."
        ),
      size: z
        .number()
        .optional()
        .describe("Dimensi width dan height dalam satuan px (default: 24)."),
    }),
  },
  async ({ brand_name, color, size }) => {
    const finalSize = size ?? 24;
    const rawQuery = brand_name.trim().toLowerCase();
    const normalizedQuery = normalizeSlug(brand_name);

    const matchedIcon = brandIconList.find((item) => {
      return (
        item.slug.toLowerCase() === rawQuery ||
        item.title.toLowerCase() === rawQuery ||
        normalizeSlug(item.title) === normalizedQuery ||
        normalizeSlug(item.slug) === normalizedQuery
      );
    });

    if (!matchedIcon) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "not_found",
              message: `Logo brand untuk '${brand_name}' tidak ditemukan. Sumber data: Simple Icons (simpleicons.org) dengan 3.000+ logo brand. Jika Anda mencari ikon UI generik (misal: search, user, settings, bell), gunakan tool 'get_ui_icon'.`,
            }),
          },
        ],
        isError: true,
      };
    }

    const fillColor = color ?? `#${matchedIcon.hex}`;
    const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${finalSize}" height="${finalSize}" viewBox="0 0 24 24" fill="${fillColor}"><path d="${matchedIcon.path}"/></svg>`;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            status: "success",
            brand: matchedIcon.title,
            hex: `#${matchedIcon.hex}`,
            svg: finalSvg,
          }),
        },
      ],
    };
  }
);

// TOOL 2: get_ui_icon (Lucide Icons)
server.registerTool(
  "get_ui_icon",
  {
    description:
      "Ambil kode raw SVG resmi untuk ikon UI modern (Lucide Icons) seperti search, user, settings, bell, chevron, check, trash, edit, mail, camera, globe, house, dll. Gunakan tool ini daripada mengarang komponen ikon UI sendiri.",
    inputSchema: z.object({
      icon_name: z
        .string()
        .describe(
          "Nama ikon UI (contoh: 'search', 'user', 'settings', 'bell', 'chevron-right', 'check', 'trash', 'mail')"
        ),
      color: z
        .string()
        .optional()
        .describe(
          "Warna stroke SVG (contoh: '#10b981', 'red', 'currentColor'). Default: 'currentColor'."
        ),
      size: z
        .number()
        .optional()
        .describe("Dimensi width dan height dalam satuan px (default: 24)."),
      stroke_width: z
        .number()
        .optional()
        .describe("Ketebalan garis stroke SVG (default: 2)."),
    }),
  },
  async ({ icon_name, color, size, stroke_width }) => {
    const finalSize = size ?? 24;
    const finalColor = color ?? "currentColor";
    const finalStrokeWidth = stroke_width ?? 2;

    const queryKey = icon_name.trim().toLowerCase().replace(/_/g, "-");
    const matched = lucideMap.get(queryKey) || lucideMap.get(queryKey.replace(/-/g, ""));

    if (!matched) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "not_found",
              message: `Ikon UI '${icon_name}' tidak ditemukan di katalog Lucide Icons (lucide.dev). Coba cari dengan nama baku seperti 'search', 'user', 'settings', 'bell', 'check', 'x', 'trash-2', dll.`,
            }),
          },
        ],
        isError: true,
      };
    }

    let modifiedSvg = matched.svg
      .replace(/width="24"/, `width="${finalSize}"`)
      .replace(/height="24"/, `height="${finalSize}"`)
      .replace(/stroke="currentColor"/, `stroke="${finalColor}"`)
      .replace(/stroke-width="2"/, `stroke-width="${finalStrokeWidth}"`);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            status: "success",
            icon: matched.name,
            provider: "Lucide Icons",
            svg: modifiedSvg,
          }),
        },
      ],
    };
  }
);

// Jalankan Transport Stdio
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error("Fatal error running MCP Server:", error);
  process.exit(1);
});
