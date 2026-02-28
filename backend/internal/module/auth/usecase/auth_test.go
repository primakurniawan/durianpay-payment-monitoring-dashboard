package usecase_test

import (
	"testing"
	"time"

	"github.com/durianpay/fullstack-boilerplate/internal/entity"
	"github.com/durianpay/fullstack-boilerplate/internal/module/auth/usecase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

// --- stub repo ---

type stubUserRepo struct {
	user *entity.User
	err  error
}

func (s *stubUserRepo) GetUserByEmail(_ string) (*entity.User, error) {
	return s.user, s.err
}

func hashPassword(t *testing.T, pw string) string {
	t.Helper()
	h, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.MinCost)
	require.NoError(t, err)
	return string(h)
}

// --- tests ---

func TestLogin_Success(t *testing.T) {
	repo := &stubUserRepo{
		user: &entity.User{
			ID:           "1",
			Email:        "cs@test.com",
			PasswordHash: hashPassword(t, "password"),
			Role:         "cs",
		},
	}
	uc := usecase.NewAuthUsecase(repo, []byte("test-secret"), time.Hour)

	token, user, err := uc.Login("cs@test.com", "password")

	require.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Equal(t, "cs@test.com", user.Email)
	assert.Equal(t, "cs", user.Role)
}

func TestLogin_WrongPassword(t *testing.T) {
	repo := &stubUserRepo{
		user: &entity.User{
			ID:           "1",
			Email:        "cs@test.com",
			PasswordHash: hashPassword(t, "password"),
			Role:         "cs",
		},
	}
	uc := usecase.NewAuthUsecase(repo, []byte("test-secret"), time.Hour)

	token, user, err := uc.Login("cs@test.com", "wrong-password")

	assert.Error(t, err)
	assert.Empty(t, token)
	assert.Nil(t, user)

	var appErr *entity.AppError
	require.ErrorAs(t, err, &appErr)
	assert.Equal(t, entity.ErrorCodeUnauthorized, appErr.Code)
}

func TestLogin_UserNotFound(t *testing.T) {
	repo := &stubUserRepo{
		err: entity.ErrorNotFound("user not found"),
	}
	uc := usecase.NewAuthUsecase(repo, []byte("test-secret"), time.Hour)

	token, user, err := uc.Login("nobody@test.com", "password")

	assert.Error(t, err)
	assert.Empty(t, token)
	assert.Nil(t, user)

	var appErr *entity.AppError
	require.ErrorAs(t, err, &appErr)
	assert.Equal(t, entity.ErrorCodeNotFound, appErr.Code)
}

func TestLogin_TokenIsJWT(t *testing.T) {
	repo := &stubUserRepo{
		user: &entity.User{
			ID:           "42",
			Email:        "op@test.com",
			PasswordHash: hashPassword(t, "secret"),
			Role:         "operation",
		},
	}
	uc := usecase.NewAuthUsecase(repo, []byte("jwt-key"), time.Hour)

	token, _, err := uc.Login("op@test.com", "secret")

	require.NoError(t, err)
	// JWT has 3 dot-separated parts
	parts := splitDots(token)
	assert.Len(t, parts, 3, "expected a JWT with header.payload.signature")
}

func splitDots(s string) []string {
	var parts []string
	start := 0
	for i, c := range s {
		if c == '.' {
			parts = append(parts, s[start:i])
			start = i + 1
		}
	}
	parts = append(parts, s[start:])
	return parts
}
