'use client';

import React, { useState } from 'react';
import { UpgradedScoringEngine, Route } from '../engine/UpgradedScoringEngine';

const mockRoutes: Route[] = [
  {
    id: 'route-kmb-direct',
    segments: [
      { operator: 'KMB', routeName: '234X', rideTimeMinutes: 38, scheduledIntervalMinutes: 10, isEtaFresh: true, realtimeEtaMinutes: 3 }
    ],
    walkTransferTimeMinutes: 2,
    longDistanceTransferSurcharge: 0
  },
  {
    id: 'route-kmb-transfer',
    segments: [
      { operator: 'KMB', routeName: '39A', rideTimeMinutes: 10, scheduledIntervalMinutes: 8, isEtaFresh: true, realtimeEtaMinutes: 2 },
      { operator: 'KMB', routeName: '30X', rideTimeMinutes: 28, scheduledIntervalMinutes: 12, isEtaFresh: true, realtimeEtaMinutes: 5 }
    ],
    walkTransferTimeMinutes: 3,
    longDistanceTransferSurcharge: 0
  },
  {
    id: 'route-mtr',
    segments: [
      { operator: 'MTR', routeName: '荃灣綫', rideTimeMinutes: 30, scheduledIntervalMinutes: 3, isEtaFresh: false }
    ],
    walkTransferTimeMinutes: 8,
    longDistanceTransferSurcharge: 5
  }
];

export default function Home() {
  const [start, setStart] = useState('荃威花園');
  const [end, setEnd] = useState('尖沙咀碼頭');

  const scoredRoutes = mockRoutes.map(route => ({
    ...route,
    score: UpgradedScoringEngine.calculateRouteScore(route)
  })).sort((a, b) => a.score.finalScore - b.score.finalScore);

  return (
    <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#000', padding: '16px', borderBottom: '1px solid #222' }}>
        <div style={{ backgroundColor: '#1e1e1e', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00d06c' }}></span>
            <input value={start} onChange={(e) => setStart(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }} />
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e2001a' }}></span>
            <input value={end} onChange={(e) => setEnd(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }} />
          </div>
        </div>
      </header>

      <main style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {scoredRoutes.map((route, index) => (
          <div key={route.id} style={{ backgroundColor: '#1e1e1e', borderRadius: '16px', padding: '16px', border: '1px solid #2a2a2a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d06c' }}>
                {index === 0 ? '最佳推薦' : '方案 ' + (index + 1)}
              </span>
              <span style={{ backgroundColor: 'rgba(0, 208, 108, 0.15)', color: '#00d06c', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                代價分: {route.score.finalScore}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
              {route.segments.map((seg, i) => {
                let bg = '#e2001a';
                if (seg.operator === 'LWB') bg = '#ff8000';
                if (seg.operator === 'MTR') bg = '#990000';
                if (seg.operator === 'CTB') bg = '#f39c12';
                return (
                  <React.Fragment key={i}>
                    <span style={{ backgroundColor: bg, color: seg.operator === 'CTB' ? '#000' : '#fff', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                      {seg.operator} {seg.routeName}
                    </span>
                    {i < route.segments.length - 1 && <span style={{ color: '#a0a0a0', fontSize: '12px' }}>➔</span>}
                  </React.Fragment>
                );
              })}
            </div>

            <div style={{ backgroundColor: '#121212', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#a0a0a0', lineHeight: '1.5' }}>
              行程小計: {route.score.legSubtotal} 分 | 轉車懲罰: {route.score.transferPenalty} 分<br />
              步行負擔: {route.score.walkTransferTime} 分 | 附加費: {route.score.longDistanceSurcharge} 分
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
