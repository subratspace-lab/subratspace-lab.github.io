import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getMetrics, getProject } from "@skj/content";
import { ProjectCard } from "../home/ProjectCard";
import { MotionProvider } from "../motion/MotionProvider";

const project = getProject("edtech-platform")!;

function renderCard() {
  return render(
    <MotionProvider>
      <ProjectCard project={project} metrics={getMetrics(project.metricIds)} />
    </MotionProvider>,
  );
}

describe("ProjectCard", () => {
  it("shows the summary and verified results collapsed by default", () => {
    renderCard();
    expect(screen.getByRole("heading", { name: "EdTech Learning Platform" })).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View details/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /full case study/ })).not.toBeInTheDocument();
  });

  it("expands with role, problem, decisions, results and tech, then links to the full page", async () => {
    const user = userEvent.setup();
    renderCard();
    const toggle = screen.getByRole("button", { name: /View details/ });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", expect.any(String));
    expect(screen.getByText("One of a 4-person team")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Key decisions" })).toBeInTheDocument();
    expect(screen.getByText("Webhook-driven billing")).toBeInTheDocument();
    expect(screen.getByText("The MVP shipped two weeks ahead of schedule.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read the full case study/ })).toHaveAttribute("href", "/work/edtech-platform");
  });

  it("collapses again with Show less", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("button", { name: /View details/ }));
    await user.click(screen.getByRole("button", { name: /Show less/ }));
    expect(screen.getByRole("button", { name: /View details/ })).toHaveAttribute("aria-expanded", "false");
  });
});
