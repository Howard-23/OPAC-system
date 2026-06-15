# Library Management System - Documentation

## Overview

This documentation provides comprehensive guidance for developing the Library Management System, a desktop application built with Tauri, React, and PostgreSQL.

## Documentation Index

1. **[Project Tracker](./PROJECT-TRACKER.md)** - Latest progress and milestone status
2. **[Workflow Protocol](./WORKFLOW.md)** - Strict execution loop (PM -> Code -> QA -> Tracker)
3. **[Design System](./DESIGN-SYSTEM.md)** - Consolidated UI/UX specs (colors, fonts, components)
3. **[Database Schema](./DATABASE-SCHEMA.md)** - Complete database structure and relationships
4. **[Wireframe Analysis](./WIREFRAME-ANALYSIS.md)** - Original UI/UX requirements
5. **[Wireframe-1 Detailed Analysis](./wireframe-1/analysis/)** - Granular specs for each screen
6. **[Frontend Architecture](./FRONTEND-ARCHITECTURE.md)** - React/Tauri frontend implementation guide
7. **Tauri Backend** - The desktop backend lives in `src-tauri/` and is launched via `npm run tauri:dev`

## Quick Start

### Prerequisites
- Node.js 18+ LTS
- PostgreSQL 14+
- Rust (for Tauri)

### Installation

```bash
# Install dependencies
npm install

# Install Tauri CLI
npm install -g @tauri-apps/cli

# Setup database
# (See DATABASE-SCHEMA.md for details)

# Run development
npm run tauri dev
```

### Build for Production

```bash
npm run tauri build
```

## Project Structure

```
lib-mgmt/
├── docs/                  # Documentation
│   ├── legacy-database/
│   │   └── glDB.postgres.sql
│   └── wireframe-1/
│       ├── png/           # Original PNG files
│       └── webp/          # Converted WebP files
├── src/                   # Source code
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   ├── store/           # Global state
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   └── styles/          # Styles
├── src-tauri/            # Tauri backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── main.rs
│   └── tauri.conf.json
├── prisma/               # Database schema
│   └── schema.prisma
└── package.json
```

## Development Workflow

### Frontend Development

1. Start React dev server:
```bash
npm run dev
```

2. Start Tauri dev mode:
```bash
npm run tauri dev
```

### Backend Development

1. Run database migrations:
```bash
npx prisma migrate dev
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Launch the desktop app with the Tauri backend:
```bash
npm run tauri:dev
```

## Key Features

### Catalog Management
- Add, edit, delete catalog entries
- Search by title, author, subject, ISBN
- Manage multiple copies per entry
- Authority control for authors and subjects

### Circulation
- Check out items to users
- Check in returned items
- Renew borrowed items
- Reserve items
- Fine calculation

### User Management
- Create and manage user accounts
- User groups with different privileges
- Track user borrowing history
- Fine management

### Reporting
- Catalog reports
- Circulation reports
- User reports
- Fine reports
- Export to various formats

## Design Specifications (Legacy Parity)

### Color Scheme
- **Primary Surface**: `#D4D0C8` (Classic Grey)
- **Input/Grid Background**: `#FFFFFF` (White)
- **Selection Highlight**: `#000080` (Navy Blue)
- **Branding Header**: Blue-to-White Gradient (#A6CAF0)

### UI Components
- **Beveled Borders**: Strictly required for all buttons (raised) and inputs (sunken).
- **Iconography**: High-density 32x32px icons with bottom labels.
- **Layout**: Fixed-density forms (~800x600px window target).

For full specifications, see **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)**.

## Database Schema Highlights

### Core Tables
- `tblAuthor` - Author information
- `tblCat` - Catalog entries
- `tblHoldings` - Physical copies
- `tblUser` - User accounts
- `tblRent` - Circulation records
- `tblGroup` - User groups and privileges
- `tblSubject` - Subject classification
- `tblLocation` - Library locations
- `tblMaterial` - Material types
- `tblPassword` - Authentication
- `tblFineCode` - Fine payments
- `tblReserve` - Item reservations

### Key Relationships
- Catalog → Author (many-to-one)
- Catalog → Subjects (many-to-many)
- Catalog → Holdings (one-to-many)
- Holdings → Circulation (one-to-many)
- User → Circulation (one-to-many)
- User → Group (many-to-one)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Catalog
- `GET /api/catalog` - List all entries
- `GET /api/catalog/:id` - Get specific entry
- `POST /api/catalog` - Create entry
- `PUT /api/catalog/:id` - Update entry
- `DELETE /api/catalog/:id` - Delete entry
- `GET /api/catalog/search` - Search catalog

### Circulation
- `POST /api/circulation/checkout` - Check out item
- `POST /api/circulation/checkin` - Check in item
- `POST /api/circulation/renew` - Renew item
- `GET /api/circulation/overdue` - Get overdue items

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Reports
- `GET /api/reports/catalog` - Catalog report
- `GET /api/reports/circulation` - Circulation report
- `GET /api/reports/users` - User report
- `GET /api/reports/fines` - Fine report
- `POST /api/reports/export` - Export report

## Security Considerations

### Authentication
- JWT token-based authentication
- Secure password hashing (bcrypt)
- Token expiration and refresh

### Authorization
- Role-based access control
- Permission-based access control
- Group-based privileges

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## Testing

### Frontend Testing
- Component testing with React Testing Library
- Integration testing
- E2E testing with Playwright

### Backend Testing
- Unit testing with Jest
- Integration testing
- API testing with Supertest

## Deployment

### Development
```bash
npm run tauri dev
```

### Production Build
```bash
npm run tauri build
```

### Docker Deployment
```bash
docker-compose up
```

## Contributing

### Code Style
- Follow existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Add tests for new features

### Documentation
- Update relevant documentation
- Add comments for complex logic
- Keep README files up to date

## Support

For issues or questions:
1. Check existing documentation
2. Review code comments
3. Contact development team

## License

[Add your license information here]
