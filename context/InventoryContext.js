
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  collection, 
  doc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  getDocs,
  onSnapshot,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export function useInventory() {
  return useContext(InventoryContext);
}

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([]);         
  const [departedProducts, setDepartedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setDepartedProducts([]);
      setLoading(false);
      return;
    }

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(data);
      setLoading(false);
    });

    const unsubDeparted = onSnapshot(collection(db, 'departedProducts'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDepartedProducts(data);
    });

    return () => {
      unsubProducts();
      unsubDeparted();
    };
  }, [user]);

  async function findByBarcode(barcode) {
    const q = query(collection(db, 'products'), where('barcode', '==', barcode));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async function addProduct(productData) {
    try {
      const existing = await findByBarcode(productData.barcode);

      if (existing) {
        await updateDoc(doc(db, 'products', existing.id), {
          quantity: increment(1)
        });
        return { success: true, message: 'Prekės kiekis padidintas' };
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          quantity: 1,
          createdAt: new Date().toISOString(),
          createdBy: {
            name: userData?.fullName || 'Nežinomas',
            employeeId: userData?.employeeId || 'N/A'
          }
        });
        return { success: true, message: 'Prekė pridėta' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function removeProduct(barcode) {
    try {
      const product = await findByBarcode(barcode);
      
      if (!product) {
        return { success: false, error: 'Prekė nerasta' };
      }

      if (product.quantity > 1) {
        await updateDoc(doc(db, 'products', product.id), {
          quantity: increment(-1)
        });
        return { success: true, message: 'Prekės kiekis sumažintas' };
      } else {
        await addDoc(collection(db, 'departedProducts'), {
          name: product.name,
          description: product.description,
          barcode: product.barcode,
          departedAt: new Date().toISOString(),
          departedBy: {
            name: userData?.fullName || 'Nežinomas',
            employeeId: userData?.employeeId || 'N/A'
          },
          receivedAt: product.createdAt,
          receivedBy: product.createdBy
        });
        
        await deleteDoc(doc(db, 'products', product.id));
        return { success: true, message: 'Prekė pašalinta' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  const value = {
    products,
    departedProducts,
    loading,
    addProduct,
    removeProduct,
    findByBarcode
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
