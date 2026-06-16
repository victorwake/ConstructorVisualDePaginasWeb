# Constructor Visual de Páginas Web

> Clon funcional de Webflow / Framer — editor visual drag & drop con exportación HTML/CSS.

---

## Stack tecnológico recomendado

| Capa       | Tecnología                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | React 18+ · TypeScript · Vite · Tailwind CSS      |
| Estado     | Zustand (árbol de componentes + historial)        |
| DnD        | dnd-kit                                           |
| Backend    | Node.js · Express · Prisma ORM                    |
| BD         | PostgreSQL                                        |
| Auth       | JWT + bcrypt                                      |
| Publicación | AWS S3 / Cloudflare R2 + desplegador automático  |

## ¿Por qué este stack?

- **Zustand**: liviano, sin boilerplate, fácil de serializar el estado completo (árbol JSON + historial).
- **dnd-kit**: framework de drag & drop moderno para React, maneja colisiones, detecta contenedores, reordena listas.
- **Prisma**: tipos generados automáticamente, migraciones sencillas, perfecto para el modelo de proyectos.
- **Tailwind**: utilidades primero, facilita generar CSS responsive en el exportador.

---

## Arquitectura general

```
┌────────────────────────────────────────────────┐
│                   Frontend (Vite)              │
│                                                │
│  ┌──────────┐  ┌───────────┐  ┌────────────┐ │
│  │  Canvas   │  │ Inspector  │  │ Toolbar /   │ │
│  │  (Drop)   │  │ Propiedades│  │ Componentes │ │
│  └────┬─────┘  └─────┬─────┘  └──────┬──────┘ │
│       │              │               │         │
│  ┌────▼──────────────▼───────────────▼──────┐ │
│  │           Zustand Store                  │ │
│  │  ┌──────────────────────────────────┐    │ │
│  │  │  Árbol de Componentes (JSON)     │    │ │
│  │  │  Historial (Undo/Redo)           │    │ │
│  │  │  Perfil Responsive activo        │    │ │
│  │  │  Selección actual                │    │ │
│  │  └──────────────────────────────────┘    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Motor de Renderizado                    │ │
│  │  (ComponentRenderer recursivo)           │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌────────────┐  ┌────────────┐               │
│  │ Exportador │  │ Generador  │               │
│  │ HTML       │  │ CSS        │               │
│  └────────────┘  └────────────┘               │
└──────────────────────┬─────────────────────────┘
                       │ API REST
┌──────────────────────▼─────────────────────────┐
│               Backend (Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Proyectos│  │ Usuarios │  │ Publicación   │ │
│  │ CRUD     │  │ Auth     │  │ (deploy)      │ │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       └──────────────┴──────────────┘          │
│                       │                        │
│              ┌────────▼────────┐               │
│              │   PostgreSQL    │               │
│              └─────────────────┘               │
└────────────────────────────────────────────────┘
```

---

## Estructura del proyecto

```
/
├── client/                  # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/          # Área de trabajo (drop zone)
│   │   │   ├── sidebar/         # Panel de componentes disponibles
│   │   │   ├── inspector/       # Inspector de propiedades
│   │   │   ├── toolbar/         # Barra superior (responsive, undo, etc.)
│   │   │   ├── renderer/        # ComponentRenderer recursivo
│   │   │   └── ui/              # Componentes UI genéricos
│   │   ├── stores/
│   │   │   ├── editor-store.ts  # Árbol, selección, historial
│   │   │   └── project-store.ts # Proyecto actual
│   │   ├── types/
│   │   │   └── component.ts     # Tipos del árbol JSON
│   │   ├── utils/
│   │   │   ├── html-export.ts   # Generador HTML
│   │   │   ├── css-export.ts    # Generador CSS
│   │   │   └── serialization.ts # Serialización / import
│   │   └── App.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── server/                  # Backend Express
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── db/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── PROYECTO.md              # Este documento — guía general
├── PLAN.md                  # Plan de trabajo por fases y tareas
└── PROGRESO.md              # Seguimiento de lo implementado
```

---

## Representación del árbol (core del editor)

Cada componente se representa como un nodo JSON:

```typescript
interface ComponentNode {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  styles: Record<string, Record<string, string>>; // { desktop: {}, tablet: {}, mobile: {} }
  children: ComponentNode[];
}

type ComponentType =
  | "container"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "form"
  | "input"
  | "video";
```

---

## Principios de diseño

1. **El árbol JSON es la fuente de verdad** — el DOM visual se deriva de él, no al revés.
2. **Cada cambio pasa por el store de Zustand** — así el historial (undo/redo) captura todo.
3. **Responsive por perfil** — cada nodo tiene estilos independientes por breakpoint.
4. **Exportación = serialización** — generar HTML/CSS es recorrer el árbol y producir strings.
5. **Componentes reutilizables** — un componente "maestro" se referencia por ID, las instancias heredan props y pueden sobrescribirlas.
