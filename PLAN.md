# Plan de Trabajo — Constructor Visual de Páginas Web

> Plan por fases con tareas pequeñas, cada fase termina con un commit funcional.

---

## Fase 0 — Inicialización del proyecto

**Objetivo**: tener el repo listo con frontend y backend vacíos pero funcionales.

| # | Tarea | Descripción |
|---|-------|-------------|
| 0.1 | Crear proyecto Vite + React + TypeScript | `npm create vite@latest client -- --template react-ts` |
| 0.2 | Configurar Tailwind CSS en client | Instalar y configurar tailwind, postcss, autoprefixer |
| 0.3 | Instalar dependencias base (client) | zustand, dnd-kit, react-icons, uuid |
| 0.4 | Crear proyecto Express + TypeScript (server) | Inicializar server/ con ts, express, cors |
| 0.5 | Configurar Prisma + PostgreSQL | Schema inicial con User y Project |
| 0.6 | Crear estructura de carpetas del frontend | canvas, sidebar, inspector, toolbar, renderer, stores, types, utils |
| 0.7 | Configurar ESLint + Prettier | Reglas consistentes para el equipo |

**Commit**: `chore: initial project setup with Vite, Tailwind, Express, Prisma`

---

## Fase 1 — Árbol de componentes + Canvas renderizado

**Objetivo**: mostrar componentes estáticos en el canvas partiendo del árbol JSON.

| # | Tarea | Descripción |
|---|-------|-------------|
| 1.1 | Definir tipos base (`ComponentNode`, `ComponentType`) | Archivo `types/component.ts` |
| 1.2 | Crear store de Zustand con árbol de ejemplo | `stores/editor-store.ts` con estado inicial |
| 1.3 | Implementar `ComponentRenderer` | Renderiza recursivamente un `ComponentNode` → elemento React |
| 1.4 | Implementar renderers básicos | Container (div), Heading (h1-h6), Text (p), Button (button), Image (img) |
| 1.5 | Mostrar el árbol en el Canvas | Componente `Canvas` que lee el store y renderiza con `ComponentRenderer` |
| 1.6 | Mostrar sidebar con componentes disponibles | Lista estática de tipos que se pueden arrastrar |

**Commit**: `feat: component tree rendering on canvas with recursive renderer`

---

## Fase 2 — Drag & Drop (agregar y reordenar)

**Objetivo**: arrastrar componentes desde la sidebar al canvas y reordenarlos dentro del árbol.

| # | Tarea | Descripción |
|---|-------|-------------|
| 2.1 | Configurar DnD context en el Canvas | `DndContext` de dnd-kit envolviendo el canvas |
| 2.2 | Hacer draggable la sidebar | Cada item de la sidebar es un `useDraggable` |
| 2.3 | Hacer droppable el Canvas | El canvas es un `useDroppable` |
| 2.4 | Detectar colisión y posición exacta | Usar `PointerSensor` + `rectIntersection` o `closestCenter` |
| 2.5 | Implementar `addComponent` en el store | Agrega un nodo nuevo al árbol en la posición detectada |
| 2.6 | Implementar `moveComponent` en el store | Reordena nodos existentes (drag interno del canvas) |
| 2.7 | Validar padres permitidos | Un heading no puede hijo de un button, etc. |
| 2.8 | Feedback visual al arrastrar | Indicador de drop target (línea azul, resaltado) |

**Commit**: `feat: drag and drop to add and reorder components`

---

## Fase 3 — Inspector de propiedades

**Objetivo**: seleccionar un componente y editar sus props/estilos desde un panel.

| # | Tarea | Descripción |
|---|-------|-------------|
| 3.1 | Implementar selección de componente | Click en canvas → se guarda `selectedId` en el store |
| 3.2 | Resaltar componente seleccionado | Borde azul o glow en el elemento activo |
| 3.3 | Crear panel Inspector genérico | Muestra props del nodo seleccionado |
| 3.4 | Input para texto | Edita `props.text` del heading/button/text |
| 3.5 | Input para color | Color picker que edita `styles.desktop.color` |
| 3.6 | Input para tamaño de fuente | Slider o input number para `styles.desktop.fontSize` |
| 3.7 | Input para imagen (URL) | Edita `props.src` del componente image |
| 3.8 | Input para padding/margin | Campos numéricos para espaciado |
| 3.9 | Select para tipo de heading | h1 a h6 |
| 3.10 | Implementar `updateNodeProps` y `updateNodeStyles` en store | Mutaciones atómicas del árbol |

