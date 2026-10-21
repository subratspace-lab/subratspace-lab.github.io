import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RemoteWidget } from "../RemoteWidget";
import { loadRemoteModule } from "@/lib/federation/runtime";

jest.mock("@/lib/federation/runtime", () => ({ loadRemoteModule: jest.fn() }));
const load = loadRemoteModule as jest.Mock;

const data = { score: { before: 62, after: 88 }, metrics: [] };

function Slider({ data: d }: { data: typeof data }) {
  return <p>Remote says {d.score.after}</p>;
}

function Crashes(): never {
  throw new Error("boom");
}

describe("RemoteWidget", () => {
  beforeEach(() => {
    load.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("shows a skeleton, then the remote with its props", async () => {
    load.mockResolvedValue(Slider);
    render(<RemoteWidget id="caseStudies/LighthouseSlider" props={{ data }} label="The slider" minHeight={100} lazy={false} />);
    expect(screen.getByText("Loading The slider…")).toBeInTheDocument();
    expect(await screen.findByText("Remote says 88")).toBeInTheDocument();
    expect(load).toHaveBeenCalledWith("caseStudies/LighthouseSlider");
  });

  it("contains a failed load and recovers on retry", async () => {
    const user = userEvent.setup();
    load.mockRejectedValueOnce(new Error("404")).mockResolvedValueOnce(Slider);
    render(
      <div>
        <p>Rest of the page</p>
        <RemoteWidget id="caseStudies/LighthouseSlider" props={{ data }} label="The slider" minHeight={100} lazy={false} />
      </div>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("The slider couldn't load.");
    expect(screen.getByText("Rest of the page")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Remote says 88")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("contains a crash during render", async () => {
    load.mockResolvedValue(Crashes);
    render(
      <div>
        <p>Rest of the page</p>
        <RemoteWidget id="caseStudies/BundleChart" props={{ data: { unit: "KB (gzip)", chunks: [] } }} label="The chart" minHeight={100} lazy={false} />
      </div>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("The chart crashed.");
    expect(screen.getByText("Rest of the page")).toBeInTheDocument();
  });

});
