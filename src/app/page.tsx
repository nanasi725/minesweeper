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

const BomMap: number[][] = Array.from({ length: hight }, () =>
  Array.from({ length: width }, () => 0),
);

let bombsPlaced = 0;
while (bombsPlaced < Bomcount){
  const randomY = Math.floor(Math.random() * hight);
  const randomX = Math.floor(Math.random() * width);

  if (BomMap[randomY][randomX] === 0){
    BomMap[randomY][randomX] = 1;
    bombsPlaced++;
  }
}



export default function Home() {
  const clickHandler = (x: number, y: number): void => {
    console.log(`Cell clicked: (${x}, ${y})`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.BomMap}>
        { style={{ backgroundPosition: `${-30 * }px` }} }</div>
      <button onClick={clickHandler}>クリック</button>
    </div>
  );
}
