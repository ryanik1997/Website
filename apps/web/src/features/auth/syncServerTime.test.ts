import { describe, expect, it, vi } from 'vitest'
import { getSyncServerTime } from '../../../../../packages/db/src/cloud/syncServerTime'

describe('sync server time compatibility', () => {
  it('falls back without advancing an authoritative cursor when migration 031 is missing', async () => {
    const fallbackIso = '2026-07-19T03:00:00.000Z'
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'PGRST202',
          message: 'Could not find the function public.sync_server_time without parameters in the schema cache',
        },
      }),
    }

    await expect(getSyncServerTime(supabase as never, fallbackIso)).resolves.toEqual({
      iso: fallbackIso,
      authoritative: false,
    })
  })

  it('uses the authoritative watermark when the RPC exists', async () => {
    const serverIso = '2026-07-19T03:00:01.000Z'
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: serverIso, error: null }),
    }

    await expect(getSyncServerTime(supabase as never)).resolves.toEqual({
      iso: serverIso,
      authoritative: true,
    })
  })

  it('does not hide unrelated RPC errors', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'permission denied' },
      }),
    }

    await expect(getSyncServerTime(supabase as never)).rejects.toThrow('permission denied')
  })
})
