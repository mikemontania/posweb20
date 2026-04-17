import { Terminales } from './terminales.model';

export class Comprobantes {
    //  ? significa opcional
    public codNumeracion: number;
    public codEmpresa: number;
    public codSucursal: number;
    public terminal: Terminales;
    public tipoComprobante: string;
    public tipoImpresion: string;
    public timbrado: string;
    public inicioTimbrado: string;
    public finTimbrado: string;
    public serie: string;
    public ultimoNumero: number;
    public numeroInicio: number;
    public numeroFin: number;
    public maxItems: number;
    public activo: boolean;
    public autoImpresor: boolean;
    public nroComprobante: string;
    constructor() { }
}
