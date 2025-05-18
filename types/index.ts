export interface Car {
  _id: string;
  marca: string;
  modelo: string;
  año: number;
  precioInicial: number;
  estado: string;
  ownerWallet?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  _id: string;
  nombre: string;
  correo: string;
  wallet: string;
}

export interface Bid {
  _id: string;
  clienteId: Client | string;
  carroId: Car | string;
  monto: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  proof: {
    merkle_root: string;
    nullifier_hash: string;
    proof: string;
    credential_type: string;
    action: string;
  };
  compradorWallet: string;
  carroId: string;
}
