import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]
      const product = await api.get<Product>(`/products/${productId}`).then(response => response.data)
      const productAlreadyExists = updatedCart.find(product => product.id === productId)
      const stock = await api.get(`stock/${productId}`).then(response => response.data)
      const stockAmount = stock.amount
      if(productAlreadyExists) {
        if(stockAmount > productAlreadyExists?.amount) {
          productAlreadyExists.amount += 1
          setCart(updatedCart)
          return localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart))
        }
        toast.error("Quantidade solicitada fora de estoque")
      } else{
        product.amount = 1
        updatedCart.push(product);
        setCart(updatedCart)
        return localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart))
      }
    //   const stock = await api.get<Stock>(`/stock/${productId}`).then(response => response.data)
    //   const amount = stock.amount
    //   if(amount - product.amount != 0) {
    //     if(!productAlreadyExists) {
    //       product.amount++
    //       return setCart(updatedCart)
    //     } else {
    //       updatedCart.push(product)
    //       setCart(updatedCart)
    //       return localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart))
    //     }
    //   } else {
    //     toast.error("Acabou o estoque")
    //   }
    } catch(err) {
      toast.error("Erro na adição do produto")
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    // try {
    //   const product = cart.find(product => product.id === productId)
    //   console.log(product)
    //   if(product) {
    //     product.amount++
    //     return setCart([...cart])
    //   }
    // } catch (err){
    //   console.error(err)
    // }
  };
  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
