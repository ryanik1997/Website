# Landing hero mascot

## Hiện tại (v2)
- **Dictionary book** 2.5D: da/foil, page stack, lật mượt
- **Intro** ~3.2s mở–lật một vòng rồi nhường scroll
- **Scroll scrub** có lerp mượt + caption beat
- **5 card** một orbit (tilt + phase), settle khi đóng sách
- Parallax nhẹ con trỏ; dust; reduced-motion

## Khôi phục mặt trời / trăng cũ
Sửa `landingHeroConfig.ts`:

```ts
export const HERO_MASCOT_MODE: HeroMascotMode = 'sun'
```

File backup: `LegacySunMascot.tsx` (không xóa).
