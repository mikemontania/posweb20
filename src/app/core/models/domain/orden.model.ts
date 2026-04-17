export interface Orden {
  codOrden: number;
  codOrdenEcommerce: number;
  ordenTotal: number;
  codSucursal: number;
  codEmpresa: number;
  fechaOrden: string;
  deliveryMethod: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingObservation: string;
  shippingDepartment: string;
  shippingCity: string;
  shippingNeighborhood: string;
  billingAddress: string;
  billingPhone: string;
  billingObservation: string;
  billingDepartment: string;
  billingCity: string;
  billingNeighborhood: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentCode: string;
  branchName: string;
  deliveryPaymentMethod: string;
  paymentDate: Date;
}