**Commit**: `feat: property inspector with editable props and styles`

---

## Fase 4 — Historial (Undo/Redo)

**Objetivo**: Ctrl+Z / Ctrl+Shift+Z para deshacer/rehacer cambios.

| # | Tarea | Descripción |
|---|-------|-------------|
| 4.1 | Implementar pila de historial en el store | `past: TreeNode[], future: TreeNode[]` |
| 4.2 | Snapshots automáticos con debounce | Guardar estado después de cada mutación (con 300ms de throttle) |
| 4.3 | Implementar `undo` y `redo` | Desapilar y restaurar árbol |
| 4.4 | Atajos de teclado | Ctrl+Z → undo, Ctrl+Shift+Z → redo |
| 4.5 | Botones en toolbar | Indicadores visuales de undo/redo disponibles |
| 4.6 | Excluir selección del historial | Cambiar selectedId no debe crear snapshot |

**Commit**: `feat: undo/redo history with keyboard shortcuts`

---

## Fase 5 — Responsive (perfiles)

**Objetivo**: cambiar entre Desktop, Tablet, Mobile con estilos independientes.

| # | Tarea | Descripción |
|---|-------|-------------|
| 5.1 | Definir breakpoints | desktop: 1200px, tablet: 768px, mobile: 375px |
| 5.2 | Agregar perfil activo al store | `activeBreakpoint: 'desktop' | 'tablet' | 'mobile'` |
| 5.3 | Crear toolbar de cambio de perfil | 3 botones que cambian el activeBreakpoint |
| 5.4 | Simular viewport en el canvas | Contenedor con ancho máximo según perfil activo |
| 5.5 | Aplicar estilos del perfil activo en renderer | `ComponentRenderer` usa `node.styles[activeBreakpoint]` |
| 5.6 | Inspector aware de perfil | Al editar un estilo, se guarda en el perfil activo |
| 5.7 | Indicador visual de qué perfil se está editando | Badge o label en el inspector |

**Commit**: `feat: responsive profiles with desktop, tablet, mobile`

---

## Fase 6 — Exportación HTML/CSS

**Objetivo**: generar HTML y CSS limpios a partir del árbol.

| # | Tarea | Descripción |
|---|-------|-------------|
| 6.1 | Implementar `generateHTML(node)` | Función recursiva que produce string HTML |
| 6.2 | Manejar componentes void | `<img>` no debe tener cierre `</img>` |
| 6.3 | Implementar `generateCSS(nodes, breakpoint)` | Genera clases con hash y sus estilos |
| 6.4 | Unir estilos de todos los breakpoints | Media queries para cada perfil |
| 6.5 | Previsualización del código | Modal o panel con HTML + CSS generados |
| 6.6 | Botón de copiar al portapapeles | Copy HTML, Copy CSS, Copy All |
| 6.7 | Botón de descarga | Descargar .zip con index.html + styles.css |

**Commit**: `feat: HTML/CSS export with preview and download`

---

## Fase 7 — Backend: Proyectos CRUD + Autenticación

**Objetivo**: guardar y cargar proyectos desde una base de datos.

| # | Tarea | Descripción |
|---|-------|-------------|
| 7.1 | Schema Prisma: User y Project | User (id, email, password), Project (id, name, tree, userId) |
| 7.2 | Registro y login con JWT | Rutas POST /auth/register, /auth/login |
| 7.3 | Middleware de autenticación | Verificar token JWT en rutas protegidas |
| 7.4 | CRUD de proyectos | GET /projects, POST /projects, PUT /projects/:id, DELETE /projects/:id |
| 7.5 | Conectar frontend con API | Servicio de fetch con token en headers |
| 7.6 | Pantalla de login/registro | Formularios en el frontend |
| 7.7 | Pantalla "Mis Proyectos" | Lista con opciones de abrir, renombrar, eliminar |
| 7.8 | Guardado automático | Debounced save cada 30s después del último cambio |

**Commit**: `feat: backend CRUD for projects with JWT auth`

