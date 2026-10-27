# Booklist

```mermaid
erDiagram
    users ||--o{ readings : "ha nella sua biblioteca"
    books ||--o{ readings : "compare in"

    users {
        bigint id PK
        string name
        string email
        timestamp email_verified_at
        string password
        string remember_token
        timestamp created_at
        timestamp updated_at
    }

    books {
        bigint id PK
        string open_library_key
        string title
        string author
        string genre
        text summary
        int publication_year
        string cover_url
        timestamp created_at
        timestamp updated_at
    }

    readings {
        bigint id PK
        bigint user_id FK
        bigint book_id FK
        string status
        int rating
        text review
        timestamp created_at
        timestamp updated_at
    }
```

## Relazioni

- Un **utente** può avere molte **letture** (`users` 1 → N `readings`).
- Un **libro** può comparire in molte letture, di utenti diversi (`books` 1 → N `readings`).
- Di conseguenza `users` e `books` sono in relazione **molti a molti**, attraverso `readings`.
