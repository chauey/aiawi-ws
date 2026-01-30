# Production Checklist - Roblox Game Launch

> **Critical items required before real users and monetization**

---

## 🟢 CRITICAL - Must Have Before Launch

### 1. Data Persistence (DataStoreService)

**Status:** ✅ IMPLEMENTED

Saves all player progress to Roblox DataStore:

- [x] Coins
- [x] Pets owned
- [x] Rebirth count
- [x] Daily reward streak
- [x] Quest progress
- [x] Achievements
- [x] VIP status
- [x] Clan membership
- [x] Maps unlocked

**Implementation:** `src/server/dataStore.ts`

---

### 2. Real Game Pass IDs

**Status:** ❌ PLACEHOLDER IDs

Replace placeholder IDs with real Roblox game pass IDs:

- [ ] `gamePasses.ts` - Update GAME_PASSES with real IDs
- [ ] `premiumPass.ts` - Update PREMIUM_PASS_ID
- [ ] `privateServers.ts` - Update PRIVATE_SERVER_COST to Robux

**After creating in Roblox Studio:**

1. Create game passes in Creator Dashboard
2. Copy IDs to code
3. Test purchases in Studio

---

### 3. Real Asset IDs

**Status:** ❌ PLACEHOLDER ASSETS

Replace placeholder sounds/images:

- [ ] Background music (musicSystem.ts)
- [ ] Sound effects for actions
- [ ] Pet meshes and textures
- [ ] UI icons and images

---

### 4. Rate Limiting

**Status:** ⚠️ PARTIAL

Add rate limits to prevent exploits:

- [ ] Coin collection (max per second)
- [ ] Egg hatching (cooldown)
- [ ] Trading (flood protection)
- [ ] Remote function calls (general)

---

## 🟡 IMPORTANT - Should Have

### 5. Anti-Exploit Measures

- [ ] Server-side position validation
- [ ] Coin collection distance check
- [ ] Speed/teleport detection
- [ ] Remote call frequency limiting

### 6. Error Handling

- [ ] Try-catch around DataStore calls
- [ ] Graceful fallbacks for failed loads
- [ ] User-friendly error messages

### 7. Analytics

- [ ] Track player retention
- [ ] Monitor monetization metrics
- [ ] Log errors for debugging

---

## 🟢 NICE TO HAVE - Polish

### 8. Sound Effects

- [ ] Coin collect sound
- [ ] Level up sound
- [ ] Purchase sounds
- [ ] Achievement unlock

### 9. Animations

- [ ] Pet idle animations
- [ ] Celebration effects
- [ ] UI transitions

### 10. Localization

- [ ] Support multiple languages
- [ ] UI text in separate files

---

## 📋 Launch Day Checklist

1. [ ] All data persistence working
2. [ ] Game passes tested and live
3. [ ] Private servers configured
4. [ ] Game description written
5. [ ] Thumbnail/icon created
6. [ ] Social links added
7. [ ] Age rating set
8. [ ] Moderation enabled
9. [ ] Testing complete
10. [ ] Backup plan ready

---

## 💰 Monetization Setup

### Roblox Creator Dashboard:

1. [ ] Create game passes
2. [ ] Set prices (Robux)
3. [ ] Create developer products
4. [ ] Enable private servers
5. [ ] Configure revenue split

### Recommended Pricing:

| Item           | Suggested Price |
| -------------- | --------------- |
| 2x Coins Pass  | 99 Robux        |
| VIP Pass       | 199 Robux       |
| Premium Pass   | 499 Robux       |
| Private Server | 100 Robux/month |

---

## 🚀 Launch Strategy

### Soft Launch (Week 1):

- Limited release to friends
- Monitor for bugs
- Gather feedback
- Adjust balance

### Marketing (Week 2+):

- Create YouTube trailer
- Share codes on social media
- Partner with Roblox YouTubers
- Run limited events

---

_Last updated: 2026-01-28_