---

## Fase 8 — Eliminar, duplicar y vaciar componentes

**Objetivo**: operaciones de edición sobre nodos en el canvas.

| # | Tarea | Descripción |
|---|-------|-------------|
| 8.1 | Implementar `removeNode(id)` | Elimina un nodo del árbol |
| 8.2 | Implementar `duplicateNode(id)` | Clona un nodo y lo inserta después del original |
| 8.3 | Implementar `clearCanvas()` | Vacía el árbol completo (con confirmación) |
| 8.4 | Menú contextual en nodos | Click derecho → Eliminar, Duplicar, etc. |
| 8.5 | Atajos de teclado para edición | Delete/Supr → eliminar, Ctrl+D → duplicar |

**Commit**: `feat: delete, duplicate, and clear canvas operations`

---

## Fase 9 — Componentes reutilizables (Master/Instance)

**Objetivo**: crear componentes "maestro" que al modificarse actualizan todas sus instancias.

| # | Tarea | Descripción |
|---|-------|-------------|
| 9.1 | Schema de master components | Nueva tabla/tipo `MasterComponent` en el store |
| 9.2 | Crear componente maestro | Guardar un subárbol como componente reutilizable |
| 9.3 | Insertar instancia | Crear nodo con referencia al master ID + props sobrescritas |
| 9.4 | Resolver instancia en renderer | Si un nodo tiene `masterId`, renderiza el subárbol maestro + merge de props |
| 9.5 | Editar componente maestro | Al modificar un master, todas las instancias se actualizan |
| 9.6 | Sobrescritura de props por instancia | Una instancia puede tener `overrides` que prevalecen sobre el master |

**Commit**: `feat: reusable master components with instance overrides`

---

## Fase 10 — Publicación (Deploy)

**Objetivo**: exportar y subir a un hosting estático automáticamente.

| # | Tarea | Descripción |
|---|-------|-------------|
| 10.1 | Generar HTML + CSS + JS completo | Incluir doctype, head, meta tags, Google Fonts, etc. |
| 10.2 | Endpoint de publicación | POST /projects/:id/publish |
| 10.3 | Subir archivos a S3/R2 | Usar SDK de AWS/S3 para subir archivos estáticos |
| 10.4 | Asignar URL única al proyecto | `https://cdn.dominio.com/project-123/index.html` |
| 10.5 | Botón "Publicar" en frontend | Con indicador de progreso y URL resultado |
| 10.6 | Dominio personalizado (opcional) | Configurar CNAME + SSL |

**Commit**: `feat: one-click publish with static hosting`

---

## Fase 11 — Marketplace de componentes (opcional)

**Objetivo**: comunidad de componentes compartidos.

| # | Tarea | Descripción |
|---|-------|-------------|
| 11.1 | Schema: CommunityComponent | Tabla con árbol JSON, autor, categoría, etc. |
| 11.2 | CRUD de componentes comunitarios | Subir, listar, importar componentes |
| 11.3 | Panel de marketplace en frontend | Navegación y búsqueda de componentes |
| 11.4 | Importar desde marketplace | Descargar y agregar al proyecto como master component |

**Commit**: `feat: component marketplace`

---

## Resumen de fases

| Fase | Tema | ¿Independiente? |
|------|------|----------------|
| 0 | Setup | — |
| 1 | Árbol + Canvas renderizado | Sí |
| 2 | Drag & Drop | Requiere Fase 1 |
| 3 | Inspector | Requiere Fase 1 |
| 4 | Undo/Redo | Requiere Fase 3 |
| 5 | Responsive | Requiere Fase 3 |
| 6 | Exportación HTML/CSS | Sí (usa el árbol) |
| 7 | Backend + Auth | Independiente |
| 8 | Edición avanzada | Requiere Fase 2 |
| 9 | Componentes reutilizables | Requiere Fase 1 y 3 |
| 10 | Publicación | Requiere Fase 6 y 7 |
| 11 | Marketplace | Requiere Fase 9 |

> **MVP** = Fases 1 + 2 + 3 + 6 → ya tenés un editor funcional con exportación.
> **Producto base** = MVP + 4 + 5 + 7 → editor completo con persistencia.
> **Producto profesional** = Fases 1 a 10.
