package entity

import "time"

type Payment struct {
	ID           int
	PaymentID    string
	MerchantName string
	Amount       int
	Status       string
	CreatedAt    time.Time
}
