.PHONY: test test-backend test-frontend setup

test: test-backend test-frontend

test-backend:
	docker compose run --rm -e RAILS_ENV=test backend bundle exec rspec

test-frontend:
	docker compose run --rm frontend npm test

setup:
	docker compose run --rm -e RAILS_ENV=test backend bundle exec rails db:create db:migrate
