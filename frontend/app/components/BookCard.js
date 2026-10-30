import { Card, CardContent } from "@/components/ui/card";

export default function BookCard({ libro, children }) {
  return (
    <Card className="h-full overflow-hidden pt-0">
      {libro.cover_url && (
        <img
          src={libro.cover_url}
          className="h-72 w-full object-cover"
          alt={libro.title}
        />
      )}
      <CardContent className="flex flex-1 flex-col gap-2">
        <h5 className="font-semibold leading-tight">{libro.title}</h5>
        <p className="text-sm text-muted-foreground">{libro.author}</p>
        <div className="mt-auto pt-2">{children}</div>
      </CardContent>
    </Card>
  );
}