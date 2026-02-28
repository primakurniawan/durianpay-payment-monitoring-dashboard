package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
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

type Payment struct {
	PaymentID    string    `json:"payment_id"`
	MerchantName string    `json:"merchant_name"`
	Amount       int       `json:"amount"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
}

// Summary holds counts per status — always reflects the FULL dataset, not just current page/filter
type Summary struct {
	Total      int `json:"total"`     // all payments in DB
	Completed  int `json:"completed"` // always the global count
	Processing int `json:"processing"`
	Failed     int `json:"failed"`
}

type PaymentsResponse struct {
	Data    []Payment `json:"data"`
	Total   int       `json:"total"`   // total matching current filter (for pagination)
	Summary Summary   `json:"summary"` // always global counts regardless of filter
}

func (h *APIHandler) GetDashboardV1Payments(
	w http.ResponseWriter,
	r *http.Request,
	params openapigen.GetDashboardV1PaymentsParams,
) {
	q := r.URL.Query()

	// Pagination
	limit := 20
	if l := q.Get("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil && v > 0 && v <= 100 {
			limit = v
		}
	}
	offset := 0
	if o := q.Get("offset"); o != "" {
		if v, err := strconv.Atoi(o); err == nil && v >= 0 {
			offset = v
		}
	}

	// Filters
	status := q.Get("status")
	search := q.Get("search")

	// Sort
	sortField := "created_at"
	sortDir := "DESC"
	if s := q.Get("sort"); s != "" {
		parts := strings.SplitN(s, ":", 2)
		allowed := map[string]bool{"created_at": true, "amount": true, "merchant_name": true, "status": true, "payment_id": true}
		if allowed[parts[0]] {
			sortField = parts[0]
			if len(parts) == 2 && strings.ToUpper(parts[1]) == "ASC" {
				sortDir = "ASC"
			}
		}
	}

	// Build WHERE for filtered query
	where := []string{}
	args := []interface{}{}
	if status != "" {
		where = append(where, "status = ?")
		args = append(args, status)
	}
	if search != "" {
		where = append(where, "(merchant_name LIKE ? OR payment_id LIKE ?)")
		like := "%" + search + "%"
		args = append(args, like, like)
	}
	whereSQL := ""
	if len(where) > 0 {
		whereSQL = " WHERE " + strings.Join(where, " AND ")
	}

	// 1. Count matching rows for pagination (respects current filter)
	var filteredTotal int
	if err := h.DB.QueryRow("SELECT COUNT(*) FROM payments"+whereSQL, args...).Scan(&filteredTotal); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	// 2. Global summary counts — always the full dataset, no filter applied
	//    One query using conditional COUNT so it's a single round-trip
	var summary Summary
	summaryQuery := `
		SELECT
			COUNT(*)                                    AS total,
			COUNT(CASE WHEN status='completed'  THEN 1 END) AS completed,
			COUNT(CASE WHEN status='processing' THEN 1 END) AS processing,
			COUNT(CASE WHEN status='failed'     THEN 1 END) AS failed
		FROM payments`
	if err := h.DB.QueryRow(summaryQuery).Scan(
		&summary.Total, &summary.Completed, &summary.Processing, &summary.Failed,
	); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	// 3. Fetch paginated data
	dataQuery := "SELECT payment_id, merchant_name, amount, status, created_at FROM payments" +
		whereSQL +
		" ORDER BY " + sortField + " " + sortDir +
		" LIMIT ? OFFSET ?"
	dataArgs := append(args, limit, offset)

	rows, err := h.DB.Query(dataQuery, dataArgs...)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	result := []Payment{}
	for rows.Next() {
		var p Payment
		if err := rows.Scan(&p.PaymentID, &p.MerchantName, &p.Amount, &p.Status, &p.CreatedAt); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		result = append(result, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(PaymentsResponse{
		Data:    result,
		Total:   filteredTotal,
		Summary: summary,
	})
}

// NoParams returns an empty GetDashboardV1PaymentsParams for use in tests.
func NoParams() openapigen.GetDashboardV1PaymentsParams {
	return openapigen.GetDashboardV1PaymentsParams{}
}
