package repository

import (
	"database/sql"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
)

type PaymentRepo struct {
	db *sql.DB
}

func NewPaymentRepo(db *sql.DB) *PaymentRepo {
	return &PaymentRepo{db: db}
}

func (r *PaymentRepo) GetPayments(status *string) ([]entity.Payment, error) {
	query := "SELECT id, payment_id, merchant_name, amount, status, created_at FROM payments"
	var rows *sql.Rows
	var err error

	if status != nil {
		query += " WHERE status = ?"
		rows, err = r.db.Query(query, *status)
	} else {
		rows, err = r.db.Query(query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []entity.Payment
	for rows.Next() {
		var p entity.Payment
		err := rows.Scan(&p.ID, &p.PaymentID, &p.MerchantName, &p.Amount, &p.Status, &p.CreatedAt)
		if err != nil {
			return nil, err
		}
		payments = append(payments, p)
	}
	return payments, nil
}
