export type CreateCustomerInput = {
  name: string;
  phone: string;
  address?: string;
  creditLimit?: number;
  notes?: string;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput> & {
  isActive?: boolean;
};
