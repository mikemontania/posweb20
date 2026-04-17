export interface User {
  codUsuario:       number;
  codEmpresa:       number;
  codSucursal:      number;
  codEmpresaErp:    number;
  codSucursalErp:   number;
  nombre:           string;
  username:         string;
  password?:        string;  // solo en memoria durante login
  authorities:      string[];
  maxDescuentoImp:  number;
  maxDescuentoPorc: number;
  cantItem:         number;
  img:              string;
}
