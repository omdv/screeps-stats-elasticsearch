# Intro
This is the minimalistic client for screeps statistics modeled after [screeps-grafana](https://github.com/screepers/screeps-grafana). It uses the same principle, i.e. accessing the `Memory[user].stats`. Instead of using graphite it exports data to elasticsearch.

# Usage
Make a copy of `docker-compose.env` with your token and desired values and run `docker-compose up -d --build`.