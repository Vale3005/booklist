import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function BookCard({ libro, children }) {
  const olid = libro.open_library_key.split("/").pop();
  return (
    <Card className="h-full overflow-hidden pt-0">
      {libro.cover_url && (
        <Link href={"/libri/" + olid}>
          <img
            src={libro.cover_url}
            className="h-44 w-full bg-muted object-cover"
            alt={libro.title}
          />
        </Link>
      )}
      <CardContent className="flex flex-1 flex-col gap-2 pt-3">
        <Link href={"/libri/" + olid}>
          <h5 className="text-base font-semibold leading-tight">
            {libro.title}
          </h5>
        </Link>
        <p className="text-sm text-muted-foreground">{libro.author}</p>
        <div className="mt-auto pt-2">{children}</div>  {/* Rende la card riutilizzabile */}
      </CardContent>
    </Card>
  );
}