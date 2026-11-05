"use client"; 

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function PasswordInput(props) {
    const [mostra, setMostra] = useState(false);

   return (
  <div className="relative">
    <Input
      {...props}
      type={mostra ? "text" : "password"}
      className="pr-20"
    />
    <button
      type="button" //va specificato perché sennò sarebbe submit
      onClick={() => setMostra(!mostra)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
      aria-label={mostra ? "Nascondi password" : "Mostra password"}
    >
      {mostra ? "Nascondi" : "Mostra"}
    </button>
  </div>
);
}