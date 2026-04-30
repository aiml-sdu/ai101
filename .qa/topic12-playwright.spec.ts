import { expect, test, type Page } from '@playwright/test';

const BASE_URL = process.env.AI101_BASE_URL ?? 'http://127.0.0.1:3000/ai101/#/topic-12';
const OUT = '.qa/screenshots/topic12';

async function assertHealthyRender(page: Page, requireLargeSvg = true) {
  await expect(page.locator('h2').first()).toBeVisible();

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    body: document.body.scrollWidth,
    doc: document.documentElement.scrollWidth,
  }));
  expect(Math.max(overflow.body, overflow.doc)).toBeLessThanOrEqual(overflow.viewport + 2);

  if (requireLargeSvg) {
    const visibleSvgCount = await page.locator('svg').evaluateAll((svgs) =>
      svgs.filter((svg) => {
        const rect = svg.getBoundingClientRect();
        return rect.width > 250 && rect.height > 120;
      }).length,
    );
    expect(visibleSvgCount).toBeGreaterThan(0);
  }
}

async function resetAndOpen(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (
        key.startsWith('lesson-t12-clustering') ||
        key.startsWith('quiz-t12') ||
        key.startsWith('visited-topic-12')
      ) {
        localStorage.removeItem(key);
      }
    }
  });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'body > canvas { display: none !important; }' });
  await expect(page.getByRole('heading', { name: 'How Many Clusters Are There?' })).toBeVisible();
}

async function screenshot(page: Page, name: string, requireLargeSvg = true, fullPage = true) {
  await expect(page.getByText('Loading interaction...')).toHaveCount(0, { timeout: 10000 });
  await page.waitForTimeout(350);
  await assertHealthyRender(page, requireLargeSvg);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
}

async function choose(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click();
}

async function submitQuizAnswer(page: Page, optionText: string) {
  await page.getByText(optionText, { exact: true }).click();
  await page.getByRole('button', { name: 'Submit' }).first().click();
}

async function continueLesson(page: Page, nextHeading?: string | RegExp) {
  await expect(page.getByRole('button', { name: /Continue|Finish/ })).toBeEnabled();
  await page.getByRole('button', { name: /Continue|Finish/ }).click();
  if (nextHeading) {
    await expect(page.getByRole('heading', { name: nextHeading })).toBeVisible();
  }
}

