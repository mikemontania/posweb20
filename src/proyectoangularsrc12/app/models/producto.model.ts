import { CategoriaProducto } from './categoriaProducto.model';
import { Empresas } from './empresas.model';
import { UnidadMedida } from './unidadMedida.model';
 


export class Producto {
                public codProducto: number;
                public codProductoErp: string;
                public nombreProducto: string;
                public descripcion: string;
                public codBarra: string;
                public marca: string;
                public grupo: string;
                public subGrupo: string;
                public presentacion: string;
                public color: string;
                public peso: number;
                public catABC: string;
                public concatCodNombre: string;
                public concatCodErpNombre: string;
                public destacado: boolean;
                public activo: boolean;
                public cantidadMax: number;
                public cantidadMin: number;
                public categoriaProducto: CategoriaProducto;
                public empresa: Empresas;
                public inventariable: boolean;
                public iva: number;
                public ivaEspecial: boolean;
                public obs: string;
                public unidad: UnidadMedida;
                public sinDescuento: boolean;
                public img: string;
                public grpMaterial: string;
        constructor() {}
    }
 