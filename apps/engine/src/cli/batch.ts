import { generateSeed, DEFAULT_TEMPLATES, SeededRandom } from '@dopamine-orbs/shared';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BatchConfig {
  count: number;
  outputDir?: string;
  theme?: string;
  intensity?: number;
}

async function generateBatch(config: BatchConfig) {
  const { count = 30, outputDir = './outputs', theme = 'default', intensity = 0.5 } = config;
  
  const dateStr = new Date().toISOString().split('T')[0];
  const batchDir = path.join(outputDir, dateStr);
  await fs.mkdir(batchDir, { recursive: true });

  const random = new SeededRandom(generateSeed());
  const metadata: Array<{
    seed: number;
    filename: string;
    title: string;
    hook: string;
    midPrompt: string;
    cta: string;
    hashtags: string[];
  }> = [];

  console.log(`Generating ${count} videos...`);

  for (let i = 0; i < count; i++) {
    const seed = generateSeed();
    const filename = `video_${seed}.mp4`;
    const filepath = path.join(batchDir, filename);

    const hook = random.pick(DEFAULT_TEMPLATES.hooks);
    const midPrompt = random.pick(DEFAULT_TEMPLATES.midPrompts);
    const cta = random.pick(DEFAULT_TEMPLATES.ctas);
    const hashtags = [...DEFAULT_TEMPLATES.hashtags].sort(() => random.next() - 0.5).slice(0, 5);

    console.log(`Rendering ${i + 1}/${count}: ${filename} (seed: ${seed})`);

    // Render with Remotion
    try {
      await execAsync(
        `npx remotion render Video out/${filename} --props='{"seed":${seed},"hook":"${hook}","midPrompt":"${midPrompt}","cta":"${cta}"}'`,
        { cwd: path.resolve(__dirname, '../') }
      );

      // Move to output dir
      await fs.rename(path.join(__dirname, '../out', filename), filepath);
    } catch (error) {
      console.error(`Failed to render ${filename}:`, error);
      continue;
    }

    metadata.push({
      seed,
      filename,
      title: `Dopamine Orbs #${seed}`,
      hook,
      midPrompt,
      cta,
      hashtags,
    });
  }

  // Save metadata
  const metadataPath = path.join(batchDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n✅ Batch complete! Metadata saved to ${metadataPath}`);
}

// CLI
const args = process.argv.slice(2);
const count = parseInt(args[0] || '30', 10);

generateBatch({ count }).catch(console.error);
