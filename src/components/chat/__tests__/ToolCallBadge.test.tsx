import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeToolInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "result",
  result: unknown = "Success"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "test", toolName, args, state, result };
  }
  return { toolCallId: "test", toolName, args, state };
}

test("str_replace_editor create shows Creating label", () => {
  render(
    <ToolCallBadge
      tool={makeToolInvocation("str_replace_editor", {
        command: "create",
        path: "/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing label", () => {
  render(
    <ToolCallBadge
      tool={makeToolInvocation("str_replace_editor", {
        command: "str_replace",
        path: "/components/Card.tsx",
      })}
    />
  );
  expect(screen.getByText("Editing /components/Card.tsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing label", () => {
  render(
    <ToolCallBadge
      tool={makeToolInvocation("str_replace_editor", {
        command: "insert",
        path: "/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("str_replace_editor view shows Reading label", () => {
  render(
    <ToolCallBadge
      tool={makeToolInvocation("str_replace_editor", {
        command: "view",
        path: "/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Reading /App.jsx")).toBeDefined();
});

test("file_manager rename shows Renaming label", () => {
  render(
    <ToolCallBadge
      tool={makeToolInvocation("file_manager", {
        command: "rename",
        path: "/old.tsx",
        new_path: "/new.tsx",
      })}
    />
  );
  expect(screen.getByText("Renaming /old.tsx → /new.tsx")).toBeDefined();
});

test("file_manager delete shows Deleting label", () => {
  render(
    <ToolCallBadge
      tool={makeToolInvocation("file_manager", {
        command: "delete",
        path: "/App.jsx",
      })}
    />
  );
  expect(screen.getByText("Deleting /App.jsx")).toBeDefined();
});

test("unknown tool falls back to raw tool name", () => {
  render(
    <ToolCallBadge
      tool={makeToolInvocation("some_unknown_tool", {})}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("missing args falls back to raw tool name", () => {
  render(
    <ToolCallBadge
      tool={makeToolInvocation("str_replace_editor", {})}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("completed tool shows green dot", () => {
  const { container } = render(
    <ToolCallBadge
      tool={makeToolInvocation(
        "str_replace_editor",
        { command: "create", path: "/App.jsx" },
        "result",
        "Success"
      )}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("in-progress tool shows spinner", () => {
  const { container } = render(
    <ToolCallBadge
      tool={makeToolInvocation(
        "str_replace_editor",
        { command: "create", path: "/App.jsx" },
        "call"
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
