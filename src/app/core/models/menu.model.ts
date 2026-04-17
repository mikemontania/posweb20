export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  roles?: string[];
  children?: MenuItem[];
  badge?: number | string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
  },

  // ── Transacciones ──────────────────────────────────────────
  {
    label: 'Pedidos',
    icon: 'orders',
    children: [
      { label: 'Nuevo Pedido',  icon: 'orders', route: '/pedidos/nueva'  },
      { label: 'Lista Pedidos', icon: 'orders', route: '/pedidos-lista'  },
    ],
  },
  {
    label: 'Ventas',
    icon: 'invoice',
    children: [
      { label: 'Nueva Venta',  icon: 'invoice', route: '/ventas/nueva'     },
      { label: 'Obsequios',    icon: 'invoice', route: '/ventas/obsequios' },
      { label: 'Lista Ventas', icon: 'invoice', route: '/ventas-lista'     },
      { label: 'Cobranzas',    icon: 'invoice', route: '/cobranza-lista'   },
      { label: 'Créditos',     icon: 'invoice', route: '/creditos-lista'   },
    ],
  },
  {
    label: 'Reparto',
    icon: 'truck',
    children: [
      { label: 'Nuevo Reparto',  icon: 'truck', route: '/repartos'      },
      { label: 'Lista Repartos', icon: 'truck', route: '/reparto-lista' },
    ],
  },
  {
    label: 'Compras',
    icon: 'invoice',
    children: [
      { label: 'Nueva Compra',  icon: 'invoice', route: '/compras-nueva'  },
      { label: 'Lista Compras', icon: 'invoice', route: '/compras-lista'  },
    ],
  },
  {
    label: 'Transferencias',
    icon: 'box',
    children: [
      { label: 'Nueva Transferencia',  icon: 'box', route: '/transferencias-nueva'  },
      { label: 'Lista Transferencias', icon: 'box', route: '/transferencias-lista'  },
    ],
  },

  // ── Fidelización ───────────────────────────────────────────
  {
    label: 'Canje',
    icon: 'star',
    children: [
      { label: 'Nuevo Canje',             icon: 'star', route: '/canjes'               },
      { label: 'Lista Canjes',            icon: 'star', route: '/canjes-lista'         },
      { label: 'Puntos',                  icon: 'star', route: '/puntos'               },
      { label: 'Premios',                 icon: 'star', route: '/premios'              },
      { label: 'Stock Premios',           icon: 'box',  route: '/stock-premio'         },
      { label: 'Mov. Stock Premios',      icon: 'box',  route: '/mv-stock-premio'      },
      { label: 'Mov. Stock Premios Docs', icon: 'box',  route: '/mv-stock-premio-docs' },
      { label: 'Historial Puntos',        icon: 'star', route: '/historial-puntos'     },
      { label: 'Historial Premios',       icon: 'star', route: '/historial-premios'    },
    ],
  },
  {
    label: 'PROMO',
    icon: 'hash',
    children: [
      { label: 'Alianzas',    icon: 'hash', route: '/alianzas'    },
      { label: 'Cupones',     icon: 'hash', route: '/cupones'     },
      { label: 'Influencers', icon: 'user', route: '/influencers' },
    ],
  },

  // ── Maestros ───────────────────────────────────────────────
  {
    label: 'Maestros',
    icon: 'box',
    children: [
      { label: 'Clientes',         icon: 'users',    route: '/clientes'           },
      { label: 'Productos',        icon: 'box',      route: '/productos'          },
      { label: 'Precios',          icon: 'invoice',  route: '/precios'            },
      { label: 'Precios de Costo', icon: 'invoice',  route: '/precios-materiales' },
      { label: 'Descuentos',       icon: 'invoice',  route: '/descuentos'         },
      { label: 'Bonificaciones',   icon: 'invoice',  route: '/bonificaciones'     },
      { label: 'Stock',            icon: 'box',      route: '/stock'              },
      { label: 'Proveedores',      icon: 'building', route: '/proveedores'        },
    ],
  },

  // ── Parámetros ─────────────────────────────────────────────
  {
    label: 'Parámetros',
    icon: 'settings-list',
    children: [
      { label: 'Bancos',             icon: 'settings-list', route: '/bancos'                   },
      { label: 'Categoría Prod.',    icon: 'settings-list', route: '/categoria'                },
      { label: 'Comprobantes',       icon: 'settings-list', route: '/comprobantes'             },
      { label: 'Depósitos',          icon: 'settings-list', route: '/depositos'                },
      { label: 'Forma de Venta',     icon: 'settings-list', route: '/forma-venta'              },
      { label: 'Grupo Descuento',    icon: 'settings-list', route: '/grupo-descuento'          },
      { label: 'Grupo Material',     icon: 'settings-list', route: '/grupo-material'           },
      { label: 'Lista de Precio',    icon: 'settings-list', route: '/lista-precio'             },
      { label: 'Medio de Pago',      icon: 'settings-list', route: '/medio-pago'               },
      { label: 'Motivo Anulación',   icon: 'settings-list', route: '/motivo-anulacion'         },
      { label: 'Mot. Anul. Compra',  icon: 'settings-list', route: '/motivo-anulacion-compra'  },
      { label: 'Mot. Transferencia', icon: 'settings-list', route: '/motivo-transferencia'     },
      { label: 'Sucursales',         icon: 'building',      route: '/sucursales'               },
      { label: 'Terminales',         icon: 'settings-list', route: '/terminales'               },
      { label: 'Tipo Depósito',      icon: 'settings-list', route: '/tipo-deposito'            },
      { label: 'Tipo Medio Pago',    icon: 'settings-list', route: '/tipo-medio-pago'          },
      { label: 'Unidad de Medida',   icon: 'settings-list', route: '/unidad-medida'            },
    ],
  },

  // ── Operaciones ────────────────────────────────────────────
  {
    label: 'Operaciones',
    icon: 'users',
    children: [
      { label: 'Choferes',   icon: 'user',  route: '/choferes'   },
      { label: 'Vehículos',  icon: 'truck', route: '/vehiculos'  },
      { label: 'Vendedores', icon: 'user',  route: '/vendedores' },
    ],
  },

  // ── Reportes ───────────────────────────────────────────────
  {
    label: 'Reportes',
    icon: 'chart',
    children: [
      { label: 'Ventas por Vendedor', icon: 'chart', route: '/reporte-vendedores' },
    ],
  },

  // ── Configuración ──────────────────────────────────────────
  {
    label: 'Configuración',
    icon: 'company',
    children: [
      { label: 'Usuarios',   icon: 'users',    route: '/usuarios'  },
      { label: 'Sucursales', icon: 'building', route: '/sucursales' },
      { label: 'Empresa',    icon: 'company',  route: '/empresas'  },
    ],
  },
];
