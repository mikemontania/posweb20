export class Orden {
            public codOrden: number;
            public codOrdenEcommerce: number;
            public ordenTotal: number;
            public codSucursal: number;
            public codEmpresa: number;
            public fechaOrden: string;
            public deliveryMethod: string;
            public shippingPhone: string;
            public shippingAddress: string;
            public shippingObservation: string;
            public shippingDepartment: string;
            public shippingCity: string;
            public shippingNeighborhood: string;
            public billingAddress: string;
            public billingPhone: string;
            public billingObservation: string;
            public billingDepartment: string;
            public billingCity: string;
            public billingNeighborhood: string;
            public paymentStatus: string;
            public paymentMethod: string;
            public paymentCode: string;
            public branchName: string;
            public deliveryPaymentMethod: string;
            public paymentDate: Date;
            constructor() { }
    }