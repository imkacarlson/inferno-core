source 'https://rubygems.org'

ruby '2.7.2'

gem 'dry-system', '~> 0.17', require: 'dry/system/container'

gem 'sqlite3'
gem 'sequel'

gem 'blueprinter'
gem 'hanami-controller', '~> 1.3'
gem 'hanami-router', '~> 1.3'
gem 'oj'
gem 'puma'

gem 'activesupport', require: 'active_support/all'
gem 'dotenv'
gem 'fhir_client'
gem 'rake'
gem 'faraday'

gem 'health_cards'

group :development, :test do
  gem 'pry'
  gem 'pry-byebug'
  gem 'rubocop', '~> 1.9'
  gem 'rubocop-rake', require: false
  gem 'rubocop-rspec', require: false
  gem 'rubocop-sequel', require: false
end

group :development do
  gem 'yard'
end

group :test do
  gem 'database_cleaner-sequel'
  gem 'rack-test'
  gem 'rspec'
  gem 'simplecov', require: false
  gem 'webmock'
  gem 'factory_bot'
end