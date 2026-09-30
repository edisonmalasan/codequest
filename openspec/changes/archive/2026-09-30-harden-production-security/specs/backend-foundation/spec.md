# Spec Delta

## MODIFIED Requirements

### Requirement: Runtime configuration is validated before listening

The backend SHALL validate host, port, environment, CORS origins, request-body limit, rate-limit settings, and the maximum authenticated token age before opening a listener. Invalid, unsafe, or out-of-range values SHALL fail startup with an actionable configuration error. Defaults SHALL be safe for local development and production configuration SHALL require explicit HTTPS allowed origins rather than a wildcard or plaintext origin. Local development and test MAY use explicit HTTP origins.

#### Scenario: Invalid configuration blocks startup

- **WHEN** a configured port, origin, body limit, rate-limit value, or maximum authenticated token age is malformed or outside its allowed range
- **THEN** startup fails before the network listener opens and identifies the invalid setting without exposing secrets

#### Scenario: Allowed origin receives CORS headers

- **WHEN** a request supplies an origin listed by validated configuration
- **THEN** the backend emits the appropriate CORS response headers, while an unlisted origin receives no access grant

#### Scenario: Production plaintext origin is refused

- **WHEN** production configuration lists an HTTP CORS origin, including a loopback origin
- **THEN** startup fails without opening a listener or echoing the origin's credentials or query values
