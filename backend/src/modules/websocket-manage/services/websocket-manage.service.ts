import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import * as net from 'net';

const execAsync = promisify(exec);

@Injectable()
export class WebSocketManageService {
  private readonly wsManageToken: string;
  private readonly runtimeDir: string;

  constructor(private readonly configService: ConfigService) {
    this.wsManageToken = this.configService.get<string>('app.wsManageToken') || '';
    this.runtimeDir = join(process.cwd(), 'runtime');
  }

  /**
   * Get PID file path
   */
  private pidFile(): string {
    return join(this.runtimeDir, 'websocket.pid');
  }

  /**
   * Save PID to file
   */
  private savePid(pid: number): void {
    if (pid > 0) {
      try {
        if (!existsSync(this.runtimeDir)) {
          const fs = require('fs');
          fs.mkdirSync(this.runtimeDir, { recursive: true });
        }
        writeFileSync(this.pidFile(), pid.toString());
      } catch (error) {
        // Ignore file write errors
      }
    }
  }

  /**
   * Read PID from file
   */
  private readPid(): number {
    try {
      if (existsSync(this.pidFile())) {
        const content = readFileSync(this.pidFile(), 'utf8');
        return parseInt(content.trim(), 10) || 0;
      }
    } catch (error) {
      // Ignore file read errors
    }
    return 0;
  }

  /**
   * Authenticate request
   */
  authenticate(token: string | undefined): boolean {
    return !!(token && token === this.wsManageToken);
  }

