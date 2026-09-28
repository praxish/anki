// Copyright: Ankitects Pty Ltd and contributors
// License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html

import { GraphsResponse, GraphsResponse_ReviewCountsAndTimes_Reviews } from "@generated/anki/stats_pb";

import { expect, test } from "./fixtures";

for (
    const { title, hidden } of [
        { title: "Future Due", hidden: false },
        { title: "Future Due", hidden: true },
        { title: "Reviews", hidden: false },
    ]
) {
    test(`${hidden ? "hidden" : "visible"} ${title} tooltips do not widen the page after resizing`, async (
        { page },
        testInfo,
    ) => {
        await page.route("**/_anki/graphs", async (route) => {
            const response = await route.fetch();
            const data = GraphsResponse.fromBinary(new Uint8Array(await response.body()));
            // Populate a graph without depending on cards left by other tests.
            data.futureDue!.futureDue = { 1: 1, 30: 1 };
            data.reviews!.count = {
                0: new GraphsResponse_ReviewCountsAndTimes_Reviews({
                    learn: 1_000_000,
                    relearn: 1_000_000,
                    young: 1_000_000,
                    mature: 1_000_000,
                    filtered: 1_000_000,
                }),
            };
            await route.fulfill({ response, body: Buffer.from(data.toBinary()) });
        });
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto("/graphs");

        const graph = page.locator(".container").filter({
            has: page.getByRole("heading", { name: title, exact: true }),
        });
        const bar = graph.locator(".hover-columns rect:visible").last();
        const tooltip = page.locator(".tooltip");

        async function revealTooltip(): Promise<void> {
            await expect(bar).toBeVisible();
            await bar.scrollIntoViewIfNeeded();
            // Keep the pointer stationary during resize, as with a touch tooltip.
            await bar.evaluate((element) => {
                const bounds = element.getBoundingClientRect();
                element.dispatchEvent(
                    new MouseEvent("mousemove", {
                        bubbles: true,
                        clientX: bounds.right - 1,
                        clientY: bounds.top + bounds.height / 2,
                    }),
                );
            });
            await expect(tooltip).toBeVisible();
            await expect(tooltip).toHaveCSS("opacity", "1");
            await expect(tooltip).toContainText("Running total");
            if (title === "Reviews") {
                await expect(tooltip.locator("table")).toBeVisible();
            }
        }

        async function expectNoOverflow(): Promise<void> {
            await expect.poll(() =>
                page.evaluate(() => {
                    const documentElement = document.documentElement;
                    return documentElement.scrollWidth - documentElement.clientWidth;
                })
            ).toBeLessThanOrEqual(1);
        }

        async function expectTooltipFits(): Promise<void> {
            await expect.poll(() =>
                tooltip.evaluate((element) => {
                    const bounds = element.getBoundingClientRect();
                    return Math.max(-bounds.left, bounds.right - document.documentElement.clientWidth);
                })
            ).toBeLessThanOrEqual(1);
        }

        async function capture(name: string): Promise<void> {
            const path = testInfo.outputPath(`${name}.png`);
            await page.screenshot({ path });
            await testInfo.attach(name, { path, contentType: "image/png" });
        }

        await revealTooltip();
        await expectTooltipFits();
        await expectNoOverflow();
        await capture("before-resize");

        for (const width of [700, 360]) {
            if (hidden) {
                await bar.dispatchEvent("mouseout");
                await expect(tooltip).toHaveCSS("opacity", "0");
            }

            await page.setViewportSize({ width, height: 800 });
            await expectNoOverflow();
            if (!hidden) {
                await expect(tooltip).toHaveCSS("opacity", "1");
                await expectTooltipFits();
            }
            await capture(`after-resize-${width}`);

            await bar.dispatchEvent("mouseout");
            await expect(tooltip).toHaveCSS("opacity", "0");
            await revealTooltip();
            await expectTooltipFits();
            await expectNoOverflow();
        }
    });
}
