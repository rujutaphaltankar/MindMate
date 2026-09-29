import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "../../context/AuthContext";
import { ThemeProvider } from "../../context/ThemeContext";
import Companion from "../companion/Companion";

describe("Companion page", () => {
  it("renders companion chat interface, prompt chips, and input", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <Companion />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/talk to mindmate/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/talk to mindmate/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ new chat/i })).toBeInTheDocument();
    expect(screen.getByText(/quick 1-min reset/i)).toBeInTheDocument();
  });
});