  /**
   * Quick execute command with timeout
   */
  private async quickExec(cmd: string, timeoutMs: number = 800): Promise<string> {
    try {
      const { stdout } = await Promise.race([
        execAsync(cmd, { timeout: timeoutMs }),
        new Promise<{ stdout: string; stderr: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs),
        ),
      ]);
      return stdout.trim();
    } catch (error) {
      return '';
    }
  }

  /**
   * Check if port is open
   */
  private async portOpen(port: number, retries: number = 5, intervalMs: number = 150): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        const socket = new net.Socket();
        const connected = await new Promise<boolean>((resolve) => {
          socket.setTimeout(120);
          socket.once('connect', () => {
            socket.destroy();
            resolve(true);
          });
          socket.once('timeout', () => {
            socket.destroy();
            resolve(false);
          });
          socket.once('error', () => {
            resolve(false);
          });
          socket.connect(port, '127.0.0.1');
        });
        if (connected) return true;
      } catch (error) {
        // Continue to next retry
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return false;
  }

  /**
   * Check if process is running
   */
  private async processRunning(pid: number): Promise<boolean> {
    if (pid <= 0) return false;
    try {
      // Try to send signal 0 (doesn't kill, just checks if process exists)
      process.kill(pid, 0);
      return true;
    } catch (error) {
      // Process doesn't exist
      return false;
    }
  }

  /**
   * Get PIDs listening on port
   */
  private async pidsOnPort(port: number): Promise<number[]> {
    try {
      const isWindows = process.platform === 'win32';
      let cmd: string;
      
      if (isWindows) {
        cmd = `netstat -ano | findstr :${port} | findstr LISTENING`;
      } else {
        cmd = `lsof -t -i tcp:${port} -sTCP:LISTEN 2>/dev/null`;
      }
      
      const output = await this.quickExec(cmd, 1000);
      if (!output) return [];
      
      if (isWindows) {
        // Parse Windows netstat output
        const lines = output.split('\n');
        const pids: number[] = [];
        for (const line of lines) {
          const match = line.match(/\s+(\d+)$/);
          if (match) {
            const pid = parseInt(match[1], 10);
            if (pid > 0) pids.push(pid);
          }
        }
        return Array.from(new Set(pids));
      } else {
        // Parse Unix lsof output
        const pids = output
          .split(/\s+/)
          .map((p) => parseInt(p, 10))
          .filter((p) => !isNaN(p) && p > 0);
        return Array.from(new Set(pids));
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * Start WebSocket server
   */
  async start(port: number = 8092): Promise<any> {
    if (port < 1024 || port > 65535) {
      throw new BadRequestException('Invalid port');
    }

    // If port already listening, treat as running
    if (await this.portOpen(port, 1, 50)) {
      const pid = this.readPid();
      return {
        succeeded: true,
        message: 'Already running',
        pid: pid || null,
        port,
      };
    }

    // Note: In a real implementation, you would start your WebSocket server here
    // This is a placeholder - you'll need to implement the actual server startup
    // based on your WebSocket server implementation
    
    // For now, return a mock response
    // TODO: Implement actual WebSocket server startup
    const mockPid = Math.floor(Math.random() * 10000) + 1000;
    this.savePid(mockPid);

    // Wait briefly for socket bind
    if (!(await this.portOpen(port, 8, 180))) {
      return {
        succeeded: false,
        message: 'Failed to start',
        pid: null,
        port,
        debug: {
          pid_attempt: mockPid,
        },
      };
    }

    return {
      succeeded: true,
      message: 'Started',
      pid: mockPid || null,
      port,
    };
  }

  /**
   * Stop WebSocket server
   */
  async stop(port: number = 8092): Promise<any> {
    const pidFilePid = this.readPid();

    // Collect candidate PIDs: file PID + any listeners on port
    const portPids = await this.pidsOnPort(port);
    let targets = [pidFilePid, ...portPids].filter((p) => p > 0);
    targets = Array.from(new Set(targets));

    if (targets.length === 0) {
      try {
        if (existsSync(this.pidFile())) {
          unlinkSync(this.pidFile());
        }
      } catch (error) {
        // Ignore
      }
      return {
        succeeded: true,
        message: 'Already stopped',
      };
    }

    // Build child tree (1 level)
    let allTargets = [...targets];
    for (const tpid of targets) {
      try {
        const isWindows = process.platform === 'win32';
        let cmd: string;
        if (isWindows) {
          cmd = `wmic process where (ParentProcessId=${tpid}) get ProcessId /format:value`;
        } else {
          cmd = `pgrep -P ${tpid} 2>/dev/null`;
        }
        const children = await this.quickExec(cmd, 500);
        if (children) {
          const childPids = children
            .split(/\s+/)
            .map((c) => parseInt(c, 10))
            .filter((c) => !isNaN(c) && c > 0);
          allTargets.push(...childPids);
        }
      } catch (error) {
        // Ignore errors
      }
    }
    allTargets = Array.from(new Set(allTargets));

    // Kill function
    const killList = async (pids: number[], sig: NodeJS.Signals) => {
      for (const p of pids) {
        try {
          process.kill(p, sig);
        } catch (error) {
          // Ignore
        }
      }
    };

    // Escalation sequence
    await killList(allTargets, 'SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    let remaining: number[] = [];
    for (const p of allTargets) {
      if (await this.processRunning(p)) {
        remaining.push(p);
      }
    }

    if (remaining.length > 0) {
      await killList(remaining, 'SIGINT');
      await new Promise((resolve) => setTimeout(resolve, 200));
      remaining = [];
      for (const p of allTargets) {
        if (await this.processRunning(p)) {
          remaining.push(p);
        }
      }
    }

    if (remaining.length > 0) {
      await killList(remaining, 'SIGKILL');
      await new Promise((resolve) => setTimeout(resolve, 200));
      remaining = [];
      for (const p of allTargets) {
        if (await this.processRunning(p)) {
          remaining.push(p);
        }
      }
    }

    const stillListening = await this.portOpen(port, 1, 80);

    if (remaining.length === 0 && !stillListening) {
      try {
        if (existsSync(this.pidFile())) {
          unlinkSync(this.pidFile());
        }
      } catch (error) {
        // Ignore
      }
      return {
        succeeded: true,
        message: 'Stopped',
        killed: allTargets,
      };
    }

    return {
      succeeded: false,
      message: 'Failed to stop',
      pidFilePid: pidFilePid || null,
      attempted: allTargets,
      still_alive: remaining,
      port_listening: stillListening,
    };
  }

  /**
   * Get WebSocket server status
   */
  async status(port: number = 8092): Promise<any> {
    const pid = this.readPid();
    const running = (await this.processRunning(pid)) || (await this.portOpen(port, 1, 50));

    return {
      succeeded: true,
      running,
      pid: running ? (pid || null) : null,
      port,
    };
  }

  /**
   * Force kill processes on port
   */
  async forceKill(port: number = 8092): Promise<any> {
    const targets = await this.pidsOnPort(port);
    const pidFilePid = this.readPid();
    
    let allTargets = [...targets];
    if (pidFilePid > 0 && !targets.includes(pidFilePid)) {
      allTargets.push(pidFilePid);
    }
    allTargets = Array.from(new Set(allTargets.filter((p) => p > 0)));

    if (allTargets.length === 0) {
      return {
        succeeded: true,
        message: 'Port already free',
        port,
      };
    }

    const killed: number[] = [];
    let still = [...allTargets];

    const killFn = async (pids: number[], sig: NodeJS.Signals) => {
      for (const p of pids) {
        try {
          process.kill(p, sig);
        } catch (error) {
          // Ignore
        }
      }
    };

    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGKILL'];
    for (const sig of signals) {
      await killFn(still, sig);
      await new Promise((resolve) => setTimeout(resolve, 250));
      
      const after: number[] = [];
      for (const p of still) {
        if (await this.processRunning(p)) {
          after.push(p);
        } else {
          killed.push(p);
        }
      }
      still = after;
      if (still.length === 0) break;
    }

    const portStillListening = await this.portOpen(port, 1, 60);

    if (!portStillListening) {
      if (killed.includes(pidFilePid)) {
        try {
          if (existsSync(this.pidFile())) {
            unlinkSync(this.pidFile());
          }
        } catch (error) {
          // Ignore
        }
      }
      return {
        succeeded: true,
        message: 'Force kill completed',
        port,
        killed: Array.from(new Set(killed)),
        remaining: still,
      };
    }

    return {
      succeeded: false,
      message: 'Some processes still alive or port still bound',
      port,
      killed: Array.from(new Set(killed)),
      remaining: still,
      port_listening: portStillListening,
    };
  }
}
