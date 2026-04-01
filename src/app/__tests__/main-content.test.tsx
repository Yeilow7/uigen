import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock all child components to isolate toggle behavior
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Actions</div>,
}));

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div data-testid="resize-handle" />,
}));

afterEach(() => {
  cleanup();
});

test("renders Preview tab as active by default", () => {
  render(<MainContent />);
  const previewButton = screen.getByRole("button", { name: "Preview" });
  const codeButton = screen.getByRole("button", { name: "Code" });
  expect(previewButton).toBeDefined();
  expect(codeButton).toBeDefined();
  // Preview frame should be visible
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  // Code editor should not be visible
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking Code button switches to code view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const codeButton = screen.getByRole("button", { name: "Code" });
  await user.click(codeButton);

  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();
});

test("clicking Preview button switches back to preview view", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Switch to code
  await user.click(screen.getByRole("button", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to preview
  await user.click(screen.getByRole("button", { name: "Preview" }));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("toggle buttons can be clicked multiple times reliably", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Rapid toggling
  for (let i = 0; i < 3; i++) {
    await user.click(screen.getByRole("button", { name: "Code" }));
    expect(screen.getByTestId("code-editor")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Preview" }));
    expect(screen.getByTestId("preview-frame")).toBeDefined();
  }
});
