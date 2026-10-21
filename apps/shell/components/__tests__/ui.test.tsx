import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoText } from "../ui/TodoText";
import { ModeToggle } from "../ModeToggle";
import { EmailButton } from "../EmailButton";
import { MotionProvider } from "../motion/MotionProvider";

describe("TodoText", () => {
  it("highlights TODO markers and leaves plain text alone", () => {
    const { container } = render(<TodoText text="Team size: [TODO: Subrat to fill]" />);
    expect(screen.getByText("[TODO: Subrat to fill]").tagName).toBe("MARK");
    expect(container).toHaveTextContent("Team size: [TODO: Subrat to fill]");
  });

  it("renders strings without markers as-is", () => {
    const { container } = render(<TodoText text="No gaps here" />);
    expect(container.querySelector("mark")).toBeNull();
  });
});

describe("ModeToggle", () => {
  beforeEach(() => {
    document.documentElement.dataset.mode = "deep";
    localStorage.clear();
  });

  it("switches mode on <html>, persists it and updates aria-pressed", async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);
    const skim = screen.getByRole("button", { name: "Skim" });
    expect(skim).toHaveAttribute("aria-pressed", "false");

    await user.click(skim);

    expect(document.documentElement.dataset.mode).toBe("skim");
    expect(localStorage.getItem("skj-mode")).toBe("skim");
    expect(skim).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Deep dive" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("EmailButton", () => {
  it("offers copy, Gmail and mail-app options, and copies the address", async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    render(
      <MotionProvider>
        <EmailButton email="subratspace@gmail.com" />
      </MotionProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Email me" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    expect(screen.getByRole("link", { name: "Open in Gmail" })).toHaveAttribute(
      "href",
      expect.stringContaining("to=subratspace%40gmail.com"),
    );
    expect(screen.getByRole("link", { name: "Open mail app" })).toHaveAttribute("href", "mailto:subratspace@gmail.com");

    await user.click(screen.getByRole("button", { name: "Copy address" }));
    expect(writeText).toHaveBeenCalledWith("subratspace@gmail.com");
    expect(await screen.findByText("Email address copied to clipboard")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <MotionProvider>
        <EmailButton email="subratspace@gmail.com" />
      </MotionProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Email me" });
    await user.click(trigger);
    await act(async () => {
      await user.keyboard("{Escape}");
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
