package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	ah "github.com/durianpay/fullstack-boilerplate/internal/module/auth/handler"
	"github.com/durianpay/fullstack-boilerplate/internal/module/payment/usecase"
	"github.com/durianpay/fullstack-boilerplate/internal/openapigen"
)

type APIHandler struct {
	Auth      *ah.AuthHandler
	PaymentUC usecase.PaymentUsecase
	DB        *sql.DB
}

var _ openapigen.ServerInterface = (*APIHandler)(nil)

func (h *APIHandler) PostDashboardV1AuthLogin(w http.ResponseWriter, r *http.Request) {
	h.Auth.PostDashboardV1AuthLogin(w, r)
}

func (h *APIHandler) GetDashboardV1Payments(
	w http.ResponseWriter,
	r *http.Request,
	params openapigen.GetDashboardV1PaymentsParams,
) {
	token := r.Header.Get("Authorization")
	if token == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	query := "SELECT payment_id, merchant_name, amount, status, created_at FROM payments"
	var rows *sql.Rows
	var err error

	if params.Status != nil {
		query += " WHERE status = ?"
		rows, err = h.DB.Query(query, *params.Status)
	} else {
		rows, err = h.DB.Query(query)
	}

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	type Payment struct {
		PaymentID    string    `json:"payment_id"`
		MerchantName string    `json:"merchant_name"`
		Amount       int       `json:"amount"`
		Status       string    `json:"status"`
		CreatedAt    time.Time `json:"created_at"`
	}

	var result []Payment
	for rows.Next() {
		var p Payment
		rows.Scan(&p.PaymentID, &p.MerchantName, &p.Amount, &p.Status, &p.CreatedAt)
		result = append(result, p)
	}

	json.NewEncoder(w).Encode(result)
}
