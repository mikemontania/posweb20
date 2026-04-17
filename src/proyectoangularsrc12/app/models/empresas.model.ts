import { TipoNegocio } from './tipoNegocio.model';
export class Empresas {

    constructor(
        public codEmpresa: number,
        public codEmpresaErp: string,
        public img: string,
        public maxDescuentoImp: number,
        public maxDescuentoPorc: number,
        public cantItem: number,
        public razonSocial: string,
        public actividad1: string,
        public actividad2: string,
        public ruc: string,
        public tipoNegocio: TipoNegocio,
        public logoReporte: string,
        public logoHeaderDark: string,
        public logoHeaderLight: string,
        public logoTextLight: string,
        public logoTextDark: string,
    ) { }

}
