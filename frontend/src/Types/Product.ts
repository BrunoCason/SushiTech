export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  status?: string;
  instanceId?: string; // instanceId para distinguir produtos iguais
}

export interface DeleteProductButtonProps {
  productId: string;
  productImageUrl: string;
  onProductDeleted: () => void;
}

export interface EditProductFormProps {
  productId: string;
  productName: string;
  productDescription: string;
  productPrice: number;
  productTags: string[];
  onUpdate: () => void;
  onCancel: () => void;
}
