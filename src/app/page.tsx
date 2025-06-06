'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

const hight = 9;
const width = 9;
const Bomcount = 10;

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

// ヘルパー関数群
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

export default function Home() {
  // --- 状態変数の宣言 ---
  const [bombMap, setBombMap] = useState<number[][]>(() =>
    Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)),
  );
  const [revealedMap, setRevealedMap] = useState<number[][]>(() =>
    Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)),
  );
  const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'win'>('playing');
  const [userInputMap, setUserInputMap] = useState<number[][]>(() =>
    Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)),
  );
  const [time, setTime] = useState<number>(0); // タイマー用の状態
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;

    // ゲームがプレイ中の場合のみタイマーを動かす
    if (gameState === 'playing' && !bombMap.flat().every((cell) => cell === 0)) {
      // isFirstClick と逆の条件
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    // クリーンアップ関数
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameState, bombMap]); // gameState または bombMap が変化したときに再実行

  // --- イベントハンドラとその他の関数 ---
  const resetGame = () => {
    console.log('Resetting the game...');
    setBombMap(Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)));
    setRevealedMap(Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)));
    setUserInputMap(Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)));
    setGameState('playing');
    // ★修正点3★ time もリセットします
    setTime(0);
  };

  const clickHandler = (y: number, x: number): void => {
    if (gameState !== 'playing') {
      return;
    }
    if (userInputMap[y][x] === 1) {
      return;
    }

    let currentBombMap = bombMap;
    const isFirstClick = bombMap.flat().every((cell) => cell === 0);

    if (isFirstClick) {
      console.log('This is the first click! Preparing to generate bombs...');
      const newBombMap = Array.from({ length: hight }, () =>
        Array.from({ length: width }, () => 0),
      );
      let bombsToPlace = Bomcount;
      while (bombsToPlace > 0) {
        const rY = Math.floor(Math.random() * hight);
        const rX = Math.floor(Math.random() * width);
        if (newBombMap[rY][rX] === 0 && (rY !== y || rX !== x)) {
          newBombMap[rY][rX] = 1;
          bombsToPlace--;
        }
      }
      setBombMap(newBombMap);
      currentBombMap = newBombMap;
      console.log('Bombs have been generated and set!');
    }

    const newRevealedMap = revealedMap.map((row) => [...row]);
    if (newRevealedMap[y][x] === 0) {
      if (currentBombMap[y][x] === 1) {
        console.log(`BOOM! Cell (row=${y}, col=${x}) was a mine.`);
        setGameState('gameOver');
        for (let r = 0; r < hight; r++) {
          for (let c = 0; c < width; c++) {
            if (currentBombMap[r][c] === 1) {
              newRevealedMap[r][c] = 1;
            }
          }
        }
      } else {
        floodFillRecursive(y, x, currentBombMap, newRevealedMap, hight, width);
        const gameWon = checkWinCondition(currentBombMap, newRevealedMap, hight, width);
        if (gameWon) {
          setGameState('win');
          console.log('Congratulations! You won the game!');
        }
      }
      setRevealedMap(newRevealedMap);
    } else {
      console.log(`Cell (row=${y}, col=${x}) is already revealed.`);
    }
  };

  const rightClickHandler = (y: number, x: number, e: React.MouseEvent): void => {
    e.preventDefault();
    if (gameState !== 'playing' || revealedMap[y][x] === 1) {
      return;
    }
    const newUserInputMap = userInputMap.map((row) => [...row]);
    const nextUserInput = (newUserInputMap[y][x] + 1) % 3;
    newUserInputMap[y][x] = nextUserInput;
    setUserInputMap(newUserInputMap);
    // console.log(`Right-clicked on cell (row=${y}, col=${x})`); // デバッグ用
  };

  const flagCount = userInputMap.flat().filter((input) => input === 1).length;
  const remainingBombs = Bomcount - flagCount;

  return (
    <div className={styles.container}>
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
      <div className={styles.bomMap}>
        {bombMap.map((row, y) => (
          <div key={`row-${y}`} className={styles.row}>
            {row.map((cellValueInBombMap, x) => {
              const isRevealed = revealedMap[y][x] === 1;
              let cellClassName = styles.cell;
              if (isRevealed) {
                if (cellValueInBombMap === 1) {
                  cellClassName += ` ${styles.revealedBomb}`;
                } else {
                  const adjacentBombs = calculateAdjacentBombs(y, x, bombMap, hight, width);
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
