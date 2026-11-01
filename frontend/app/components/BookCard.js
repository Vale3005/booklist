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
            className="aspect-[2/3] w-full object-cover"
            alt={libro.title}
          />
        </Link>
      )}
      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <Link href={"/libri/" + olid}>
          <h5 className="text-xl font-semibold leading-tight">{libro.title}</h5>
        </Link>
        <p className="text-base text-muted-foreground">{libro.author}</p>
        <div className="mt-auto pt-3">{children}</div>
      </CardContent>
    </Card>
  );
}