test.describe('Topic 12 clustering QA', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.exposeFunction('__topic12Errors', () => errors);
  });

  test('desktop lesson flow renders cleanly and completes with correct logic', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await resetAndOpen(page);

    await screenshot(page, 'desktop-01-ambiguity-before');
    await choose(page, '4 clusters quadrants / coarse regions');
    await choose(page, 'Reveal that interpretation');
    await expect(page.getByText('4 clusters can be reasonable here')).toBeVisible();
    await screenshot(page, 'desktop-02-ambiguity-revealed');
    await continueLesson(page, 'Pick the Right Clustering Mindset');

    await screenshot(page, 'desktop-03-families-partitional');
    await choose(page, 'Partitional Choose K and assign every point once');
    await choose(page, 'Check and continue');
    await expect(page.getByText('coarse and fine groupings')).toBeVisible();
    await choose(page, 'Hierarchical Use a tree that can be cut at many levels');
    await choose(page, 'Check and continue');
    await expect(page.getByText('weird shapes and scattered outliers')).toBeVisible();
    await choose(page, 'Density-based Trace dense neighborhoods and leave noise out');
    await choose(page, 'Check');
    await expect(page.getByText('Right family')).toBeVisible();
    await screenshot(page, 'desktop-04-families-complete');
    await continueLesson(page, 'Checkpoint: Seeing Structure');

    await submitQuizAnswer(page, 'Find groups with high similarity inside groups and low similarity between groups');
    await submitQuizAnswer(page, 'The same point cloud can support multiple useful groupings');
    await expect(page.getByText('Perfect!')).toBeVisible();
    await screenshot(page, 'desktop-05-seeing-quiz', false);
    await continueLesson(page, 'Be the K-Means Algorithm');
    await page.waitForTimeout(1200);

    await screenshot(page, 'desktop-06-kmeans-start');
    await choose(page, '1. Assign points');
    await expect(page.getByText('Assignment step')).toBeVisible();
    await choose(page, '2. Move centroids');
    await expect(page.getByText('Update step')).toBeVisible();
    await screenshot(page, 'desktop-07-kmeans-updated');
    await continueLesson(page, 'Choose K Without Overthinking It');

    await choose(page, 'K = 3 matches the three visible groups');
    await choose(page, 'Commit answer');
    await expect(page.getByText('K = 3 is the useful choice')).toBeVisible();
    await screenshot(page, 'desktop-08-choose-k');
    await continueLesson(page, 'Bad Starts, Bad Endings');

    await choose(page, 'Spread-out start one seed near each visible blob');
    await choose(page, 'Lock prediction');
    await expect(page.getByText('Right: initialization matters')).toBeVisible();
    await screenshot(page, 'desktop-09-initialization');
    await continueLesson(page, 'Checkpoint: K-Means');

    await submitQuizAnswer(page, 'Closest centroid');
    await submitQuizAnswer(page, 'It is sensitive to K and initial centroid positions');
    await expect(page.getByText('Perfect!')).toBeVisible();
    await continueLesson(page, 'Build the Tree from the Bottom Up');
    await page.waitForTimeout(1200);

    await screenshot(page, 'desktop-10-dendrogram-start');
    for (let i = 0; i < 5; i += 1) await choose(page, 'Merge closest pair');
    await expect(page.getByText('You built the hierarchy')).toBeVisible();
    await screenshot(page, 'desktop-11-dendrogram-complete');
    await continueLesson(page, 'Cut the Tree, Change the Story');

    await page.getByLabel('Dendrogram cut height').fill('120');
    await expect(page.getByText('cut gives 2 clusters')).toBeVisible();
    await screenshot(page, 'desktop-12-dendrogram-cut');
    await continueLesson(page, 'Find Dense Regions with DBSCAN');

    await page.getByLabel('Eps radius: 48').fill('60');
    await page.getByRole('button', { name: 'Trace density-connected path' }).click();
    await expect(page.getByText('DBSCAN does not need K')).toBeVisible();
    await screenshot(page, 'desktop-13-dbscan-tuned');
    await continueLesson(page, 'When Density Stops Helping');

    await choose(page, 'Case B different densities in different regions');
    await choose(page, 'DBSCAN is fragile here');
    await expect(page.getByText('Good diagnosis')).toBeVisible();
    await screenshot(page, 'desktop-14-dbscan-failure');
    await continueLesson(page, 'Which Clustering Would You Trust?');

    await choose(page, 'Trust A clusters are tighter and more separated');
    await choose(page, 'Reveal compactness scores');
    await expect(page.getByText('A separation')).toBeVisible();
    await expect(page.getByText('B separation')).toBeVisible();
    await screenshot(page, 'desktop-15-validity');
    await continueLesson(page, 'Final Check: Cluster Analysis');

    await submitQuizAnswer(page, 'Making each point its own cluster');
    await submitQuizAnswer(page, 'Has enough neighbors within Eps');
    await submitQuizAnswer(page, 'To avoid trusting patterns in noise and to compare clusterings');
    await expect(page.getByText('Perfect!')).toBeVisible();
    await screenshot(page, 'desktop-16-final-quiz', false);

    const errors = await page.evaluate(async () => window.__topic12Errors?.());
    expect(errors).toEqual([]);
  });

  test('mobile layout has no horizontal overflow on representative clustering states', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await resetAndOpen(page);

    await screenshot(page, 'mobile-01-ambiguity', true, false);
    await choose(page, '4 clusters quadrants / coarse regions');
    await choose(page, 'Reveal that interpretation');
    await screenshot(page, 'mobile-02-ambiguity-revealed', true, false);
    await continueLesson(page, 'Pick the Right Clustering Mindset');

    await choose(page, 'Partitional Choose K and assign every point once');
    await choose(page, 'Check and continue');
    await expect(page.getByText('coarse and fine groupings')).toBeVisible();
    await screenshot(page, 'mobile-03-families', true, false);
    await choose(page, 'Hierarchical Use a tree that can be cut at many levels');
    await choose(page, 'Check and continue');
    await expect(page.getByText('weird shapes and scattered outliers')).toBeVisible();
    await screenshot(page, 'mobile-04-density', true, false);

    const errors = await page.evaluate(async () => window.__topic12Errors?.());
    expect(errors).toEqual([]);
  });
});

declare global {
  interface Window {
    __topic12Errors?: () => string[];
  }
}
