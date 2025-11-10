Database quick guide

Engine
PostgreSQL

ORM
Sequelize

Migrations
path packages/backend/migrations
create migration  docker compose run --rm backend npm run migration:create add_name
run migrate       docker compose run --rm backend npm run db:migrate
undo last         docker compose run --rm backend npm run db:migrate:undo

Core tables
users  accounts and profile
workout plans  plan exercises mapping and order
workout sessions and tracking  session state and history
exercises and exercise steps  library and guidance
favorites  user exercise favorites
onboarding steps fields sessions answers  initial user data
ai_usage  quota counters by feature and period
subscription_plans and transactions  billing
login_history and locks  security

Config
env in packages/backend/.env
POSTGRES_USER  POSTGRES_PASSWORD  POSTGRES_DB  POSTGRES_HOST  POSTGRES_PORT

Local docker
postgres host localhost port 5433
inside compose use host db port 5432

