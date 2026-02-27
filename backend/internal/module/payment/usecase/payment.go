package usecase

import "github.com/durianpay/fullstack-boilerplate/internal/entity"

type PaymentUsecase interface {
	GetPayments(status *string) ([]entity.Payment, error)
}
