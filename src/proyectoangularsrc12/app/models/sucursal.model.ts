export class Sucursal {
    public codSucursal: number;
    public codSucursalErp: string;
    public nombreSucursal: string;
    public direccion: string;
    public principal: boolean;
    public codEmpresa: number;
    public modoVendedor: string;
    public latitud: number;
    public longitud: number;
    public envioposventa: boolean;
    public mensaje: string;
    public telefono?: string;
    public email?: string;
    public centro?: string;
    constructor() {
    }
}
