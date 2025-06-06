'use client';

// Reactフックをインポート
import { useCallback, useEffect, useState } from 'react';
// CSSモジュールをインポート
import styles from './page.module.css';

// 8方向の相対座標
const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

// 難易度設定
const DIFFICULTY_LEVELS = {
  easy: { hight: 9, width: 9, Bomcount: 10 },
  medium: { hight: 16, width: 16, Bomcount: 40 },
  hard: { hight: 16, width: 30, Bomcount: 99 },
};

// --- ヘルパー関数群 ---

// 周囲の地雷の数を数える関数
const calculateAdjacentBombs = (
  r: number,
  c: number,
  currentBombMap: number[][],
  h: number,
  w: number,
): number => {
  let count = 0;
  directions.forEach(([dr, dc]) => {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < h && nc >= 0 && nc < w) {
      if (currentBombMap[nr][nc] === 1) {
        count++;
      }
    }
  });
  return count;
};

// フラッドフィル（連鎖開封）のための再帰関数
const floodFillRecursive = (
  r: number,
  c: number,
  currentBombMap: number[][],
  currentRevealedMap: number[][],
  h: number,
  w: number,
): void => {
  if (
    r < 0 ||
    r >= h ||
    c < 0 ||
    c >= w ||
    currentRevealedMap[r][c] === 1 ||
    currentBombMap[r][c] === 1
  ) {
    return;
  }
  currentRevealedMap[r][c] = 1;
  const adjacentBombs = calculateAdjacentBombs(r, c, currentBombMap, h, w);
  if (adjacentBombs === 0) {
    directions.forEach(([dr, dc]) => {
      floodFillRecursive(r + dr, c + dc, currentBombMap, currentRevealedMap, h, w);
    });
  }
};

// ゲームクリア条件を判定する関数
const checkWinCondition = (
  currentBombMap: number[][],
  currentRevealedMap: number[][],
  h: number,
  w: number,
): boolean => {
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (currentBombMap[r][c] === 0 && currentRevealedMap[r][c] === 0) {
        return false;
      }
    }
  }
  return true;
};

