package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/api"
	"github.com/durianpay/fullstack-boilerplate/internal/config"
	ah "github.com/durianpay/fullstack-boilerplate/internal/module/auth/handler"
	ar "github.com/durianpay/fullstack-boilerplate/internal/module/auth/repository"
	au "github.com/durianpay/fullstack-boilerplate/internal/module/auth/usecase"
	srv "github.com/durianpay/fullstack-boilerplate/internal/service/http"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

// Real-looking merchant names for seed data
var merchants = []string{
	"Tokopedia", "Shopee", "Bukalapak", "Lazada", "Blibli",
	"JD.id", "Zalora", "Sociolla", "Ruangguru", "Gojek",
	"Grab", "OVO", "Dana", "LinkAja", "BCA Digital",
	"Mandiri Online", "BNI Mobile", "Traveloka", "Tiket.com", "RedDoorz",
	"Kopi Kenangan", "Fore Coffee", "Warunk Upnormal", "Yoshinoya", "Pizza Hut",
	"McDonald's", "KFC Indonesia", "J&T Express", "SiCepat", "Anteraja",
	"Ninja Xpress", "JNE", "Pos Indonesia", "Indosat", "Telkomsel",
	"XL Axiata", "Smartfren", "PLN", "PDAM", "Indihome",
}

func main() {
	_ = godotenv.Load()

	db, err := sql.Open("sqlite3", "dashboard.db?_foreign_keys=1")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := initDB(db); err != nil {
		log.Fatal(err)
	}

	JwtExpiredDuration, err := time.ParseDuration(config.JwtExpired)
	if err != nil {
		panic(err)
	}

	userRepo := ar.NewUserRepo(db)

	authUC := au.NewAuthUsecase(userRepo, config.JwtSecret, JwtExpiredDuration)

	authH := ah.NewAuthHandler(authUC)

	apiHandler := &api.APIHandler{
		Auth: authH,
		DB:   db,
	}

	server := srv.NewServer(apiHandler, config.OpenapiYamlLocation)
	addr := config.HttpAddress
	log.Printf("starting server on %s", addr)
	server.Start(addr)
}

func initDB(db *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS users (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  email TEXT NOT NULL UNIQUE,
		  password_hash TEXT NOT NULL,
		  role TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS payments (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  payment_id TEXT NOT NULL,
		  merchant_name TEXT NOT NULL,
		  amount INTEGER NOT NULL,
		  status TEXT NOT NULL,
		  created_at DATETIME NOT NULL
		);`,
	}
	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			return err
		}
	}

	// Seed users
	var userCount int
	if err := db.QueryRow("SELECT COUNT(1) FROM users").Scan(&userCount); err != nil {
		return err
	}
	if userCount == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		for _, u := range []struct{ email, role string }{
			{"cs@test.com", "cs"},
			{"operation@test.com", "operation"},
		} {
			if _, err := db.Exec("INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)", u.email, string(hash), u.role); err != nil {
				return err
			}
		}
		log.Println("Seeded users: cs@test.com, operation@test.com (password: password)")
	}

	// Seed 200 randomized payments
	var paymentCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM payments").Scan(&paymentCount); err != nil {
		return err
	}
	if paymentCount == 0 {
		statuses := []string{"completed", "completed", "completed", "processing", "failed"} // 60% completed, 20% processing, 20% failed
		rng := rand.New(rand.NewSource(42))                                                 // fixed seed = reproducible data

		now := time.Now()
		for i := 1; i <= 200; i++ {
			merchant := merchants[rng.Intn(len(merchants))]
			status := statuses[rng.Intn(len(statuses))]
			// Random amount between 10k and 5M IDR
			amount := (rng.Intn(500) + 1) * 10000
			// Random date within last 90 days
			daysAgo := rng.Intn(90)
			hoursAgo := rng.Intn(24)
			createdAt := now.AddDate(0, 0, -daysAgo).Add(-time.Duration(hoursAgo) * time.Hour)

			_, err := db.Exec(
				"INSERT INTO payments(payment_id, merchant_name, amount, status, created_at) VALUES (?, ?, ?, ?, ?)",
				fmt.Sprintf("PAY-%04d", i),
				merchant,
				amount,
				status,
				createdAt,
			)
			if err != nil {
				return err
			}
		}
		log.Println("Seeded 200 randomized payments")
	}

	const dbLifetime = time.Minute * 5
	db.SetConnMaxLifetime(dbLifetime)
	return nil
}
