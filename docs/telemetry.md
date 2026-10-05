# Telemetry

Tabla sends no product analytics or usage telemetry.

The browser does not load PostHog or another analytics client.

The API and agent do not send telemetry events.

Tabla does not support analytics configuration variables.

Historical telemetry tables and migrations remain inert.

They preserve database history and support existing installations.

Do not write new data to those tables.

Operational application logs remain local to each deployed service.

These logs support diagnosis and do not create analytics network requests.