// --- メインのReactコンポーネント ---
export default function Home() {
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.easy);

  // --- 状態変数の宣言 ---
  const [bombMap, setBombMap] = useState<number[][]>(() =>
    Array.from({ length: difficulty.hight }, () =>
      Array.from({ length: difficulty.width }, () => 0),
    ),
  );
  const [revealedMap, setRevealedMap] = useState<number[][]>(() =>
    Array.from({ length: difficulty.hight }, () =>
      Array.from({ length: difficulty.width }, () => 0),
    ),
  );
  const [userInputMap, setUserInputMap] = useState<number[][]>(() =>
    Array.from({ length: difficulty.hight }, () =>
      Array.from({ length: difficulty.width }, () => 0),
    ),
  );
  const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'win'>('playing');
  const [time, setTime] = useState<number>(0);

  // カスタム設定の入力値を保持する状態
  const [customHeight, setCustomHeight] = useState(DIFFICULTY_LEVELS.easy.hight);
  const [customWidth, setCustomWidth] = useState(DIFFICULTY_LEVELS.easy.width);
  const [customBombs, setCustomBombs] = useState(DIFFICULTY_LEVELS.easy.Bomcount);

  // --- イベントハンドラとその他の関数 ---

  // ゲームをリセットする関数 (useCallbackでメモ化)
  const resetGame = useCallback(() => {
    console.log('Resetting the game...');
    setBombMap(
      Array.from({ length: difficulty.hight }, () =>
        Array.from({ length: difficulty.width }, () => 0),
      ),
    );
    setRevealedMap(
      Array.from({ length: difficulty.hight }, () =>
        Array.from({ length: difficulty.width }, () => 0),
      ),
    );
    setUserInputMap(
      Array.from({ length: difficulty.hight }, () =>
        Array.from({ length: difficulty.width }, () => 0),
      ),
    );
    setGameState('playing');
    setTime(0);
  }, [difficulty]);

  // --- エフェクトフック ---

  // タイマー用のuseEffect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    // 最初のクリックが終わってからタイマーを開始
    if (gameState === 'playing' && !bombMap.flat().every((cell) => cell === 0)) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameState, bombMap]);

  // 難易度変更時にリセットするためのuseEffect
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // 難易度を変更する関数
  const changeDifficulty = (level: keyof typeof DIFFICULTY_LEVELS) => {
    setDifficulty(DIFFICULTY_LEVELS[level]);
  };

  // カスタム設定を適用する関数
  const handleApplyCustom = () => {
    if (customBombs >= customHeight * customWidth) {
      alert('地雷の数がセルの総数より多すぎます！');
      return;
    }
    const newCustomDifficulty = {
      hight: customHeight,
      width: customWidth,
      Bomcount: customBombs,
    };
    setDifficulty(newCustomDifficulty);
    console.log('Applying custom settings:', newCustomDifficulty);
  };

  // 左クリック時のハンドラ
  const clickHandler = (y: number, x: number): void => {
    if (gameState !== 'playing' || userInputMap[y][x] === 1) {
      return;
    }

    let currentBombMap = bombMap;
    const isFirstClick = bombMap.flat().every((cell) => cell === 0);

    if (isFirstClick) {
      const newBombMap = Array.from({ length: difficulty.hight }, () =>
        Array.from({ length: difficulty.width }, () => 0),
      );
      let bombsToPlace = difficulty.Bomcount;
      while (bombsToPlace > 0) {
        const rY = Math.floor(Math.random() * difficulty.hight);
        const rX = Math.floor(Math.random() * difficulty.width);
        if (newBombMap[rY][rX] === 0 && (rY !== y || rX !== x)) {
          newBombMap[rY][rX] = 1;
          bombsToPlace--;
        }
      }
      setBombMap(newBombMap);
      currentBombMap = newBombMap;
    }

    const newRevealedMap = revealedMap.map((row) => [...row]);

    if (newRevealedMap[y][x] === 0) {
      if (currentBombMap[y][x] === 1) {
        setGameState('gameOver');
        for (let r = 0; r < difficulty.hight; r++) {
          for (let c = 0; c < difficulty.width; c++) {
            if (currentBombMap[r][c] === 1) {
              newRevealedMap[r][c] = 1;
            }
          }
        }
      } else {
        floodFillRecursive(
          y,
          x,
          currentBombMap,
          newRevealedMap,
          difficulty.hight,
          difficulty.width,
        );
        const gameWon = checkWinCondition(
          currentBombMap,
          newRevealedMap,
          difficulty.hight,
          difficulty.width,
        );
        if (gameWon) {
          setGameState('win');
          console.log('Congratulations! You won the game!');
        }
      }
      setRevealedMap(newRevealedMap);
    }
  };

  // 右クリック時のハンドラ
  const rightClickHandler = (y: number, x: number, e: React.MouseEvent): void => {
    e.preventDefault();
    if (gameState !== 'playing' || revealedMap[y][x] === 1) {
      return;
    }
    const newUserInputMap = userInputMap.map((row) => [...row]);
    const nextUserInput = (newUserInputMap[y][x] + 1) % 3;
    newUserInputMap[y][x] = nextUserInput;
    setUserInputMap(newUserInputMap);
  };

  // 描画のための計算
  const flagCount = userInputMap.flat().filter((input) => input === 1).length;
  const remainingBombs = difficulty.Bomcount - flagCount;

  return (
    <div className={styles.container}>
      <div className={styles.difficultySelector}>
        <button onClick={() => changeDifficulty('easy')}>初級</button>
        <button onClick={() => changeDifficulty('medium')}>中級</button>
        <button onClick={() => changeDifficulty('hard')}>上級</button>
      </div>

      <div className={styles.customSettings}>
        <label>
          高さ:
          <input
            type="number"
            value={customHeight}
            onChange={(e) => setCustomHeight(parseInt(e.target.value, 10))}
          />
        </label>
        <label>
          幅:
          <input
            type="number"
            value={customWidth}
            onChange={(e) => setCustomWidth(parseInt(e.target.value, 10))}
          />
        </label>
        <label>
          地雷:
          <input
            type="number"
            value={customBombs}
            onChange={(e) => setCustomBombs(parseInt(e.target.value, 10))}
          />
        </label>
        <button onClick={handleApplyCustom}>カスタムで開始</button>
      </div>

      <div className={styles.header}>
        <div>残り地雷: {remainingBombs}</div>
        <button className={styles.resetButton} onClick={resetGame}>
          <div
            className={`${styles.smiley} ${
              gameState === 'win'
                ? styles.smileyWin
                : gameState === 'gameOver'
                  ? styles.smileyLose
                  : styles.smileyPlaying
            }`}
          />
        </button>
        <div>時間: {time}</div>
      </div>

      <div className={styles.bomMap} style={{ width: difficulty.width * 36 }}>
        {bombMap.map((row, y) => (
          <div key={`row-${y}`} className={styles.row}>
            {row.map((cellValueInBombMap, x) => {
              const isRevealed = revealedMap[y][x] === 1;
              let cellClassName = styles.cell;

              if (isRevealed) {
                if (cellValueInBombMap === 1) {
                  cellClassName += ` ${styles.revealedBomb}`;
                } else {
                  const adjacentBombs = calculateAdjacentBombs(
                    y,
                    x,
                    bombMap,
                    difficulty.hight,
                    difficulty.width,
                  );
                  switch (adjacentBombs) {
                    case 0:
                      cellClassName += ` ${styles.revealed0}`;
                      break;
                    case 1:
                      cellClassName += ` ${styles.revealed1}`;
                      break;
                    case 2:
                      cellClassName += ` ${styles.revealed2}`;
                      break;
                    case 3:
                      cellClassName += ` ${styles.revealed3}`;
                      break;
                    case 4:
                      cellClassName += ` ${styles.revealed4}`;
                      break;
                    case 5:
                      cellClassName += ` ${styles.revealed5}`;
                      break;
                    case 6:
                      cellClassName += ` ${styles.revealed6}`;
                      break;
                    case 7:
                      cellClassName += ` ${styles.revealed7}`;
                      break;
                    case 8:
                      cellClassName += ` ${styles.revealed8}`;
                      break;
                  }
                }
              } else {
                const userInputState = userInputMap[y][x];
                if (userInputState === 1) {
                  cellClassName += ` ${styles.flagged}`;
                } else if (userInputState === 2) {
                  cellClassName += ` ${styles.question}`;
                } else {
                  cellClassName += ` ${styles.hidden}`;
                }
              }
              return (
                <div
                  key={`cell-${y}-${x}`}
                  className={cellClassName}
                  onClick={() => clickHandler(y, x)}
                  onContextMenu={(e) => rightClickHandler(y, x, e)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
