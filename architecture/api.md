# API Design

Base URL:

```text
http://localhost:4200/api
```

Authenticated routes use:

```text
Authorization: Bearer <token>
```

## Auth

### POST `/auth/register`

Request:

```json
{
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "password": "Strong123"
}
```

Response:

```json
{
  "token": "...",
  "user": {
    "id": "u_3",
    "name": "Rahim Uddin",
    "email": "rahim@example.com",
    "role": "user"
  }
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "demo@powerpulse.bd",
  "password": "Demo@12345"
}
```

### GET `/auth/me`

Returns the current authenticated user.

## Outages

### GET `/outages`

Optional filters:

```text
?district=Sylhet&type=loadshedding&status=verified
```

### POST `/outages`

Request:

```json
{
  "district": "Gazipur",
  "area": "Kapasia",
  "outageType": "loadshedding",
  "startedAt": "2026-05-08T18:00:00.000Z",
  "durationHours": 3,
  "severity": "high",
  "note": "Factory area running on generators."
}
```

### PATCH `/outages/:id/status`

Admin only.

```json
{
  "status": "verified"
}
```

### DELETE `/outages/:id`

Owner or admin only.

## Solar

### POST `/solar/calculate`

Request:

```json
{
  "batteryVoltage": 12,
  "batteryAh": 120,
  "batteryHealthPercent": 85,
  "depthOfDischargePercent": 70,
  "inverterEfficiencyPercent": 88,
  "panelWatts": 200,
  "sunlightHours": 5,
  "fanCount": 2,
  "lightCount": 4,
  "routerCount": 1,
  "laptopCount": 1,
  "phoneCount": 2,
  "customLoadWatts": 0
}
```

Formula:

```text
nominalWh = batteryVoltage * batteryAh
usableWh = nominalWh * batteryHealth * depthOfDischarge * inverterEfficiency
backupHours = usableWh / applianceLoadWatts
solarWh = panelWatts * sunlightHours * 0.75
```

### GET `/solar/estimates`

Returns saved estimates for the current user.

## Metrics

### GET `/metrics`

Returns public dashboard metrics. If a valid token is present, it also includes current-user counts.
