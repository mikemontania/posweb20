// ============================================================
//  AuthSession — datos que provienen EXCLUSIVAMENTE del JWT
//  Payload real decodificado:
//  { sub, username, nombre, authorities, codPersonaErp, img,
//    codUsuario, codEmpresa, codEmpresaErp, codSucursal,
//    codSucursalErp, cantItem, maxDescuentoPorc, maxDescuentoImp,
//    iat, exp }
//
//  NO es lo mismo que Usuarios (modelo de dominio completo).
//  Este modelo representa solo la sesión activa del token.
// ============================================================
export interface AuthSession {
  // Identificación
  codUsuario:       number;
  codPersonaErp:    string;   // viene en el JWT como string ("3")
  username:         string;   // = sub (email)
  nombre:           string;

  // Empresa / Sucursal
  codEmpresa:       number;
  codEmpresaErp:    string;   // ej: "PY01"
  codSucursal:      number;
  codSucursalErp:   string;   // ej: "P101"

  // Permisos
  authorities:      string[]; // ej: ["ROLE_ADMIN"]
  maxDescuentoImp:  number;
  maxDescuentoPorc: number;
  cantItem:         number;

  // Extras
  img:              string;   // UUID del avatar, ej: "f63ffcfd-....jpg"

  // Tiempos del token (solo en memoria, no se persisten)
  iat?: number;
  exp?: number;
}
