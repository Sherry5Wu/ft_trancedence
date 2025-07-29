# Tournament API Documentation

## Base URLs
```
# Direct access (development):
http://localhost:3002

# Through nginx proxy (production):
https://localhost:8443/stats
```

## Service Architecture
- Tournament service runs on port `3002`
- Nginx gateway proxies requests to `https://localhost:8443/stats/*`
- SSL certificate required for HTTPS

## Endpoints

### GET /tournament_history
GET tournament history

**Response:**
```json
[
  {
    "id": 1,
    "tournament_id": "tournament_1",
    "stage_number": 1,
    "match_number": 1,
    "player_name": "Player1",
    "opponent_name": "Player2",
    "result": "win",
    "played_at": "2025-01-15 10:30:00"
  }
]
```

### GET /tournament_history/:tournament_id
Get tournament history based on id

**Parameters:**
- `tournament_id` (string) - Turnauksen ID

**Response:**
```json
[
  {
    "id": 1,
    "tournament_id": "tournament_1",
    "stage_number": 1,
    "match_number": 1,
    "player_name": "Player1",
    "opponent_name": "Player2",
    "result": "win",
    "played_at": "2025-01-15 10:30:00"
  }
]
```

**Error Responses:**
- `404` - Tournament not found

### POST /tournament_history
Post new tournament

**Request Body:**
```json
{
  "tournament_id": "tournament_1",
  "stage_number": 1,
  "match_number": 1,
  "player_name": "Player1",
  "opponent_name": "Player2",
  "result": "win"
}
```

**Required Fields:**
- `tournament_id` (string)
- `stage_number` (number)
- `match_number` (number)
- `player_name` (string)
- `opponent_name` (string)
- `result` (string) - Must be "win", "loss", or "draw"

**Response:**
```json
{
  "id": 123,
  "tournament_id": "tournament_1",
  "stage_number": 1,
  "match_number": 1,
  "player_name": "Player1",
  "opponent_name": "Player2",
  "result": "win"
}
```

**Error Responses:**
- `400` - Invalid data
- `500` - Server error

## cURL Examples

### Get all tournament history:
```bash
# Through nginx proxy (production):
curl -k https://localhost:8443/stats/tournament_history

# Direct access (development):
curl http://localhost:3002/tournament_history
```

### Get specific tournament:
```bash
# Through nginx proxy (production):
curl -k https://localhost:8443/stats/tournament_history/tournament_1

# Direct access (development):
curl http://localhost:3002/tournament_history/tournament_1
```

### Add new match:
```bash
# Through nginx proxy (production):
curl -k -X POST https://localhost:8443/stats/tournament_history \
  -H "Content-Type: application/json" \
  -d '{
    "tournament_id": "tournament_1",
    "stage_number": 1,
    "match_number": 1,
    "player_name": "Player1",
    "opponent_name": "Player2",
    "result": "win"
  }'

# Direct access (development):
curl -X POST http://localhost:3002/tournament_history \
  -H "Content-Type: application/json" \
  -d '{
    "tournament_id": "tournament_1",
    "stage_number": 1,
    "match_number": 1,
    "player_name": "Player1",
    "opponent_name": "Player2",
    "result": "win"
  }'
```

## Note
- Use `-k` flag with curl for HTTPS to ignore SSL certificate warnings in development
- The `verify=False` parameter in Python requests serves the same purpose
