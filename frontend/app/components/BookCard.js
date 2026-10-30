export default function BookCard({ libro, children }) {
  return (
    <div className="card h-100">
      {libro.cover_url && (
        <img
          src={libro.cover_url}
          className="card-img-top"
          alt={libro.title}
          style={{ height: "300px", objectFit: "cover" }}
        />
      )}
      <div className="card-body">
        <h5 className="card-title">{libro.title}</h5>
        <p className="card-text">{libro.author}</p>
        {children}
      </div>
    </div>
  );
}