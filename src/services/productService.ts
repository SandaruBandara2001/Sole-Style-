import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, PRODUCTS } from '../types';

const COLLECTION_NAME = 'products';

export const getProducts = async (category?: string | null, filter?: string | null) => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    let q = query(productsRef);

    if (category) {
      q = query(productsRef, where('category', '==', category));
    }

    const querySnapshot = await getDocs(q);
    console.log(`Fetched ${querySnapshot.size} products from Firestore.`);
    let products = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));

    if (filter === 'new') {
      products = products.filter(p => p.isNew);
    } else if (filter === 'sale') {
      products = products.filter(p => p.isSale);
    }

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Product;
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

export const seedProducts = async () => {
  try {
    // Check if products already exist to avoid duplicates
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (!querySnapshot.empty) {
      console.log("Products already seeded.");
      return;
    }

    console.log("Seeding products...");
    for (const product of PRODUCTS) {
      await setDoc(doc(db, COLLECTION_NAME, product.id), product);
    }
    console.log("Seeding complete.");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
};
