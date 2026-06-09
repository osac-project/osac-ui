package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

// TokenIssuer holds the in-cluster and external URLs for an OAuth token issuer.
type TokenIssuer struct {
	// InternalURL is the in-cluster Keycloak realm URL used for server-side OIDC discovery and
	// token validation.
	InternalURL string `json:"internal_url"`
	// ExternalURL is the publicly accessible Keycloak realm URL that browsers should use for
	// OAuth flows (authorization code redirect, etc.).
	ExternalURL string `json:"external_url"`
}

type capabilitiesResponse struct {
	Authn struct {
		TokenIssuers []TokenIssuer `json:"token_issuers"`
	} `json:"authn"`
}

// FetchTokenIssuer fetches the fulfillment capabilities and returns the first token issuer,
// containing both the internal (in-cluster) and external (browser-facing) Keycloak URLs.
func FetchTokenIssuer(fulfillmentAPIURL string, httpClient *http.Client) (TokenIssuer, error) {
	if httpClient == nil {
		httpClient = http.DefaultClient
	}

	capabilitiesURL := strings.TrimSuffix(fulfillmentAPIURL, "/") + "/api/fulfillment/v1/capabilities"
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, capabilitiesURL, nil)
	if err != nil {
		return TokenIssuer{}, fmt.Errorf("build capabilities request: %w", err)
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		return TokenIssuer{}, fmt.Errorf("fetch capabilities: %w", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.WithError(err).Warn("failed to close response body")
		}
	}()

	if resp.StatusCode != http.StatusOK {
		return TokenIssuer{}, fmt.Errorf("capabilities endpoint returned HTTP %d", resp.StatusCode)
	}
	var caps capabilitiesResponse
	if err := json.NewDecoder(resp.Body).Decode(&caps); err != nil {
		return TokenIssuer{}, fmt.Errorf("decode capabilities: %w", err)
	}
	if len(caps.Authn.TokenIssuers) == 0 {
		return TokenIssuer{}, fmt.Errorf("no token issuers in capabilities response")
	}
	issuer := caps.Authn.TokenIssuers[0]
	return TokenIssuer{
		InternalURL: issuer.InternalURL,
		ExternalURL: issuer.ExternalURL,
	}, nil
}
