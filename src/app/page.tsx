'use client';

import { useState } from 'react';
import styles from './page.module.css';

const hight = 9;
const width = 9;
const Bomcount = 10;

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

export default function Home() {
  const [bombMap, setBombMap] = useState<number[][]>(() =>
    Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)),
  );
  const [revealedMap, setRevealedMap] = useState<number[][]>(() =>
    Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)),
  );
  const [gameState, setGameState] = useState<'playing' | 'gameOver' | 'win'>('playing');

  const clickHandler = (y: number, x: number): void => {
    // ゲームがプレイ中でなければ何もしない (ガード処理)
    if (gameState !== 'playing') {
      console.log('Game is not in "playing" state. No action.');
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
      // まだ開いていないセルなら
      if (currentBombMap[y][x] === 1) {
        // 地雷を踏んだ！
        console.log(`BOOM! Cell (row=${y}, col=${x}) was a mine.`);
        setGameState('gameOver'); // ゲーム状態を更新

        // 全ての地雷を開封済みにする
        for (let r = 0; r < hight; r++) {
          for (let c = 0; c < width; c++) {
            if (currentBombMap[r][c] === 1) {
              // currentBombMap を参照
              newRevealedMap[r][c] = 1;
            }
          }
        }
        newRevealedMap[y][x] = 1; // 踏んだ地雷も確実に開く
      } else {
        // 安全なマスだった場合
        console.log(`Cell (row=${y}, col=${x}) is safe. Attempting to reveal/flood fill...`);
        floodFillRecursive(y, x, currentBombMap, newRevealedMap, hight, width);
      }
      setRevealedMap(newRevealedMap); // 状態を一括更新
    } else {
      console.log(`Cell (row=${y}, col=${x}) is already revealed.`);
    }
  };

  // return (...) のJSX部分は変更ありません
  return (
    <div className={styles.container}>
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
                cellClassName += ` ${styles.hidden}`;
              }
              return (
                <div
                  key={`cell-${y}-${x}`}
                  className={cellClassName}
                  onClick={() => clickHandler(y, x)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
