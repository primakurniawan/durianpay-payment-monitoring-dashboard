package http

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/openapigen"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	oapinethttpmw "github.com/oapi-codegen/nethttp-middleware"
)

type Server struct {
	router http.Handler
}

const (
	readTimeout  = 10
	writeTimeout = 10
	idleTimeout  = 60
)

func NewServer(apiHandler openapigen.ServerInterface, openapiYamlPath string) *Server {
	swagger, err := openapigen.GetSwagger()
	if err != nil {
		log.Fatalf("failed to load swagger: %v", err)
	}

	// Clear servers so validator doesn't reject based on host
	swagger.Servers = nil

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// OpenAPI validator — only validates the login endpoint strictly.
	// The payments endpoint uses extra query params (limit, offset, search, sort)
	// beyond what the generated spec knows about, so we skip validation for it.
	r.Use(func(next http.Handler) http.Handler {
		validator := oapinethttpmw.OapiRequestValidatorWithOptions(
			swagger,
			&oapinethttpmw.Options{
				Options: openapi3filter.Options{
					AuthenticationFunc: func(ctx context.Context, input *openapi3filter.AuthenticationInput) error {
						return nil
					},
				},
				SilenceServersWarning: true,
			},
		)
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip OpenAPI validation for GET /payments — it has extra params
			// (limit, offset, search, sort) the generated spec doesn't know about
			if r.Method == http.MethodGet && strings.Contains(r.URL.Path, "/payments") {
				next.ServeHTTP(w, r)
				return
			}
			validator(next).ServeHTTP(w, r)
		})
	})

	r.Use(JWTMiddleware)

	openapigen.HandlerFromMux(apiHandler, r)

	return &Server{
		router: r,
	}
}

func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "/auth/login") {
			next.ServeHTTP(w, r)
			return
		}

		if strings.Contains(r.URL.Path, "/payments") {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "missing authorization header", http.StatusUnauthorized)
				return
			}

			if !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, "invalid token format", http.StatusUnauthorized)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			_, err := validateJWT(tokenString)
			if err != nil {
				http.Error(w, "invalid or expired token", http.StatusUnauthorized)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) Start(addr string) {
	service := &http.Server{
		Addr:         addr,
		Handler:      s.router,
		ReadTimeout:  readTimeout * time.Second,
		WriteTimeout: writeTimeout * time.Second,
		IdleTimeout:  idleTimeout * time.Second,
	}

	go func() {
		log.Printf("listening on %s", addr)
		if err := service.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Println("Shutting down gracefully...")
	service.Close()
}
