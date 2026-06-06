import { describe, expect, it } from "vitest";
import { escapeHtml, safeUrl, validateNotifyPayload } from "../../api/_utils/security.js";

describe("server security helpers", () => {
  it("escapes HTML-sensitive characters", () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;",
    );
  });

  it("allows https URLs and rejects script/data URLs", () => {
    expect(safeUrl("https://mekarhub.id/kisah/test")).toBe("https://mekarhub.id/kisah/test");
    expect(safeUrl("javascript:alert(1)")).toBe("");
    expect(safeUrl("data:text/html;base64,abc")).toBe("");
    expect(safeUrl("not a url")).toBe("");
  });

  it("validates notify-admin required payload fields", () => {
    const invalid = validateNotifyPayload({ nama: "Tester" });
    expect(invalid.valid).toBe(false);
    expect(invalid.missingFields).toContain("whatsapp");

    const valid = validateNotifyPayload({
      nama: "Tester",
      jabatan: "QA",
      whatsapp: "081234567890",
      lokasi: "Malang",
      deskripsiUsaha: "Usaha",
      momenBerkesan: "Momen",
      harapan: "Harapan",
    });
    expect(valid.valid).toBe(true);
    expect(valid.data.nama).toBe("Tester");
  });
});
