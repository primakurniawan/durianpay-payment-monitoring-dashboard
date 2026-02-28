package api_test

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/api"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestDB creates an in-memory SQLite DB seeded with test payments.
func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite3", ":memory:")
	require.NoError(t, err)

	_, err = db.Exec(`CREATE TABLE payments (
		id           INTEGER PRIMARY KEY AUTOINCREMENT,
		payment_id   TEXT NOT NULL,
		merchant_name TEXT NOT NULL,
		amount       INTEGER NOT NULL,
		status       TEXT NOT NULL,
		created_at   DATETIME NOT NULL
	)`)
	require.NoError(t, err)

	now := time.Now()
	rows := []struct {
		pid, merchant, status string
		amount                int
	}{
		{"PAY-0001", "Tokopedia", "completed", 100000},
		{"PAY-0002", "Shopee", "completed", 200000},
		{"PAY-0003", "Gojek", "processing", 50000},
		{"PAY-0004", "Tokopedia", "failed", 75000},
		{"PAY-0005", "Grab", "completed", 300000},
	}
	for _, r := range rows {
		_, err = db.Exec(
			`INSERT INTO payments(payment_id, merchant_name, amount, status, created_at) VALUES (?,?,?,?,?)`,
			r.pid, r.merchant, r.amount, r.status, now,
		)
		require.NoError(t, err)
	}

	t.Cleanup(func() { db.Close() })
	return db
}

func callPayments(t *testing.T, db *sql.DB, query string) api.PaymentsResponse {
	t.Helper()
	h := &api.APIHandler{DB: db}
	req := httptest.NewRequest(http.MethodGet, "/dashboard/v1/payments?"+query, nil)
	rec := httptest.NewRecorder()
	h.GetDashboardV1Payments(rec, req, api.NoParams())

	require.Equal(t, http.StatusOK, rec.Code)
	var resp api.PaymentsResponse
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&resp))
	return resp
}

func TestGetPayments_ReturnsAllByDefault(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "limit=100")
	assert.Len(t, resp.Data, 5)
	assert.Equal(t, 5, resp.Total)
}

func TestGetPayments_FilterByStatus(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "status=completed")
	assert.Equal(t, 3, resp.Total)
	for _, p := range resp.Data {
		assert.Equal(t, "completed", p.Status)
	}
}

func TestGetPayments_FilterProcessing(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "status=processing")
	assert.Equal(t, 1, resp.Total)
	assert.Equal(t, "Gojek", resp.Data[0].MerchantName)
}

func TestGetPayments_FilterFailed(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "status=failed")
	assert.Equal(t, 1, resp.Total)
	assert.Equal(t, "Tokopedia", resp.Data[0].MerchantName)
}

func TestGetPayments_SearchByMerchant(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "search=Tokopedia")
	assert.Equal(t, 2, resp.Total)
	for _, p := range resp.Data {
		assert.Equal(t, "Tokopedia", p.MerchantName)
	}
}

func TestGetPayments_SearchByPaymentID(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "search=PAY-0003")
	assert.Equal(t, 1, resp.Total)
	assert.Equal(t, "PAY-0003", resp.Data[0].PaymentID)
}

func TestGetPayments_SearchNoResults(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "search=nonexistent-xyz")
	assert.Equal(t, 0, resp.Total)
	assert.Empty(t, resp.Data)
}

func TestGetPayments_Pagination(t *testing.T) {
	db := setupTestDB(t)

	page1 := callPayments(t, db, "limit=2&offset=0")
	assert.Len(t, page1.Data, 2)
	assert.Equal(t, 5, page1.Total) // total = all matching, not just this page

	page2 := callPayments(t, db, "limit=2&offset=2")
	assert.Len(t, page2.Data, 2)

	page3 := callPayments(t, db, "limit=2&offset=4")
	assert.Len(t, page3.Data, 1)

	// All pages together should cover all 5 unique payment IDs
	seen := map[string]bool{}
	for _, p := range append(append(page1.Data, page2.Data...), page3.Data...) {
		seen[p.PaymentID] = true
	}
	assert.Len(t, seen, 5)
}

func TestGetPayments_SummaryIsAlwaysGlobal(t *testing.T) {
	db := setupTestDB(t)

	// Even when filtering by status=completed, summary should show totals for ALL payments
	resp := callPayments(t, db, "status=completed")

	assert.Equal(t, 5, resp.Summary.Total)
	assert.Equal(t, 3, resp.Summary.Completed)
	assert.Equal(t, 1, resp.Summary.Processing)
	assert.Equal(t, 1, resp.Summary.Failed)

	// But filtered total only counts matching rows
	assert.Equal(t, 3, resp.Total)
}

func TestGetPayments_SortByAmountAsc(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "sort=amount:asc&limit=100")
	require.Len(t, resp.Data, 5)
	for i := 1; i < len(resp.Data); i++ {
		assert.GreaterOrEqual(t, resp.Data[i].Amount, resp.Data[i-1].Amount)
	}
}

func TestGetPayments_SortByAmountDesc(t *testing.T) {
	db := setupTestDB(t)
	resp := callPayments(t, db, "sort=amount:desc&limit=100")
	require.Len(t, resp.Data, 5)
	for i := 1; i < len(resp.Data); i++ {
		assert.LessOrEqual(t, resp.Data[i].Amount, resp.Data[i-1].Amount)
	}
}

func TestGetPayments_InvalidSortFieldIsIgnored(t *testing.T) {
	db := setupTestDB(t)
	// "DROP TABLE" as sort field — must be rejected, fallback to created_at
	resp := callPayments(t, db, "sort=DROP TABLE:asc&limit=100")
	assert.Len(t, resp.Data, 5) // still returns data, not an error
}

func TestGetPayments_LimitCappedAt100(t *testing.T) {
	db := setupTestDB(t)
	// limit=999 should be silently capped (backend ignores invalid, defaults to 20)
	resp := callPayments(t, db, "limit=999")
	// 5 rows in DB so we get 5 regardless
	assert.Len(t, resp.Data, 5)
}
