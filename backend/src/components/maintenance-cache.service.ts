import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

interface TenantCacheEntry {
  id: number;
  sub_domain: string;
  under_maintenance: boolean;
  status: string;
  lastUpdated: number;
  lastAccessed: number;
  expiresAt: number;
}

interface SubdomainCacheEntry {
  tenantId: number;
  lastUpdated: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  updates: number;
  evictions: number;
  subdomainHits: number;
  subdomainMisses: number;
  cacheSize: number;
  subdomainCacheSize: number;
  hitRate: number;
  subdomainHitRate: number;
  ttl_ms: number;
  max_size: number;
}

/**
 * Maintenance Cache Service
 * Ultra-light in-memory cache for tenant maintenance status
 */
@Injectable()
export class MaintenanceCacheService {
  private tenantCache: Map<string, TenantCacheEntry> = new Map();
  private subdomainCache: Map<string, SubdomainCacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    updates: 0,
    evictions: 0,
    subdomainHits: 0,
    subdomainMisses: 0,
    cacheSize: 0,
    subdomainCacheSize: 0,
    hitRate: 0,
    subdomainHitRate: 0,
    ttl_ms: 300_000, // 5 minutes
    max_size: 10_000,
  };

  private readonly CACHE_TTL_MS = 300_000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 10_000;

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Return tenant maintenance record from cache or DB
   */
  async getTenantMaintenanceStatus(tenantId: number): Promise<TenantCacheEntry | null> {
    const key = `tenant_${tenantId}`;
    const now = Date.now();

    // Check cache
    if (this.tenantCache.has(key)) {
      const entry = this.tenantCache.get(key)!;
      if (entry.expiresAt > now) {
        this.stats.hits++;
        entry.lastAccessed = now;
        this.tenantCache.set(key, entry);
        return entry;
      }
      // Expired - remove
      this.tenantCache.delete(key);
      this.stats.evictions++;
    }

    // Cache miss - read from DB
    this.stats.misses++;

    const row = await this.dataSource.query(
      `
      SELECT id, sub_domain, under_maintenance, status
      FROM panel_tenants
      WHERE id = ?
      `,
      [tenantId],
    );

    if (!row || row.length === 0) {
      return null;
    }

    const data: TenantCacheEntry = {
      id: Number(row[0].id),
      sub_domain: String(row[0].sub_domain),
      under_maintenance: Boolean(row[0].under_maintenance),
      status: row[0].status,
      lastUpdated: now,
      lastAccessed: now,
      expiresAt: now + this.CACHE_TTL_MS,
    };

    // Evict oldest if cache is full
    if (this.tenantCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest(100);
    }

    this.tenantCache.set(key, data);
    this.subdomainCache.set(row[0].sub_domain.toLowerCase(), {
      tenantId: data.id,
      lastUpdated: now,
      expiresAt: now + this.CACHE_TTL_MS,
    });

    return data;
  }

  /**
   * Resolve tenantId by subdomain
   */
  async getTenantIdBySubdomain(sub: string): Promise<number | null> {
    sub = sub.toLowerCase().trim();
    if (sub === '') return null;

    const now = Date.now();

    // Check subdomain cache
    if (this.subdomainCache.has(sub)) {
      const entry = this.subdomainCache.get(sub)!;
      if (entry.expiresAt > now) {
        this.stats.subdomainHits++;
        return entry.tenantId;
      }
      this.subdomainCache.delete(sub);
      this.stats.evictions++;
    }

    // DB lookup
    this.stats.subdomainMisses++;

    const row = await this.dataSource.query(
      `
      SELECT id, sub_domain, under_maintenance, status
      FROM panel_tenants
      WHERE sub_domain = ?
      `,
      [sub],
    );

    if (!row || row.length === 0) {
      return null;
    }

    const tenantId = Number(row[0].id);
    const now2 = Date.now();

    this.subdomainCache.set(sub, {
      tenantId,
      lastUpdated: now2,
      expiresAt: now2 + this.CACHE_TTL_MS,
    });

    // Warm the main tenant cache
    this.tenantCache.set(`tenant_${tenantId}`, {
      id: tenantId,
      sub_domain: String(row[0].sub_domain),
      under_maintenance: Boolean(row[0].under_maintenance),
      status: row[0].status,
      lastUpdated: now2,
      lastAccessed: now2,
      expiresAt: now2 + this.CACHE_TTL_MS,
    });

    return tenantId;
  }

  /**
   * Update in-memory cache (after DB update elsewhere)
   */
  updateTenantMaintenanceStatus(tenantId: number, patch: Partial<TenantCacheEntry>): void {
    const key = `tenant_${tenantId}`;
    const now = Date.now();

    if (this.tenantCache.has(key)) {
      const existing = this.tenantCache.get(key)!;
      this.tenantCache.set(key, {
        ...existing,
        ...patch,
        lastUpdated: now,
        expiresAt: now + this.CACHE_TTL_MS,
      });
      this.stats.updates++;
    }
  }

  /**
   * Invalidate tenant from both caches
   */
  invalidateTenant(tenantId: number): void {
    const key = `tenant_${tenantId}`;
    const entry = this.tenantCache.get(key);
    
    if (entry) {
      this.subdomainCache.delete(entry.sub_domain.toLowerCase());
    }
    
    this.tenantCache.delete(key);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const subTotal = this.stats.subdomainHits + this.stats.subdomainMisses;

    const hitRate = total ? Math.round((this.stats.hits / total) * 100 * 100) / 100 : 0;
    const subHitRate = subTotal ? Math.round((this.stats.subdomainHits / subTotal) * 100 * 100) / 100 : 0;

    return {
      ...this.stats,
      cacheSize: this.tenantCache.size,
      subdomainCacheSize: this.subdomainCache.size,
      hitRate,
      subdomainHitRate: subHitRate,
      ttl_ms: this.CACHE_TTL_MS,
      max_size: this.MAX_CACHE_SIZE,
    };
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.tenantCache.clear();
    this.subdomainCache.clear();
  }

  /**
   * Remove oldest N items (LRU eviction)
   */
  private evictOldest(count: number): void {
    if (count <= 0 || this.tenantCache.size === 0) return;

    const entries = Array.from(this.tenantCache.entries());
    entries.sort((a, b) => (a[1].lastUpdated ?? 0) - (b[1].lastUpdated ?? 0));

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.tenantCache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }
}
