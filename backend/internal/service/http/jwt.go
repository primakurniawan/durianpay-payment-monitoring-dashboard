package http

import (
	"fmt"

	"github.com/durianpay/fullstack-boilerplate/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(config.JwtSecret)

func validateJWT(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return token, nil
}
