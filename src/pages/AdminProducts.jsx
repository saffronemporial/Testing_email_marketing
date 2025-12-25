import React, { useState, useEffect } from "react";
import ProductList from "../components/Products/ProductList";
import ProductForm from "../components/Products/ProductForm";
import InventoryStatus from "../components/Products/InventoryStatus";
import { listProducts } from "../services/products";

const AdminProducts = () => {
  const [selected, setSelected] = useState(null);
  const [all, setAll] = useState([]);

  useEffect(()=>{ (async ()=>{
    const r = await listProducts();
    if (!r.error) setAll(r.data || []);
  })(); }, []);

  return (
    <div style={{padding:20}}>
      <h2>Admin — Product Management</h2>
      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <ProductForm productId={selected} onSaved={()=>window.location.reload()} />
          <InventoryStatus />
        </div>
        <div style={{flex:2}}>
          <ProductList />
          <h4>All Products</h4>
          <ul>
            {all.map(p=> <li key={p.id}><button onClick={()=>setSelected(p.id)}>{p.name}</button></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
