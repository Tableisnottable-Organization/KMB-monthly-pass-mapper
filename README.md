# Transit Compass HK / 香港出行地圖

Transit Compass HK is an independent, operator-neutral Hong Kong journey
planning prototype. Transport operators are shown only as data and service
metadata; no operator logo, operator identity, or operator product is used as
the product brand or sales message.

一個香港公共交通路線比較原型，協助使用者在出發前評估路線選擇、轉乘負擔、月票價值和即時到站資料風險。

## 網站做咩

網站主要提供以下功能：

- 透過香港地圖和地點搜尋，比較起點與終點之間的不同路線。
- 使用加權評分，綜合行車時間、等車時間、轉車次數、步行負擔和營運商偏好，排列路線優先次序。
- 透過月票收益分析，協助判斷日常出行是否值得購買月票。
- 顯示地圖、地點搜尋、交通通告和路線更新，讓使用者在出發前了解交通情況。

首頁會列出候選路線、標示較合適的選擇，並展示車費、轉車次數、班次頻率和到站預估等實用資料。

## 新評分權重方法

路線評分採用「越低越好」的代價型模型。每段行程會先計算時間成本和營運商調整值，然後再把整條路線的轉車及步行負擔加入總分。

### 評分概念

- 每段分數 = 行車時間 + ETA 分量 + 營運商調整值
- ETA 分量 = 有效而且新鮮的即時 ETA；否則使用班次頻率估算值
- 全程分數 = 各段小計 + 步行轉乘時間 + 長距離轉乘附加費 + 轉車懲罰

目前評分邏輯位於 `src/engine/UpgradedScoringEngine.ts`。

### 主要規則

- 時段乘數會按照香港時間調整：
  - 深夜（23:00-05:50）：1.8
  - 繁忙時間（07:00-09:30 及 17:00-19:30）：1.0
  - 非繁忙時間：1.3
- 排班 ETA 分量：`scheduledIntervalMinutes * 0.5 * segmentMultiplier`
- 即時 ETA 只有在資料足夠新鮮時才會使用；過期資料會被忽略，避免使用失效資料評分。
- 營運商調整值：
  - 九巴（KMB）：-1
  - 龍運（LWB）：-0.46
  - 港鐵（MTR）：0.5
  - 城巴（CTB）：1
- 轉車懲罰：`transferCount * 8` 分鐘
- 步行轉乘懲罰：`walkTransferTimeMinutes`
- 長距離轉乘，或中環／香港站等特定轉乘情況，可能會增加附加費。

整條路線的概括公式：

```text
finalScore = legSubtotal + walkTransferTimeMinutes + longDistanceTransferSurcharge + transferCount * 8
```

因此，網站並非只按照最快時間選路，而是同時考慮行車時間、候車時間、轉車摩擦、步行負擔和營運商偏好，較貼近日常通勤決策。

## 項目狀態

目前仍屬原型階段，示範路線結果會與正式交通資料來源分開處理。項目已提供交通 API 和來源標註，但只有在供應商合約、資料更新時間和資料品質檢查完成後，才應將路線稱為真正的即時交通資料。

## API 及資料來源

應用程式提供路線、到站預估、交通更新和交通事件相關 API，相關實作位於 `src/app/api/*`。

實作採用嚴格的上游白名單，不會把上游服務故障靜默轉換成虛假的即時資料。

## 本地開發

```bash
npm install
npm run dev
```

然後在瀏覽器開啟本地應用程式。

## 部署

本項目針對 Cloudflare/OpenNext 環境建立。

```bash
npm run build
npm run cf:build
npx wrangler deploy
```

## English

# Transit Compass HK

A Hong Kong public transport route comparison prototype that helps users evaluate route choices, transfer burden, monthly-pass value, and live ETA risk before travelling.

## What the web does

The web app:

- Compares route alternatives between an origin and destination using Hong Kong maps and place search.
- Ranks routes with a weighted score covering journey time, waiting time, transfer count, walking burden, and operator preference.
- Uses monthly-pass insight to help users decide whether a pass is worthwhile for their regular journeys.
- Shows maps, place search, traffic notices, and route updates so users can check conditions before departure.

The home page presents a shortlist of routes, highlights a suitable option, and shows practical details such as fare, transfer count, service interval, and ETA context.

## New score weighting method

The route score is a cost-like heuristic where lower is better. Each leg first contributes its time cost and operator adjustment, then the route adds transfer and walking burden.

### Scoring overview

- Leg score = journey time + ETA component + operator adjustment
- ETA component = fresh, valid live ETA; otherwise a scheduled headway estimate
- Route score = leg subtotal + walking transfer time + long-distance transfer surcharge + transfer penalty

The current scoring logic is defined in `src/engine/UpgradedScoringEngine.ts`.

### Key rules

- The time-of-day multiplier uses Hong Kong time:
  - Late night (23:00-05:50): 1.8
  - Peak (07:00-09:30 and 17:00-19:30): 1.0
  - Off-peak: 1.3
- Scheduled ETA component: `scheduledIntervalMinutes * 0.5 * segmentMultiplier`
- Live ETA is used only when it is fresh enough. Stale data is ignored so outdated information does not distort the ranking.
- Operator adjustments:
  - KMB: -1
  - LWB: -0.46
  - MTR: 0.5
  - CTB: 1
- Transfer penalty: `transferCount * 8` minutes
- Walking transfer penalty: `walkTransferTimeMinutes`
- Long-distance transfers, including selected Central/Hong Kong station transitions, may receive an additional surcharge.

The route-level formula is:

```text
finalScore = legSubtotal + walkTransferTimeMinutes + longDistanceTransferSurcharge + transferCount * 8
```

The web therefore does not choose routes using speed alone. It combines journey time, waiting time, transfer friction, walking burden, and operator preference to reflect practical commuter decisions.

## Project status

This is still a prototype. Demo route results are intentionally kept separate from production transport feeds. The project exposes transit APIs and includes source attribution, but a route should only be described as live after provider contracts, update timing, and data quality have been validated.

## API and data sources

The app provides route, ETA, traffic update, and traffic event APIs. The relevant handlers are under `src/app/api/*`.

The implementation uses strict upstream allowlists and does not silently turn an upstream outage into fake real-time data.

## Local development

```bash
npm install
npm run dev
```

Then open the local application in a browser.

## Deployment

This project is built for a Cloudflare/OpenNext environment.

```bash
npm run build
npm run cf:build
npx wrangler deploy
```
