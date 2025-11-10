Fitnexus Docker quick guide

Prepare
1) copy packages/backend/.env.example to packages/backend/.env and fill values

Start all services
cd docker
docker compose up --build

Stop
docker compose down

Open
frontend  http://localhost:5173
backend   http://localhost:3001
ai trainer  http://localhost:8000

Logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f ai-trainer

Database migrate
docker compose run --rm backend npm run db:migrate

Rollback last migration
docker compose run --rm backend npm run db:migrate:undo

Create a new migration file
docker compose run --rm backend npm run migration:create add_your_migration

Install a backend package
docker compose exec backend npm install your_package

Install a frontend package
docker compose exec frontend npm install your_package

Rebuild one service
docker compose build backend
docker compose up -d backend

