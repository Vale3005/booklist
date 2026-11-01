import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function BookCard({ libro, children }) {
  const olid = libro.open_library_key.split("/").pop();
  return (
    <Card className="h-full overflow-hidden pt-0">
      {libro.cover_url && (
        <Link href={"/libri/" + olid}> <img
          src={libro.cover_url}
          className="h-72 w-full object-cover"
          alt={libro.title}
        /> </Link>
      )}
      <CardContent className="flex flex-1 flex-col gap-2">
        <Link href={"/libri/" + olid}><h5 className="font-semibold leading-tight">{libro.title}</h5></Link>
        <p className="text-sm text-muted-foreground">{libro.author}</p>
        <div className="mt-auto pt-2">{children}</div>
      </CardContent>
    </Card>
  );
}
