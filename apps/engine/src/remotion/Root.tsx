import { Composition } from 'remotion';
import { Video } from './Video';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FPS, DURATION_MS } from '../constants';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={Video}
        durationInFrames={Math.floor((DURATION_MS / 1000) * FPS)}
        fps={FPS}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        defaultProps={{
          seed: 123456,
          hook: 'WAIT FOR THE END 😳',
          midPrompt: 'BLUE or PINK? 👇',
          cta: 'Follow for Level 2 👀',
        }}
      />
    </>
  );
};
