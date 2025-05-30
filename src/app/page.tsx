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

export default function Home() {
  const [bombMap, setBombMap] = useState<number[][]>(() =>
    Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)),
  );
  const [revealedMap, setRevealedMap] = useState<number[][]>(() =>
    Array.from({ length: hight }, () => Array.from({ length: width }, () => 0)),
  );

  // clickHandler (周囲の地雷数をコンソールに出力するまで)
  const clickHandler = (y: number, x: number): void => {
    let currentBombMap = bombMap;
    const isFirstClick = bombMap.flat().every((cell) => cell === 0);

    console.log(`Cell clicked: (row=${y}, col=${x})`);

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

    if (revealedMap[y][x] === 0) {
      const newRevealedMap = revealedMap.map((rowArr, rowIndex) =>
        rowArr.map((cell, colIndex) => {
          if (rowIndex === y && colIndex === x) {
            return 1;
          }
          return cell;
        }),
      );
      setRevealedMap(newRevealedMap);

      if (currentBombMap[y][x] === 1) {
        console.log(`BOOM! Cell (row=${y}, col=${x}) was a mine.`);
        // TODO: ゲームオーバー処理
      } else {
        const adjacentBombs = calculateAdjacentBombs(y, x, currentBombMap, hight, width);
        console.log(
          `Safe! Cell (row=${y}, col=${x}) is not a mine. Adjacent bombs: ${adjacentBombs}`,
        );
        // TODO: (オプション) adjacentBombs === 0 の場合のフラッドフィル処理
      }
    } else {
      console.log(`Cell (row=${y}, col=${x}) is already revealed.`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bomMap}>
        {bombMap.map((row, y) => (
          <div key={`row-${y}`} className={styles.row}>
            {row.map((cellValueInBombMap, x) => {
              // cellValueInBombMap は bombMap[y][x]
              const isRevealed = revealedMap[y][x] === 1;
              let cellClassName = styles.cell;

              if (isRevealed) {
                // セルが開かれている場合
                if (cellValueInBombMap === 1) {
                  // 地雷のマス
                  cellClassName += ` ${styles.revealedBomb}`;
                } else {
                  // 安全なマス
                  // 周囲の地雷の数を計算 (JSXの描画時には最新のbombMap stateを参照)
                  const adjacentBombs = calculateAdjacentBombs(y, x, bombMap, hight, width);
                  // 数字に応じたCSSクラスを追加 (例: styles.revealed0, styles.revealed1)
                  cellClassName += ` ${styles[`revealed${adjacentBombs}`]}`;
                }
              } else {
                // 未開封のマス
                cellClassName += ` ${styles.hidden}`;
                // TODO: 将来的には、ここに旗や「？」マークの状態も加味
              }

              return (
                <div
                  key={`cell-${y}-${x}`}
                  className={cellClassName} // 計算したクラス名を適用
                  onClick={() => clickHandler(y, x)}
                >
                  {/* セルの中のテキスト表示は空にします (表示はCSSの背景画像が担当) */}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
