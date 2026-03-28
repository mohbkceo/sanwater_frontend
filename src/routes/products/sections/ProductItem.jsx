import {  Star } from "lucide-react";
import { Package } from "lucide-react";
import { TableCellsSplit } from "lucide-react";
import { Button } from "@/components";
import { ChevronRight } from "lucide-react";
import { Check } from "lucide-react";
import { PRODUCTVIEWDETAIL } from "@/configs/routes/routesConfig";
import { useNavigate } from "react-router-dom";
const RATING = 4.8;

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { name, gallery, tags, family, productId} = product;

  return (
    <div className="flex bg-white/20 px-4 rounded-3xl border border-white/20 flex-col gap-2 py-6">
      
      <div className="shrink-0 border border-purple-100 rounded-2xl overflow-hidden bg-gray-100">
        <img
          src={gallery[0]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      
      <div className="flex-1 flex flex-col justify-center gap-2">
        <h2 className="text-4xl font-mainFont font-bold tracking-wider leading-12 text-gray-900">{name}</h2>
        
        <div className=" flex flex-col gap-2 font-mono font-bol my-3">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-sm flex items-center  gap-1 "><TableCellsSplit size={16}/> {family}</span>
              <span className="text-md flex items-center gap-1"><Package size={16}/> {productId}</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 justify-start pt-1">
            
            <div className="flex items-center gap-1 text-black/80 bg-amber-400 text-sm font-semibold p-1 rounded-full">
              <Star size={14} className="fill-black/80 text-black/80" />
              {RATING}
            </div>
            </div>

          </div>



          
          
          


        </div>
     
          {tags?.length > 0 && tags.map((f) => {
              
        return (
        <ul className="mt-2 flex flex-col gap-2"> 
            {f?.length > 0 && <li key={f} className="flex items-center gap-1 bg-indigo-600/40 px-2 py-1 font-light text-white  rounded-full text-sm ">
              <span className="w-4 h-4 rounded-full  flex items-center justify-center ">
                <Check />
              </span>
              {f}
            </li>}
            </ul>
          )})}

      </div>

      
      
      <Button onClick={() => navigate(PRODUCTVIEWDETAIL.replace(`:serialNumber`, product?.serialNumber))} variant={`outline`} className={`flex items-center bg-white/10 hover:bg-white/20 border border-gray-900/20`}> <span>Lir plus</span> <ChevronRight size={15} /> </Button>
    </div>
  );
}