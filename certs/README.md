# Supabase public root certificate

`supabase-ca.crt` is a public CA certificate, not a private key or credential.

- Download: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt
- Provider source: https://github.com/supabase/supabase/blob/585477752aa35db85d41c0ef4ccd906e767ac503/apps/studio/components/interfaces/Settings/Database/SSLConfiguration.tsx
- TLS guidance: https://supabase.com/docs/guides/platform/ssl-enforcement
- SHA-256 fingerprint: `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`
- Valid until: 26 April 2031.

The migration script verifies the certificate chain and server hostname (`verify-full`). When Supabase rotates its CA, obtain the replacement from the provider and update this file. Application requests use the HTTPS Supabase API and the standard trusted certificate store.
