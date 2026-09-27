import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProxyTabContent } from "@/components/settings/ProxyTabContent";
import type { SettingsFormState } from "@/hooks/useSettings";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/hooks/useProxyStatus", () => ({
  useProxyStatus: () => ({
    isRunning: false,
    takeoverStatus: {},
    startProxyServer: vi.fn(),
    stopWithRestore: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/components/proxy", () => ({
  ProxyPanel: () => <div data-testid="proxy-panel" />,
}));

vi.mock("@/components/proxy/AutoFailoverConfigPanel", () => ({
  AutoFailoverConfigPanel: () => <div data-testid="failover-panel" />,
}));

vi.mock("@/components/proxy/FailoverQueueManager", () => ({
  FailoverQueueManager: () => <div data-testid="failover-queue" />,
}));

vi.mock("@/components/settings/RectifierConfigPanel", () => ({
  RectifierConfigPanel: () => <div data-testid="rectifier-panel" />,
}));

vi.mock("@/components/settings/GlobalProxySettings", () => ({
  GlobalProxySettings: () => <div data-testid="global-proxy-settings" />,
}));

describe("ProxyTabContent - Insecure TLS", () => {
  const baseSettings: SettingsFormState = {
    showInTray: true,
    minimizeToTrayOnClose: true,
    allowInsecureTls: false,
    language: "zh",
  };

  it("renders certificate verification section and triggers confirmation dialog on toggle", async () => {
    const onAutoSaveMock = vi.fn().mockResolvedValue(true);

    render(
      <ProxyTabContent
        settings={baseSettings}
        onAutoSave={onAutoSaveMock}
      />
    );

    // Accordion trigger for insecureTls
    const trigger = screen.getByText("settings.advanced.insecureTls.title");
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    // Switch should be unchecked initially
    const switchControl = screen.getByLabelText(
      "settings.advanced.insecureTls.toggleTitle"
    );
    expect(switchControl).not.toBeChecked();

    // Toggle on -> should open confirmation dialog
    fireEvent.click(switchControl);

    // Confirm dialog should appear
    expect(
      screen.getByText("confirm.insecureTls.title")
    ).toBeInTheDocument();

    // Confirm action
    const confirmButton = screen.getByText("confirm.insecureTls.confirm");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onAutoSaveMock).toHaveBeenCalledWith({ allowInsecureTls: true });
    });
  });

  it("directly saves when disabling insecure TLS without prompt", async () => {
    const onAutoSaveMock = vi.fn().mockResolvedValue(true);

    render(
      <ProxyTabContent
        settings={{ ...baseSettings, allowInsecureTls: true }}
        onAutoSave={onAutoSaveMock}
      />
    );

    const trigger = screen.getByText("settings.advanced.insecureTls.title");
    fireEvent.click(trigger);

    const switchControl = screen.getByLabelText(
      "settings.advanced.insecureTls.toggleTitle"
    );
    expect(switchControl).toBeChecked();

    // Toggle off -> directly autosaves false
    fireEvent.click(switchControl);

    await waitFor(() => {
      expect(onAutoSaveMock).toHaveBeenCalledWith({ allowInsecureTls: false });
    });
  });
});
