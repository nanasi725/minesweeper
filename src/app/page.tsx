'use client';

import { useState } from 'react';
import styles from './page.module.css';

const hight = 9;
const width = 9;
const Bomcount = 10;

//8方向
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

const board: number[][] = Array.from({ length: hight }, () =>
  Array.from({ length: width }, () => 0),
);

export default function Home() {
  const [board, setBoard] = useState<number[][]>([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  const [,] = useState(0);

  const clickHandler = (x: number, y: number): void => {
    //const  = structuredClone(); [] += 1;(); (( + 1) % 14);
  };

  return (
    <div className={styles.container}>
      <div className={styles.board}>{/* style={{ backgroundPosition: `${-30 * }px` }} */}</div>
      <button onClick={clickHandler}>クリック</button>
    </div>
  );
}
