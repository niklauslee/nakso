/*
 * Copyright (c) 2022 MKLabs. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of MKLabs. The intellectual and technical concepts
 * contained herein are proprietary to MKLabs and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from MKLabs (niklaus.lee@gmail.com).
 */

const AUTO_SAVE_CHECK_INTERVAL = 1000; // 1s
const AUTO_SAVE_MAX_IDLE = 10000; // 10s

/**
 * Auto Saver
 */
export class AutoSaver {
  lastTransactionTime: number;
  modified: boolean;
  timer: any;
  saveFn: () => Promise<void>;

  constructor(saveFn: () => Promise<void>) {
    const now = Date.now();
    this.lastTransactionTime = now;
    this.modified = false;
    this.timer = setInterval(() => this.check(), AUTO_SAVE_CHECK_INTERVAL);
    this.saveFn = saveFn;
  }

  /**
   * Call this method whenever a transaction is made
   */
  tick() {
    this.lastTransactionTime = Date.now();
    this.modified = true;
  }

  /**
   * Check whether the file should be saved or not
   */
  async check() {
    const now = Date.now();
    if (this.modified && now - this.lastTransactionTime > AUTO_SAVE_MAX_IDLE) {
      await this.save();
    }
  }

  async save() {
    await this.saveFn();
    this.modified = false;
  }
}
