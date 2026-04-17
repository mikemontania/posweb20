import { Empresas } from "./empresas.model";
import { Sucursal } from './sucursal.model';

export class Premio {
    public codPremio: number;
    public empresa: Empresas;
    public codPremioErp: string;
    public descripcion: string;
    public codBarra: string;
    public activo: boolean;
    public puntos: number;
    public img: string;
    public obs: string;
    public inventariable: boolean; 
    public descuento?: number;
    public sucursal?: Sucursal;

    constructor() { }
}
