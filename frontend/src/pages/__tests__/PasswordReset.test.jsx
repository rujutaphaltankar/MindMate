import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "../../context/AuthContext";
import { ThemeProvider } from "../../context/ThemeContext";
import ForgotPassword from "../ForgotPassword";
import ResetPassword from "../ResetPassword";

describe("ForgotPassword page", () => {
  it("renders email input and submit button", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <ForgotPassword />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to log in/i })).toBeInTheDocument();
  });
});

describe("ResetPassword page", () => {
  it("shows invalid token warning when no token is in query params", () => {
    render(
      <MemoryRouter initialEntries={["/reset-password"]}>
        <ThemeProvider>
          <AuthProvider>
            <ResetPassword />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/invalid or missing reset token/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /request new link/i })).toBeInTheDocument();
  });

  it("renders password input fields when token is present", () => {
    render(
      <MemoryRouter initialEntries={["/reset-password?token=valid-test-token"]}>
        <ThemeProvider>
          <AuthProvider>
            <ResetPassword />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
  });
});
