'use client';

import { useState } from 'react';
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

// 周囲の地雷の数を数えるヘルパー関数
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
  currentRevealedMap: number[][], // このマップを直接変更します
  h: number,
  w: number,
): void => {
  // 1. 盤面の範囲外、または既に開かれている、または地雷のマスなら処理を終了
  if (
    r < 0 ||
    r >= h ||
    c < 0 ||
    c >= w ||
    currentRevealedMap[r][c] === 1 ||
    currentBombMap[r][c] === 1
  ) {
    // 地雷のマスはフラッドフィルでは開かない (直接クリックされた場合のみclickHandlerで開封)
    return;
  }

  // 2. セル (r, c) を開く
  currentRevealedMap[r][c] = 1;

  // 3. 開いたセル (r, c) の周囲の地雷の数を計算する
  const adjacentBombs = calculateAdjacentBombs(r, c, currentBombMap, h, w);

  // 4. もし周囲の地雷の数が 0 だったら、さらに周囲8方向のセルに対しても再帰的に呼び出す
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
  const clickHandler = (y: number, x: number): void => {
    let currentBombMap = bombMap;
    const isFirstClick = bombMap.flat().every((cell) => cell === 0);

    // console.log(`Cell clicked: (row=${y}, col=${x})`);

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

    // revealedMap の「深いコピー」を作成します。このコピーが変更対象です。
    const newRevealedMap = revealedMap.map((row) => [...row]);

    if (newRevealedMap[y][x] === 0) {
      // まだ開いていないセルなら

      if (currentBombMap[y][x] === 1) {
        // 地雷を踏んだか
        console.log(`BOOM! Cell (row=${y}, col=${x}) was a mine.`);
        // 地雷を踏んだ場合も、そのセルだけは開く (newRevealedMap を更新)
        newRevealedMap[y][x] = 1;
        // TODO: 本格的なゲームオーバー処理
      } else {
        // 安全なマスだった場合
        const adjacentBombs = calculateAdjacentBombs(y, x, currentBombMap, hight, width);
        console.log(
          `Safe! Cell (row=${y}, col=${x}) is not a mine. Adjacent bombs: ${adjacentBombs}`,
        );

        // クリックされたマスからフラッドフィルを開始
        // floodFillRecursive が newRevealedMap を直接変更します
        floodFillRecursive(y, x, currentBombMap, newRevealedMap, hight, width);
      }

      // 全ての開封処理が終わった後、最終的な newRevealedMap で state を更新
      setRevealedMap(newRevealedMap);
    } else {
      // すでに開いているセルがクリックされた場合
      console.log(`Cell (row=${y}, col=${x}) is already revealed.`);
    }
  };

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
                  cellClassName += ` ${styles[`revealed${adjacentBombs}`]}`;
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
